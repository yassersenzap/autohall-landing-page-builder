import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { BuilderV3ExportService } from './builder-v3-export.service';
import { ExportBuilderV3DocumentDto } from './dto/export-builder-v3-document.dto';
import { StudioV2ExportService } from './studio-v2-export.service';
import { StudioV2RendererService } from './studio-v2-renderer.service';

const READ_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
  UserRole.VIEWER,
] as const;

const EXPORT_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

@Controller('api/page-versions/:pageVersionId')
export class StudioV2PreviewController {
  constructor(
    private readonly rendererService: StudioV2RendererService,
    private readonly exportService: StudioV2ExportService,
    private readonly builderV3ExportService: BuilderV3ExportService,
  ) {}

  @Roles(...READ_ROLES)
  @Get('studio-v2-preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getPreview(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ) {
    const result = await this.rendererService.renderPreviewHtml(pageVersionId);
    return result.html;
  }

  @Roles(...READ_ROLES)
  @Get('studio-v2-readiness')
  async getReadiness(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ) {
    const document = await this.rendererService.getDocument(pageVersionId);
    const result = this.rendererService.validateReadiness(document);
    return {
      success: true,
      data: result,
      message: 'Studio V2 readiness evaluated',
    };
  }

  @Roles(...EXPORT_ROLES)
  @Get('studio-v2-export')
  async exportZip(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ): Promise<StreamableFile> {
    const result = await this.exportService.exportZip(pageVersionId);

    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${result.filename}"`,
    });
  }

  @Roles(...EXPORT_ROLES)
  @Post('studio-v3-export')
  async exportBuilderV3Zip(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Body() dto: ExportBuilderV3DocumentDto,
  ): Promise<StreamableFile> {
    try {
      const result = await this.builderV3ExportService.exportZip(
        pageVersionId,
        dto,
      );

      return new StreamableFile(result.buffer, {
        type: 'application/zip',
        disposition: `attachment; filename="${result.filename}"`,
      });
    } catch (error) {
      console.error(
        `[StudioV2PreviewController] studio-v3-export failed pageVersionId=${pageVersionId}`,
        error,
      );

      if (
        error &&
        typeof error === 'object' &&
        'getStatus' in error &&
        typeof (error as { getStatus: () => number }).getStatus === 'function'
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message:
          error instanceof Error ? error.message : 'Export V3 impossible.',
        code: 'BUILDER_V3_EXPORT_FAILED',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
