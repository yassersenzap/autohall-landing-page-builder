import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
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
  ) {}

  @Roles(...READ_ROLES)
  @Get('studio-v2-preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getPreview(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const result = await this.rendererService.renderPreviewHtml(pageVersionId);
    return result.html;
  }

  @Roles(...READ_ROLES)
  @Get('studio-v2-readiness')
  async getReadiness(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
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
}
