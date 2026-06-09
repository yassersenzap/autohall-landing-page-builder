import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdatePageVersionDto } from './dto/update-page-version.dto';
import { PageVersionsService } from './page-versions.service';

const READ_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
  UserRole.VIEWER,
] as const;

const WRITE_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

/** Direct page-version access by id — used by Builder V3 (no landingPageId required). */
@Controller('api/page-versions/:pageVersionId')
export class PageVersionByIdController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @Roles(...READ_ROLES)
  @Get()
  async findOne(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageVersionsService.findOneById(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page version retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
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
