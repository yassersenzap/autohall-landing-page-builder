import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Campaign,
  LandingPage,
  LeadEventStatus,
  LeadRequestType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicLeadDto } from './dto/create-public-lead.dto';
import { ListLeadEventsQueryDto } from './dto/list-lead-events-query.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import {
  leadEventDetailInclude,
  toLeadEventDetail,
  type LeadEventDetail,
} from './lead-event.mapper';

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
  status: LeadEventStatus;
  sourceUrl: string;
  createdAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

@Injectable()
export class LeadEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublicLead(
    dto: CreatePublicLeadDto,
    requestMeta: { userAgent?: string; ipAddress?: string },
  ): Promise<PublicLeadCreated> {
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

    const rawPayload = {
      submittedAt: new Date().toISOString(),
      pageVersionId: dto.pageVersionId ?? null,
      campaignSlug: dto.campaignSlug ?? null,
      landingSlug: dto.landingSlug ?? landingPage.slug,
      vehicleModel: dto.vehicleModel ?? null,
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
        message: dto.message?.trim() || null,
        sourceUrl: dto.sourceUrl?.trim() || 'static-landing',
        userAgent: requestMeta.userAgent ?? null,
        ipAddress: requestMeta.ipAddress ?? null,
        rawPayload,
        status: LeadEventStatus.RECEIVED,
      },
    });

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

    const [items, total] = await Promise.all([
      this.prisma.leadEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          campaign: { select: { name: true } },
          landingPage: { select: { title: true, slug: true } },
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

  async updateStatus(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Promise<LeadEventDetail> {
    await this.ensureLeadExists(id);

    const data: Prisma.LeadEventUpdateInput = {
      status: dto.status,
    };

    if (dto.internalComment !== undefined) {
      data.internalComment = dto.internalComment.trim() || null;
    }

    const lead = await this.prisma.leadEvent.update({
      where: { id },
      data,
      include: leadEventDetailInclude,
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

  private toListItem(
    item: {
      id: string;
      campaignId: string;
      landingPageId: string;
      fullName: string;
      phone: string;
      email: string | null;
      brand: string | null;
      model: string | null;
      requestType: LeadRequestType;
      status: LeadEventStatus;
      sourceUrl: string;
      createdAt: Date;
      campaign: { name: string };
      landingPage: { title: string; slug: string };
    },
  ): LeadEventListItem {
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
      status: item.status,
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
    } else {
      throw new BadRequestException({
        success: false,
        message: 'landingPageId or landingSlug is required',
        code: 'VALIDATION_ERROR',
      });
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
}
