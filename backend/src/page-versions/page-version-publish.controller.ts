import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { PageVersionsService } from './page-versions.service';

@Controller('api/page-versions/:pageVersionId')
export class PageVersionPublishController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @RequirePermission(Permission.EDIT_PAGE)
  @Post('publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageVersionsService.publish(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page version published successfully',
    };
  }
}
