import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LandingPage, LandingPageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { ListLandingPagesQueryDto } from './dto/list-landing-pages-query.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';

type LandingPageCreator = {
  id: string;
  fullName: string;
};

export type LandingPageListItem = {
  id: string;
  campaignId: string;
  title: string;
  slug: string;
  status: LandingPageStatus;
  lastExportedAt: string | null;
  createdAt: string;
};

export type LandingPageDetail = LandingPageListItem & {
  publicBaseUrl: string | null;
  updatedAt: string;
  createdBy: LandingPageCreator;
};

@Injectable()
export class LandingPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(campaignId: string, query: ListLandingPagesQueryDto) {
    await this.ensureCampaignExists(campaignId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LandingPageWhereInput = { campaignId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.landingPage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.landingPage.count({ where }),
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

  async findOne(campaignId: string, id: string): Promise<LandingPageDetail> {
    const landingPage = await this.findLandingPageForCampaign(campaignId, id);

    return this.toDetail(landingPage);
  }

  async create(
    campaignId: string,
    dto: CreateLandingPageDto,
    createdById: string,
  ) {
    await this.ensureCampaignExists(campaignId);

    try {
      const landingPage = await this.prisma.landingPage.create({
        data: {
          campaignId,
          title: dto.title.trim(),
          slug: this.normalizeSlug(dto.slug),
          publicBaseUrl: dto.publicBaseUrl?.trim() || null,
          status: dto.status ?? LandingPageStatus.DRAFT,
          createdById,
        },
      });

      return this.toListItem(landingPage);
    } catch (error) {
      this.rethrowUniqueSlugConflict(error);
      throw error;
    }
  }

  async update(campaignId: string, id: string, dto: UpdateLandingPageDto) {
    await this.findLandingPageForCampaign(campaignId, id);

    try {
      const landingPage = await this.prisma.landingPage.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          slug:
            dto.slug === undefined ? undefined : this.normalizeSlug(dto.slug),
          publicBaseUrl:
            dto.publicBaseUrl === undefined
              ? undefined
              : dto.publicBaseUrl?.trim() || null,
          status: dto.status,
        },
      });

      return this.toListItem(landingPage);
    } catch (error) {
      this.rethrowUniqueSlugConflict(error);
      throw error;
    }
  }

  /** Archivage logique (pas de suppression physique — versions et leads liés). */
  async archive(campaignId: string, id: string) {
    await this.findLandingPageForCampaign(campaignId, id);

    const landingPage = await this.prisma.landingPage.update({
      where: { id },
      data: { status: LandingPageStatus.ARCHIVED },
    });

    return {
      id: landingPage.id,
      status: landingPage.status,
    };
  }

  private async ensureCampaignExists(campaignId: string): Promise<void> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      throw new NotFoundException({
        success: false,
        message: 'Campaign not found',
        code: 'CAMPAIGN_NOT_FOUND',
      });
    }
  }

  private async findLandingPageForCampaign(campaignId: string, id: string) {
    await this.ensureCampaignExists(campaignId);

    const landingPage = await this.prisma.landingPage.findFirst({
      where: { id, campaignId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!landingPage) {
      throw new NotFoundException({
        success: false,
        message: 'Landing page not found',
        code: 'LANDING_PAGE_NOT_FOUND',
      });
    }

    return landingPage;
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private rethrowUniqueSlugConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException({
        success: false,
        message: 'A landing page with this slug already exists',
        code: 'LANDING_PAGE_SLUG_CONFLICT',
      });
    }
  }

  private toListItem(landingPage: LandingPage): LandingPageListItem {
    return {
      id: landingPage.id,
      campaignId: landingPage.campaignId,
      title: landingPage.title,
      slug: landingPage.slug,
      status: landingPage.status,
      lastExportedAt: landingPage.lastExportedAt?.toISOString() ?? null,
      createdAt: landingPage.createdAt.toISOString(),
    };
  }

  private toDetail(
    landingPage: LandingPage & { createdBy: LandingPageCreator },
  ): LandingPageDetail {
    return {
      ...this.toListItem(landingPage),
      publicBaseUrl: landingPage.publicBaseUrl,
      updatedAt: landingPage.updatedAt.toISOString(),
      createdBy: landingPage.createdBy,
    };
  }
}
