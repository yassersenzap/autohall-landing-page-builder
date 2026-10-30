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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { ListLandingPagesQueryDto } from './dto/list-landing-pages-query.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';
import { LandingPagesService } from './landing-pages.service';

@Controller('api/campaigns/:campaignId/landing-pages')
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @RequirePermission(Permission.MANAGE_CAMPAIGNS)
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

  @RequirePermission(Permission.PREVIEW_PAGE)
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

  @RequirePermission(Permission.CREATE_PAGE)
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

  @RequirePermission(Permission.EDIT_PAGE)
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

  @RequirePermission(Permission.DELETE_PAGE)
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
