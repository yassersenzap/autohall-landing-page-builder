import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { PageExportService } from './page-export.service';

/**
 * @legacy Export du pipeline page_blocks V1.
 * Le Studio officiel utilise `/api/page-versions/:id/studio-v2-export`.
 */
@Controller('api/page-versions/:pageVersionId')
export class PageExportController {
  constructor(private readonly pageExportService: PageExportService) {}

  @RequirePermission(Permission.EXPORT_PAGE)
  @Get(['export', 'studio-v2-export'])
  async export(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ): Promise<StreamableFile> {
    const result = await this.pageExportService.exportZip(pageVersionId);

    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${result.filename}"`,
    });
  }
}
