import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { PagePreviewService } from './page-preview.service';

/**
 * @legacy Preview du pipeline page_blocks V1.
 * Le Studio officiel utilise `/api/page-versions/:id/studio-v2-preview`.
 */
@Controller('api/page-versions/:pageVersionId')
export class PagePreviewController {
  constructor(private readonly pagePreviewService: PagePreviewService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get('preview')
  async getPreview(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ) {
    const data = await this.pagePreviewService.getPreview(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page preview retrieved successfully',
    };
  }
}
