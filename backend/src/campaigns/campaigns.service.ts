import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Campaign, CampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

type CampaignCreator = {
  id: string;
  fullName: string;
};

export type CampaignListItem = {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  campaignType: string;
  status: CampaignStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type CampaignDetail = CampaignListItem & {
  description: string | null;
  updatedAt: string;
  createdBy: CampaignCreator;
};

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {};

    if (query.archived) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;

      if (query.status) {
        where.status = query.status;
      }

      if (query.brand?.trim()) {
        where.brand = { contains: query.brand.trim(), mode: 'insensitive' };
      }

      if (query.search?.trim()) {
        const term = query.search.trim();
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { model: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: query.archived ? { deletedAt: 'desc' } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: items.map((campaign) => this.toListItem(campaign)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<CampaignDetail> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException({
        success: false,
        message: 'Campaign not found',
        code: 'CAMPAIGN_NOT_FOUND',
      });
    }

    if (campaign.deletedAt !== null) {
      throw new NotFoundException({
        success: false,
        message: 'Cette campagne a été supprimée',
        code: 'CAMPAIGN_DELETED',
      });
    }

    return this.toDetail(campaign);
  }

  async create(dto: CreateCampaignDto, createdById: string) {
    this.validateDateRange(dto.startDate, dto.endDate);

    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name.trim(),
        brand: dto.brand.trim(),
        model: dto.model?.trim() || null,
        campaignType: dto.campaignType.trim(),
        description: dto.description?.trim() || null,
        startDate: this.parseDate(dto.startDate),
        endDate: this.parseDate(dto.endDate),
        status: dto.status ?? CampaignStatus.DRAFT,
        createdById,
      },
    });

    return this.toListItem(campaign);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const existing = await this.prisma.campaign.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Campaign not found',
        code: 'CAMPAIGN_NOT_FOUND',
      });
    }

    if (existing.deletedAt !== null) {
      throw new BadRequestException({
        success: false,
        message: 'Cette campagne a été supprimée et ne peut plus être modifiée',
        code: 'CAMPAIGN_DELETED',
      });
    }

    const startDate =
      dto.startDate !== undefined
        ? this.parseDate(dto.startDate)
        : existing.startDate;
    const endDate =
      dto.endDate !== undefined
        ? this.parseDate(dto.endDate)
        : existing.endDate;

    this.validateDateRange(
      startDate?.toISOString().slice(0, 10),
      endDate?.toISOString().slice(0, 10),
    );

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        brand: dto.brand?.trim(),
        model: dto.model === undefined ? undefined : dto.model?.trim() || null,
        campaignType: dto.campaignType?.trim(),
        description:
          dto.description === undefined
            ? undefined
            : dto.description?.trim() || null,
        startDate:
          dto.startDate !== undefined
            ? this.parseDate(dto.startDate)
            : undefined,
        endDate:
          dto.endDate !== undefined ? this.parseDate(dto.endDate) : undefined,
        status: dto.status,
      },
    });

    return this.toListItem(campaign);
  }

  /** Suppression logique — cascade vers les landing pages. */
  async softDelete(id: string) {
    const existing = await this.prisma.campaign.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Campaign not found',
        code: 'CAMPAIGN_NOT_FOUND',
      });
    }

    if (existing.deletedAt !== null) {
      throw new BadRequestException({
        success: false,
        message: 'Cette campagne est déjà supprimée',
        code: 'CAMPAIGN_ALREADY_DELETED',
      });
    }

    const now = new Date();

    const [campaign] = await this.prisma.$transaction([
      this.prisma.campaign.update({
        where: { id },
        data: { deletedAt: now },
      }),
      this.prisma.landingPage.updateMany({
        where: { campaignId: id, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    return {
      id: campaign.id,
      deletedAt: campaign.deletedAt?.toISOString() ?? null,
    };
  }

  private toListItem(campaign: Campaign): CampaignListItem {
    return {
      id: campaign.id,
      name: campaign.name,
      brand: campaign.brand,
      model: campaign.model,
      campaignType: campaign.campaignType,
      status: campaign.status,
      startDate: this.formatDate(campaign.startDate),
      endDate: this.formatDate(campaign.endDate),
      createdAt: campaign.createdAt.toISOString(),
      deletedAt: campaign.deletedAt?.toISOString() ?? null,
    };
  }

  private toDetail(
    campaign: Campaign & { createdBy: CampaignCreator },
  ): CampaignDetail {
    return {
      ...this.toListItem(campaign),
      description: campaign.description,
      updatedAt: campaign.updatedAt.toISOString(),
      createdBy: campaign.createdBy,
    };
  }

  private formatDate(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    return value.toISOString().slice(0, 10);
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }

    return new Date(`${value}T00:00:00.000Z`);
  }

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException({
        success: false,
        message: 'endDate must be greater than or equal to startDate',
        code: 'VALIDATION_ERROR',
      });
    }
  }
}
