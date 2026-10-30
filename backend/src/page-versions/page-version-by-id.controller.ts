import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { UpdatePageVersionDto } from './dto/update-page-version.dto';
import { PageVersionsService } from './page-versions.service';

/** Direct page-version access by id — used by Builder V3 (no landingPageId required). */
@Controller('api/page-versions/:pageVersionId')
export class PageVersionByIdController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get()
  async findOne(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageVersionsService.findOneById(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page version retrieved successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Patch()
  async update(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Body() dto: UpdatePageVersionDto,
  ) {
    const data = await this.pageVersionsService.updateById(pageVersionId, dto);

    return {
      success: true,
      data,
      message: 'Page version updated successfully',
    };
  }
}
