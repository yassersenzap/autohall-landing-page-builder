import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageBlock, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageBlockDto } from './dto/create-page-block.dto';
import { UpdatePageBlockDto } from './dto/update-page-block.dto';

export type PageBlockItem = {
  id: string;
  pageVersionId: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PageBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pageVersionId: string): Promise<PageBlockItem[]> {
    await this.ensurePageVersionExists(pageVersionId);

    const blocks = await this.prisma.pageBlock.findMany({
      where: { pageVersionId },
      orderBy: { sortOrder: 'asc' },
    });

    return blocks.map((block) => this.toItem(block));
  }

  async findOne(pageVersionId: string, id: string): Promise<PageBlockItem> {
    const block = await this.findBlockForPageVersion(pageVersionId, id);
    return this.toItem(block);
  }

  async create(pageVersionId: string, dto: CreatePageBlockDto) {
    await this.ensurePageVersionExists(pageVersionId);

    const sortOrder =
      dto.sortOrder ?? (await this.nextSortOrder(pageVersionId));
    const blockKey =
      dto.blockKey?.trim() ||
      `block_${dto.blockType}_${sortOrder}_${Date.now().toString(36)}`;

    try {
      const block = await this.prisma.pageBlock.create({
        data: {
          pageVersionId,
          blockKey,
          blockType: dto.blockType,
          sortOrder,
          propsJson: dto.propsJson as Prisma.InputJsonValue,
        },
      });

      return this.toItem(block);
    } catch (error) {
      this.rethrowUniqueBlockKeyConflict(error);
      throw error;
    }
  }

  async update(pageVersionId: string, id: string, dto: UpdatePageBlockDto) {
    await this.findBlockForPageVersion(pageVersionId, id);

    try {
      const block = await this.prisma.pageBlock.update({
        where: { id },
        data: {
          blockType: dto.blockType,
          sortOrder: dto.sortOrder,
          propsJson:
            dto.propsJson === undefined
              ? undefined
              : (dto.propsJson as Prisma.InputJsonValue),
        },
      });

      return this.toItem(block);
    } catch (error) {
      this.rethrowUniqueBlockKeyConflict(error);
      throw error;
    }
  }

  /** Suppression physique — le schéma PageBlock n’a pas de statut d’archivage. */
  async remove(pageVersionId: string, id: string) {
    const block = await this.findBlockForPageVersion(pageVersionId, id);

    await this.prisma.pageBlock.delete({ where: { id } });

    return { id: block.id, deleted: true };
  }

  private async ensurePageVersionExists(pageVersionId: string): Promise<void> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      select: { id: true },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }
  }

  private async findBlockForPageVersion(pageVersionId: string, id: string) {
    await this.ensurePageVersionExists(pageVersionId);

    const block = await this.prisma.pageBlock.findFirst({
      where: { id, pageVersionId },
    });

    if (!block) {
      throw new NotFoundException({
        success: false,
        message: 'Page block not found',
        code: 'PAGE_BLOCK_NOT_FOUND',
      });
    }

    return block;
  }

  private async nextSortOrder(pageVersionId: string): Promise<number> {
    const aggregate = await this.prisma.pageBlock.aggregate({
      where: { pageVersionId },
      _max: { sortOrder: true },
    });

    return (aggregate._max.sortOrder ?? 0) + 1;
  }

  private rethrowUniqueBlockKeyConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException({
        success: false,
        message: 'A block with this blockKey already exists on this page version',
        code: 'PAGE_BLOCK_KEY_CONFLICT',
      });
    }
  }

  private toItem(block: PageBlock): PageBlockItem {
    return {
      id: block.id,
      pageVersionId: block.pageVersionId,
      blockKey: block.blockKey,
      blockType: block.blockType,
      sortOrder: block.sortOrder,
      propsJson: block.propsJson,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    };
  }
}
