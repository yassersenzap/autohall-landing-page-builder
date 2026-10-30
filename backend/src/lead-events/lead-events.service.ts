import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import {
  Campaign,
  LandingPage,
  LeadEventStatus,
  LeadHistoryEventType,
  LeadPriority,
  LeadRequestType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicLeadDto } from './dto/create-public-lead.dto';
import { ListLeadEventsQueryDto } from './dto/list-lead-events-query.dto';
import { UpdateLeadFollowUpDto } from './dto/update-lead-follow-up.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import {
  buildFollowUpActivityNote,
  formatFollowUpDate,
  formatPriorityLabel,
} from './lead-follow-up.helper';
import {
  isFollowUpOverdue,
  leadEventDetailInclude,
  toLeadEventDetail,
  type LeadEventDetail,
} from './lead-event.mapper';
import {
  CONTACTED_STATUSES,
  getStartOfToday,
  getStartOfWeek,
  overdueFollowUpWhere,
} from './lead-dashboard.helper';
import type { LeadDashboardKpis } from './lead-dashboard.types';
import {
  leadStatusHistoryInclude,
  toLeadStatusHistoryItem,
  type LeadStatusHistoryItem,
} from './lead-status-history.mapper';

type ResolvedLeadContext = {
  campaign: Campaign;
  landingPage: LandingPage;
};

export type PublicLeadCreated = {
  leadId: string;
  status: LeadEventStatus;
};

export type LeadEventListItem = {
  id: string;
  campaignId: string;
  landingPageId: string;
  fullName: string;
  phone: string;
  email: string | null;
  brand: string | null;
  model: string | null;
  requestType: LeadRequestType;
  preferredDate: string | null;
  status: LeadEventStatus;
  priority: LeadPriority;
  assignedToUserId: string | null;
  assignedToName: string | null;
  nextFollowUpAt: string | null;
  isFollowUpOverdue: boolean;
  sourceUrl: string;
  createdAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

export type AssignableUserItem = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

function resolveExportSourceLabel(sourceUrl: string | null): string {
  if (!sourceUrl) return '';
  if (
    sourceUrl.includes('offline-export.autohall') ||
    sourceUrl.includes('offline-test.autohall')
  ) {
    return 'Export ZIP';
  }
  if (sourceUrl.includes('localhost') || sourceUrl.includes('127.0.0.1')) {
    return 'Builder (local)';
  }
  try {
    const url = new URL(sourceUrl);
    return url.hostname;
  } catch {
    return sourceUrl.slice(0, 40);
  }
}

@Injectable()
export class LeadEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublicLead(
    dto: CreatePublicLeadDto,
    requestMeta: { userAgent?: string; ipAddress?: string },
  ): Promise<PublicLeadCreated> {
    console.log('[Leads] createPublicLead →', {
      fullName: dto.fullName,
      phone: dto.phone,
      campaignId: dto.campaignId ?? null,
      landingPageId: dto.landingPageId ?? null,
      landingSlug: dto.landingSlug ?? null,
    });

    const { campaign, landingPage } = await this.resolveLeadContext(dto);

    if (dto.pageVersionId) {
      const pageVersion = await this.prisma.pageVersion.findFirst({
        where: {
          id: dto.pageVersionId,
          landingPageId: landingPage.id,
        },
      });

      if (!pageVersion) {
        throw new NotFoundException({
          success: false,
          message: 'Page version not found for this landing page',
          code: 'PAGE_VERSION_NOT_FOUND',
        });
      }
    }

    // Resolve preferredDate: explicit DTO field takes priority,
    // fallback to common date field IDs in rawPayload.
    const rawClient = dto.rawPayload as Record<string, unknown> | undefined;
    const rawDateStr: string | null =
      dto.preferredDate?.trim() ||
      (typeof rawClient?.preferredDate === 'string' ? rawClient.preferredDate : null) ||
      (typeof rawClient?.f_date === 'string' ? rawClient.f_date : null) ||
      (typeof rawClient?.testDate === 'string' ? rawClient.testDate : null) ||
      (typeof rawClient?.date === 'string' ? rawClient.date : null) ||
      null;

    let preferredDateValue: Date | null = null;
    if (rawDateStr) {
      const parsed = new Date(rawDateStr);
      if (!Number.isNaN(parsed.getTime())) {
        preferredDateValue = parsed;
      }
    }

    const rawPayload = {
      submittedAt: new Date().toISOString(),
      pageVersionId: dto.pageVersionId ?? null,
      campaignSlug: dto.campaignSlug ?? null,
      landingSlug: dto.landingSlug ?? landingPage.slug,
      vehicleModel: dto.vehicleModel ?? null,
      preferredDate: rawDateStr ?? null,
      clientPayload: dto.rawPayload ?? null,
      metadata: dto.metadata ?? null,
    } as Prisma.InputJsonValue;

    const lead = await this.prisma.leadEvent.create({
      data: {
        campaignId: campaign.id,
        landingPageId: landingPage.id,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        city: dto.city?.trim() || null,
        brand: dto.brand?.trim() || campaign.brand,
        model: dto.vehicleModel?.trim() || null,
        requestType: dto.requestType ?? LeadRequestType.TEST_DRIVE,
        preferredDate: preferredDateValue,
        message: dto.message?.trim() || null,
        sourceUrl: dto.sourceUrl?.trim() || 'static-landing',
        userAgent: requestMeta.userAgent ?? null,
        ipAddress: requestMeta.ipAddress ?? null,
        rawPayload,
        status: LeadEventStatus.RECEIVED,
      },
    });

    console.log('[Leads] Lead créé ✓', { id: lead.id, status: lead.status, campaignId: lead.campaignId, landingPageId: lead.landingPageId });

    return {
      leadId: lead.id,
      status: lead.status,
    };
  }

  async findAllForAdmin(query: ListLeadEventsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadEventWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query.landingPageId) {
      where.landingPageId = query.landingPageId;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.assignedToUserId) {
      where.assignedToUserId = query.assignedToUserId;
    }

    if (query.overdueOnly) {
      where.nextFollowUpAt = { lt: new Date() };
      where.status = {
        notIn: [LeadEventStatus.ARCHIVED, LeadEventStatus.REJECTED],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.leadEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          campaign: { select: { name: true } },
          landingPage: { select: { title: true, slug: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.leadEvent.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toListItem(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOneById(id: string): Promise<LeadEventDetail> {
    const lead = await this.prisma.leadEvent.findUnique({
      where: { id },
      include: leadEventDetailInclude,
    });

    if (!lead) {
      throw new NotFoundException({
        success: false,
        message: 'Lead event not found',
        code: 'LEAD_EVENT_NOT_FOUND',
      });
    }

    return toLeadEventDetail(lead);
  }

  async findStatusHistory(
    leadEventId: string,
  ): Promise<LeadStatusHistoryItem[]> {
    await this.ensureLeadExists(leadEventId);

    const rows = await this.prisma.leadStatusHistory.findMany({
      where: { leadEventId },
      orderBy: { changedAt: 'desc' },
      include: leadStatusHistoryInclude,
    });

    return rows.map((row) => toLeadStatusHistoryItem(row));
  }

  async updateStatus(
    id: string,
    dto: UpdateLeadStatusDto,
    changedByUserId?: string,
  ): Promise<LeadEventDetail> {
    const existing = await this.prisma.leadEvent.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        internalComment: true,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Lead event not found',
        code: 'LEAD_EVENT_NOT_FOUND',
      });
    }

    const nextInternalComment =
      dto.internalComment !== undefined
        ? dto.internalComment.trim() || null
        : existing.internalComment;

    const statusChanged = existing.status !== dto.status;

    const lead = await this.prisma.$transaction(async (tx) => {
      if (statusChanged) {
        await tx.leadStatusHistory.create({
          data: {
            leadEventId: id,
            previousStatus: existing.status,
            newStatus: dto.status,
            internalComment: nextInternalComment,
            changedByUserId: changedByUserId ?? null,
          },
        });
      }

      return tx.leadEvent.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === LeadEventStatus.CONTACTED
            ? { lastContactAt: new Date() }
            : {}),
          ...(dto.internalComment !== undefined
            ? { internalComment: nextInternalComment }
            : {}),
        },
        include: leadEventDetailInclude,
      });
    });

    return toLeadEventDetail(lead);
  }

  async findAssignableUsers(): Promise<AssignableUserItem[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [UserRole.ADMIN, UserRole.SI_DIGITAL, UserRole.MARKETER],
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return users;
  }

  async updateFollowUp(
    id: string,
    dto: UpdateLeadFollowUpDto,
    changedByUserId?: string,
  ): Promise<LeadEventDetail> {
    const hasUpdate =
      dto.assignedToUserId !== undefined ||
      dto.priority !== undefined ||
      dto.nextFollowUpAt !== undefined;

    if (!hasUpdate) {
      throw new BadRequestException({
        success: false,
        message: 'At least one follow-up field must be provided',
        code: 'VALIDATION_ERROR',
      });
    }

    const existing = await this.prisma.leadEvent.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Lead event not found',
        code: 'LEAD_EVENT_NOT_FOUND',
      });
    }

    const changes: string[] = [];
    const updateData: Prisma.LeadEventUpdateInput = {};

    if (dto.assignedToUserId !== undefined) {
      if (dto.assignedToUserId === null) {
        updateData.assignedTo = { disconnect: true };
        if (existing.assignedTo) {
          changes.push(
            `Assignation : ${existing.assignedTo.fullName} → Non assigné`,
          );
        }
      } else {
        const assignee = await this.prisma.user.findFirst({
          where: {
            id: dto.assignedToUserId,
            isActive: true,
            role: {
              in: [UserRole.ADMIN, UserRole.SI_DIGITAL, UserRole.MARKETER],
            },
          },
          select: { id: true, fullName: true },
        });

        if (!assignee) {
          throw new BadRequestException({
            success: false,
            message: 'Assigned user not found or not eligible',
            code: 'ASSIGNEE_NOT_FOUND',
          });
        }

        if (existing.assignedToUserId !== assignee.id) {
          const previousName = existing.assignedTo?.fullName ?? 'Non assigné';
          changes.push(`Assignation : ${previousName} → ${assignee.fullName}`);
        }

        updateData.assignedTo = { connect: { id: assignee.id } };
      }
    }

    if (dto.priority !== undefined && dto.priority !== existing.priority) {
      changes.push(
        `Priorité : ${formatPriorityLabel(existing.priority)} → ${formatPriorityLabel(dto.priority)}`,
      );
      updateData.priority = dto.priority;
    }

    if (dto.nextFollowUpAt !== undefined) {
      const nextDate = dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null;

      if (nextDate && Number.isNaN(nextDate.getTime())) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid nextFollowUpAt date',
          code: 'VALIDATION_ERROR',
        });
      }

      const previousLabel = formatFollowUpDate(existing.nextFollowUpAt);
      const nextLabel = formatFollowUpDate(nextDate);

      if (existing.nextFollowUpAt?.toISOString() !== nextDate?.toISOString()) {
        changes.push(`Prochaine relance : ${previousLabel} → ${nextLabel}`);
      }

      updateData.nextFollowUpAt = nextDate;
    }

    if (changes.length === 0) {
      return this.findOneById(id);
    }

    const activityNote = buildFollowUpActivityNote(changes);

    const lead = await this.prisma.$transaction(async (tx) => {
      await tx.leadStatusHistory.create({
        data: {
          leadEventId: id,
          eventType: LeadHistoryEventType.FOLLOW_UP_UPDATE,
          previousStatus: existing.status,
          newStatus: existing.status,
          activityNote,
          changedByUserId: changedByUserId ?? null,
        },
      });

      return tx.leadEvent.update({
        where: { id },
        data: updateData,
        include: leadEventDetailInclude,
      });
    });

    return toLeadEventDetail(lead);
  }

  private async ensureLeadExists(id: string): Promise<void> {
    const exists = await this.prisma.leadEvent.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException({
        success: false,
        message: 'Lead event not found',
        code: 'LEAD_EVENT_NOT_FOUND',
      });
    }
  }

  private toListItem(item: {
    id: string;
    campaignId: string;
    landingPageId: string;
    fullName: string;
    phone: string;
    email: string | null;
    brand: string | null;
    model: string | null;
    requestType: LeadRequestType;
    preferredDate: Date | null;
    status: LeadEventStatus;
    priority: LeadPriority;
    assignedToUserId: string | null;
    nextFollowUpAt: Date | null;
    sourceUrl: string;
    createdAt: Date;
    campaign: { name: string };
    landingPage: { title: string; slug: string };
    assignedTo: { id: string; fullName: string } | null;
  }): LeadEventListItem {
    return {
      id: item.id,
      campaignId: item.campaignId,
      landingPageId: item.landingPageId,
      fullName: item.fullName,
      phone: item.phone,
      email: item.email,
      brand: item.brand,
      model: item.model,
      requestType: item.requestType,
      preferredDate: item.preferredDate?.toISOString() ?? null,
      status: item.status,
      priority: item.priority,
      assignedToUserId: item.assignedToUserId,
      assignedToName: item.assignedTo?.fullName ?? null,
      nextFollowUpAt: item.nextFollowUpAt?.toISOString() ?? null,
      isFollowUpOverdue: isFollowUpOverdue(item.nextFollowUpAt, item.status),
      sourceUrl: item.sourceUrl,
      createdAt: item.createdAt.toISOString(),
      campaignName: item.campaign.name,
      landingPageTitle: item.landingPage.title,
      landingPageSlug: item.landingPage.slug,
    };
  }

  private async resolveLeadContext(
    dto: CreatePublicLeadDto,
  ): Promise<ResolvedLeadContext> {
    let landingPage: (LandingPage & { campaign: Campaign }) | null = null;

    if (dto.landingPageId) {
      landingPage = await this.prisma.landingPage.findUnique({
        where: { id: dto.landingPageId },
        include: { campaign: true },
      });
    } else if (dto.landingSlug?.trim()) {
      landingPage = await this.prisma.landingPage.findUnique({
        where: { slug: dto.landingSlug.trim() },
        include: { campaign: true },
      });
    } else if (dto.campaignId) {
      // Fallback : on cherche la landing page la plus récente pour cette campagne
      landingPage = await this.prisma.landingPage.findFirst({
        where: { campaignId: dto.campaignId },
        orderBy: { updatedAt: 'desc' },
        include: { campaign: true },
      });
      if (!landingPage) {
        throw new NotFoundException({
          success: false,
          message: 'Aucune landing page trouvée pour cette campagne',
          code: 'LANDING_PAGE_NOT_FOUND',
        });
      }
    } else {
      // Fallback : aucun identifiant de contexte fourni (page exportée sans config,
      // formulaire PHP externe, test manuel). On rattache à la landing page active
      // la plus récemment mise à jour pour ne jamais perdre le lead.
      landingPage = await this.prisma.landingPage.findFirst({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        include: { campaign: true },
      });

      if (!landingPage) {
        throw new BadRequestException({
          success: false,
          message:
            'landingPageId, landingSlug ou campaignId est requis — aucune landing page disponible en fallback',
          code: 'VALIDATION_ERROR',
        });
      }

      console.warn(
        '[Leads] createPublicLead — aucun contexte fourni, rattaché en fallback à:',
        { landingPageId: landingPage.id, slug: landingPage.slug },
      );
    }


    if (!landingPage) {
      throw new NotFoundException({
        success: false,
        message: 'Landing page not found',
        code: 'LANDING_PAGE_NOT_FOUND',
      });
    }

    if (dto.campaignId && dto.campaignId !== landingPage.campaignId) {
      throw new BadRequestException({
        success: false,
        message: 'campaignId does not match the landing page',
        code: 'LEAD_CONTEXT_MISMATCH',
      });
    }

    return {
      campaign: landingPage.campaign,
      landingPage,
    };
  }

  async getDashboardKpis(): Promise<LeadDashboardKpis> {
    const startOfToday = getStartOfToday();
    const startOfWeek = getStartOfWeek();
    const overdueWhere = overdueFollowUpWhere();

    const [
      totalLeads,
      receivedToday,
      receivedThisWeek,
      overdueFollowUps,
      contactedCount,
      statusGroups,
      priorityGroups,
      campaignGroups,
      landingGroups,
      overdueLeadsRaw,
    ] = await Promise.all([
      this.prisma.leadEvent.count(),
      this.prisma.leadEvent.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.leadEvent.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      this.prisma.leadEvent.count({ where: overdueWhere }),
      this.prisma.leadEvent.count({
        where: { status: { in: CONTACTED_STATUSES } },
      }),
      this.prisma.leadEvent.groupBy({
        by: ['status'],
        _count: { _all: true },
        orderBy: { _count: { status: 'desc' } },
      }),
      this.prisma.leadEvent.groupBy({
        by: ['priority'],
        _count: { _all: true },
        orderBy: { _count: { priority: 'desc' } },
      }),
      this.prisma.leadEvent.groupBy({
        by: ['campaignId'],
        _count: { _all: true },
        orderBy: { _count: { campaignId: 'desc' } },
        take: 10,
      }),
      this.prisma.leadEvent.groupBy({
        by: ['landingPageId'],
        _count: { _all: true },
        orderBy: { _count: { landingPageId: 'desc' } },
        take: 10,
      }),
      this.prisma.leadEvent.findMany({
        where: overdueWhere,
        orderBy: { nextFollowUpAt: 'asc' },
        take: 10,
        include: {
          campaign: { select: { name: true } },
          landingPage: { select: { title: true } },
        },
      }),
    ]);

    const campaignIds = campaignGroups.map((g) => g.campaignId);
    const landingIds = landingGroups.map((g) => g.landingPageId);

    const [campaigns, landingPages] = await Promise.all([
      campaignIds.length
        ? this.prisma.campaign.findMany({
            where: { id: { in: campaignIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      landingIds.length
        ? this.prisma.landingPage.findMany({
            where: { id: { in: landingIds } },
            select: { id: true, title: true, slug: true },
          })
        : Promise.resolve([]),
    ]);

    const campaignNameById = new Map(campaigns.map((c) => [c.id, c.name]));
    const landingById = new Map(landingPages.map((l) => [l.id, l]));

    const contactedRatePercent =
      totalLeads > 0
        ? Math.round((contactedCount / totalLeads) * 1000) / 10
        : 0;

    return {
      totalLeads,
      receivedToday,
      receivedThisWeek,
      overdueFollowUps,
      contactedRatePercent,
      byStatus: statusGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      byPriority: priorityGroups.map((g) => ({
        priority: g.priority,
        count: g._count._all,
      })),
      byCampaign: campaignGroups.map((g) => ({
        campaignId: g.campaignId,
        campaignName: campaignNameById.get(g.campaignId) ?? 'Campagne inconnue',
        count: g._count._all,
      })),
      byLandingPage: landingGroups.map((g) => {
        const landing = landingById.get(g.landingPageId);
        return {
          landingPageId: g.landingPageId,
          title: landing?.title ?? 'Landing inconnue',
          slug: landing?.slug ?? '—',
          count: g._count._all,
        };
      }),
      overdueLeads: overdueLeadsRaw.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName,
        status: lead.status,
        priority: lead.priority,
        nextFollowUpAt: lead.nextFollowUpAt!.toISOString(),
        campaignName: lead.campaign.name,
        landingPageTitle: lead.landingPage.title,
      })),
    };
  }

  async exportLeadsExcel(query: ListLeadEventsQueryDto): Promise<Buffer> {
    const where: Prisma.LeadEventWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query.landingPageId) {
      where.landingPageId = query.landingPageId;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.assignedToUserId) {
      where.assignedToUserId = query.assignedToUserId;
    }

    if (query.overdueOnly) {
      where.nextFollowUpAt = { lt: new Date() };
      where.status = {
        notIn: [LeadEventStatus.ARCHIVED, LeadEventStatus.REJECTED],
      };
    }

    const items = await this.prisma.leadEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { name: true } },
      },
    });

    const STATUS_LABELS: Record<string, string> = {
      RECEIVED: 'Nouveau',
      CONTACTED: 'Contacté',
      QUALIFIED: 'Qualifié',
      REJECTED: 'Rejeté',
      ARCHIVED: 'Archivé',
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AutoHall Landing Studio';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Leads', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'Date création', key: 'date', width: 14 },
      { header: 'Campagne', key: 'campagne', width: 24 },
      { header: 'Modèle', key: 'modele', width: 20 },
      { header: 'Ville', key: 'ville', width: 16 },
      { header: 'Nom', key: 'nom', width: 18 },
      { header: 'Prénom', key: 'prenom', width: 18 },
      { header: 'Téléphone', key: 'telephone', width: 16 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Date test drive', key: 'dateTestDrive', width: 16 },
      { header: 'Consentement', key: 'consentement', width: 14 },
      { header: 'Source', key: 'source', width: 26 },
      { header: 'Statut', key: 'statut', width: 14 },
    ];

    // Bold header row with light background
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8E8E8' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 22;

    for (const item of items) {
      const raw = item.rawPayload as Record<string, unknown> | null;
      const consent = raw?.consent;
      const consentStr =
        consent === true || consent === 'true'
          ? 'Oui'
          : consent === false || consent === 'false'
            ? 'Non'
            : '';

      const parts = (item.fullName ?? '').trim().split(/\s+/);
      let lastName = '';
      let firstName = '';
      if (parts.length > 1) {
        lastName = (parts.pop() ?? '').toUpperCase();
        firstName = parts.join(' ');
      } else {
        firstName = parts[0] ?? '';
      }

      const preferredDateStr = item.preferredDate
        ? new Date(item.preferredDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : ((raw?.preferredDate as string) ?? (raw?.f_date as string) ?? '');

      sheet.addRow({
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        campagne: item.campaign?.name ?? '',
        modele: item.model ?? (raw?.vehicleModel as string) ?? '',
        ville: item.city ?? (raw?.city as string) ?? '',
        nom: lastName,
        prenom: firstName,
        telephone: item.phone,
        email: item.email ?? '',
        dateTestDrive: preferredDateStr,
        consentement: consentStr,
        source: resolveExportSourceLabel(item.sourceUrl),
        statut: STATUS_LABELS[item.status] ?? item.status,
      });
    }

    // Auto-fit column widths based on actual content
    sheet.columns.forEach((col) => {
      let maxLen = String(col.header ?? '').length;
      if (col.eachCell) {
        col.eachCell({ includeEmpty: false }, (cell) => {
          const len = String(cell.value ?? '').length;
          if (len > maxLen) maxLen = len;
        });
      }
      col.width = Math.min(Math.max(maxLen + 3, 10), 50);
    });

    // Auto-filter on header row
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Supprime tous les leads (table lead_events uniquement — cascade sur l'historique). */
  async purgeAllLeads(): Promise<{ deletedCount: number }> {
    const result = await this.prisma.leadEvent.deleteMany({});
    return { deletedCount: result.count };
  }
}
