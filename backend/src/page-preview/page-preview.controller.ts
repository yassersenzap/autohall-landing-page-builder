import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PagePreviewService } from './page-preview.service';

const READ_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
  UserRole.VIEWER,
] as const;

@Controller('api/page-versions/:pageVersionId')
export class PagePreviewController {
  constructor(private readonly pagePreviewService: PagePreviewService) {}

  @Roles(...READ_ROLES)
  @Get('preview')
  async getPreview(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pagePreviewService.getPreview(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page preview retrieved successfully',
    };
  }
}
