import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageVersion, PageVersionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
import { ListPageVersionsQueryDto } from './dto/list-page-versions-query.dto';
import { UpdatePageVersionDto } from './dto/update-page-version.dto';

type PageVersionCreator = {
  id: string;
  fullName: string;
};

export type PageVersionListItem = {
  id: string;
  landingPageId: string;
  versionNumber: number;
  label: string | null;
  status: PageVersionStatus;
  createdAt: string;
};

export type PageVersionDetail = PageVersionListItem & {
  themeJson: Prisma.JsonValue | null;
  updatedAt: string;
  createdBy: PageVersionCreator;
};

export type PublishedPageVersionResult = {
  pageVersion: PageVersionListItem;
  landingPage: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  campaign: {
    id: string;
    name: string;
    brand: string;
  };
};

@Injectable()
export class PageVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(landingPageId: string, query: ListPageVersionsQueryDto) {
    await this.ensureLandingPageExists(landingPageId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PageVersionWhereInput = { landingPageId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.label = { contains: term, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.pageVersion.findMany({
        where,
        orderBy: { versionNumber: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pageVersion.count({ where }),
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

  async findOne(landingPageId: string, id: string): Promise<PageVersionDetail> {
    const pageVersion = await this.findPageVersionForLandingPage(
      landingPageId,
      id,
    );
    return this.toDetail(pageVersion);
  }

  async findOneById(id: string): Promise<PageVersionDetail> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    return this.toDetail(pageVersion);
  }

  async create(
    landingPageId: string,
    dto: CreatePageVersionDto,
    createdById: string,
  ) {
    await this.ensureLandingPageExists(landingPageId);

    const versionNumber = await this.nextVersionNumber(landingPageId);

    const pageVersion = await this.prisma.pageVersion.create({
      data: {
        landingPageId,
        versionNumber,
        label: dto.label?.trim() || null,
        status: dto.status ?? PageVersionStatus.DRAFT,
        themeJson: dto.themeJson as Prisma.InputJsonValue | undefined,
        createdById,
      },
    });

    return this.toListItem(pageVersion);
  }

  async update(landingPageId: string, id: string, dto: UpdatePageVersionDto) {
    await this.findPageVersionForLandingPage(landingPageId, id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: {
        label: dto.label === undefined ? undefined : dto.label?.trim() || null,
        status: dto.status,
        themeJson:
          dto.themeJson === undefined
            ? undefined
            : (dto.themeJson as Prisma.InputJsonValue),
      },
    });

    return this.toListItem(pageVersion);
  }

  async updateById(
    id: string,
    dto: UpdatePageVersionDto,
  ): Promise<PageVersionDetail> {
    await this.findOneById(id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: {
        label: dto.label === undefined ? undefined : dto.label?.trim() || null,
        status: dto.status,
        themeJson:
          dto.themeJson === undefined
            ? undefined
            : (dto.themeJson as Prisma.InputJsonValue),
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return this.toDetail(pageVersion);
  }

  async publish(pageVersionId: string): Promise<PublishedPageVersionResult> {
    const existing = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: { campaign: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    if (existing.status === PageVersionStatus.ARCHIVED) {
      throw new BadRequestException({
        success: false,
        message: 'Archived page versions cannot be published',
        code: 'PAGE_VERSION_ARCHIVED',
      });
    }

    await this.prisma.$transaction([
      this.prisma.pageVersion.updateMany({
        where: {
          landingPageId: existing.landingPageId,
          id: { not: pageVersionId },
          status: { not: PageVersionStatus.ARCHIVED },
        },
        data: { status: PageVersionStatus.DRAFT },
      }),
      this.prisma.pageVersion.update({
        where: { id: pageVersionId },
        data: { status: PageVersionStatus.PUBLISHED },
      }),
    ]);

    const pageVersion = await this.prisma.pageVersion.findUniqueOrThrow({
      where: { id: pageVersionId },
    });

    return {
      pageVersion: this.toListItem(pageVersion),
      landingPage: {
        id: existing.landingPage.id,
        title: existing.landingPage.title,
        slug: existing.landingPage.slug,
        status: existing.landingPage.status,
      },
      campaign: {
        id: existing.landingPage.campaign.id,
        name: existing.landingPage.campaign.name,
        brand: existing.landingPage.campaign.brand,
      },
    };
  }

  /** Archivage logique (pas de suppression physique — blocs et formulaires liés). */
  async archive(landingPageId: string, id: string) {
    await this.findPageVersionForLandingPage(landingPageId, id);

    const pageVersion = await this.prisma.pageVersion.update({
      where: { id },
      data: { status: PageVersionStatus.ARCHIVED },
    });

    return {
      id: pageVersion.id,
      status: pageVersion.status,
    };
  }

  private async ensureLandingPageExists(landingPageId: string): Promise<void> {
    const landingPage = await this.prisma.landingPage.findUnique({
      where: { id: landingPageId },
      select: { id: true },
    });

    if (!landingPage) {
      throw new NotFoundException({
        success: false,
        message: 'Landing page not found',
        code: 'LANDING_PAGE_NOT_FOUND',
      });
    }
  }

  private async findPageVersionForLandingPage(
    landingPageId: string,
    id: string,
  ) {
    await this.ensureLandingPageExists(landingPageId);

    const pageVersion = await this.prisma.pageVersion.findFirst({
      where: { id, landingPageId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    return pageVersion;
  }

  private async nextVersionNumber(landingPageId: string): Promise<number> {
    const aggregate = await this.prisma.pageVersion.aggregate({
      where: { landingPageId },
      _max: { versionNumber: true },
    });

    return (aggregate._max.versionNumber ?? 0) + 1;
  }

  private toListItem(pageVersion: PageVersion): PageVersionListItem {
    return {
      id: pageVersion.id,
      landingPageId: pageVersion.landingPageId,
      versionNumber: pageVersion.versionNumber,
      label: pageVersion.label,
      status: pageVersion.status,
      createdAt: pageVersion.createdAt.toISOString(),
    };
  }

  private toDetail(
    pageVersion: PageVersion & { createdBy: PageVersionCreator },
  ): PageVersionDetail {
    return {
      ...this.toListItem(pageVersion),
      themeJson: pageVersion.themeJson,
      updatedAt: pageVersion.updatedAt.toISOString(),
      createdBy: pageVersion.createdBy,
    };
  }
}
