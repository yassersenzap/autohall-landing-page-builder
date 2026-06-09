import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertStudioV2DocumentDto } from './dto/upsert-studio-v2-document.dto';
import {
  STUDIO_V2_ENGINE,
  buildDefaultStudioV2Document,
} from './default-document';
import { ensurePuckIds } from './ensure-puck-ids';

export type StudioV2DocumentDto = {
  id: string;
  pageVersionId: string;
  engine: string;
  documentJson: Prisma.JsonValue;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class StudioV2DocumentService {
  private readonly logger = new Logger(StudioV2DocumentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(pageVersionId: string): Promise<StudioV2DocumentDto> {
    await this.ensurePageVersionExists(pageVersionId);

    try {
      const existing = await this.prisma.pageVersionStudioDocument.findUnique({
        where: { pageVersionId },
      });

      if (existing) {
        return this.toDto(this.normalizeRow(existing));
      }

      const created = await this.prisma.pageVersionStudioDocument.create({
        data: {
          pageVersionId,
          engine: STUDIO_V2_ENGINE,
          documentJson: buildDefaultStudioV2Document() as Prisma.InputJsonValue,
        },
      });

      return this.toDto(this.normalizeRow(created));
    } catch (error) {
      this.logger.error(
        `Failed to load or create Studio V2 document for pageVersionId=${pageVersionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw this.mapPersistenceError(error);
    }
  }

  async upsert(
    pageVersionId: string,
    dto: UpsertStudioV2DocumentDto,
  ): Promise<StudioV2DocumentDto> {
    await this.ensurePageVersionExists(pageVersionId);
    this.assertValidDocumentJson(dto.documentJson);

    const engine = dto.engine?.trim() || STUDIO_V2_ENGINE;

    const saved = await this.prisma.pageVersionStudioDocument.upsert({
      where: { pageVersionId },
      create: {
        pageVersionId,
        engine,
        documentJson: dto.documentJson as Prisma.InputJsonValue,
      },
      update: {
        engine,
        documentJson: dto.documentJson as Prisma.InputJsonValue,
      },
    });

    return this.toDto(this.normalizeRow(saved));
  }

  private assertValidDocumentJson(documentJson: Record<string, unknown>): void {
    if (
      !documentJson ||
      typeof documentJson !== 'object' ||
      Array.isArray(documentJson)
    ) {
      throw new BadRequestException('documentJson must be a JSON object.');
    }
    if (!('content' in documentJson) || !Array.isArray(documentJson.content)) {
      throw new BadRequestException('documentJson.content must be an array.');
    }
    if (!('root' in documentJson) || typeof documentJson.root !== 'object') {
      throw new BadRequestException('documentJson.root must be an object.');
    }
  }

  private mapPersistenceError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('page_version_studio_documents') &&
      (message.includes('does not exist') || message.includes('P2021'))
    ) {
      return new InternalServerErrorException(
        'Studio V2 table missing. Run: cd backend && npx prisma migrate deploy',
      );
    }
    if (error instanceof Error) {
      return error;
    }
    return new InternalServerErrorException(
      'Studio V2 document persistence failed.',
    );
  }

  private async ensurePageVersionExists(pageVersionId: string): Promise<void> {
    const version = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      select: { id: true },
    });
    if (!version) {
      throw new NotFoundException(`Page version ${pageVersionId} not found.`);
    }
  }

  private normalizeRow(row: {
    id: string;
    pageVersionId: string;
    engine: string;
    documentJson: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const documentJson = ensurePuckIds(
      row.documentJson as Record<string, unknown>,
    ) as Prisma.JsonValue;
    return { ...row, documentJson };
  }

  private toDto(row: {
    id: string;
    pageVersionId: string;
    engine: string;
    documentJson: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): StudioV2DocumentDto {
    return {
      id: row.id,
      pageVersionId: row.pageVersionId,
      engine: row.engine,
      documentJson: row.documentJson,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
