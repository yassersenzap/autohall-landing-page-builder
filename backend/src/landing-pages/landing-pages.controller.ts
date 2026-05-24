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
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { ListLandingPagesQueryDto } from './dto/list-landing-pages-query.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';
import { LandingPagesService } from './landing-pages.service';

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

@Controller('api/campaigns/:campaignId/landing-pages')
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @Roles(...READ_ROLES)
  @Get()
  async findAll(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Query() query: ListLandingPagesQueryDto,
  ) {
    const result = await this.landingPagesService.findAll(campaignId, query);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Landing pages retrieved successfully',
    };
  }

  @Roles(...READ_ROLES)
  @Get(':id')
  async findOne(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.landingPagesService.findOne(campaignId, id);

    return {
      success: true,
      data,
      message: 'Landing page retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Body() dto: CreateLandingPageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.landingPagesService.create(
      campaignId,
      dto,
      user.id,
    );

    return {
      success: true,
      data,
      message: 'Landing page created successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  async update(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLandingPageDto,
  ) {
    const data = await this.landingPagesService.update(campaignId, id, dto);

    return {
      success: true,
      data,
      message: 'Landing page updated successfully',
    };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.landingPagesService.archive(campaignId, id);

    return {
      success: true,
      data,
      message: 'Landing page archived successfully',
    };
  }
}
