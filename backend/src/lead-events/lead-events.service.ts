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
  model: string | null;
  requestType: LeadRequestType;
  status: LeadEventStatus;
  sourceUrl: string;
  createdAt: string;
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

    const [items, total] = await Promise.all([
      this.prisma.leadEvent.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          campaignId: true,
          landingPageId: true,
          fullName: true,
          phone: true,
          email: true,
          model: true,
          requestType: true,
          status: true,
          sourceUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.leadEvent.count(),
    ]);

    return {
      data: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
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
