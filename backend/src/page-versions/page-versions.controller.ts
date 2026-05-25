import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
import { ListPageVersionsQueryDto } from './dto/list-page-versions-query.dto';
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

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SI_DIGITAL] as const;

@Controller('api/landing-pages/:landingPageId/versions')
export class PageVersionsController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @Roles(...READ_ROLES)
  @Get()
  async findAll(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Query() query: ListPageVersionsQueryDto,
  ) {
    const result = await this.pageVersionsService.findAll(landingPageId, query);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Page versions retrieved successfully',
    };
  }

  @Roles(...READ_ROLES)
  @Get(':id')
  async findOne(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageVersionsService.findOne(landingPageId, id);

    return {
      success: true,
      data,
      message: 'Page version retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Body() dto: CreatePageVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.pageVersionsService.create(
      landingPageId,
      dto,
      user.id,
    );

    return {
      success: true,
      data,
      message: 'Page version created successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  async update(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageVersionDto,
  ) {
    const data = await this.pageVersionsService.update(landingPageId, id, dto);

    return {
      success: true,
      data,
      message: 'Page version updated successfully',
    };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageVersionsService.archive(landingPageId, id);

    return {
      success: true,
      data,
      message: 'Page version archived successfully',
    };
  }
}
