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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

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

@Controller('api/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Roles(...READ_ROLES)
  @Get()
  async findAll(@Query() query: ListCampaignsQueryDto) {
    const result = await this.campaignsService.findAll(query);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Campaigns retrieved successfully',
    };
  }

  @Roles(...READ_ROLES)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.campaignsService.findOne(id);

    return {
      success: true,
      data,
      message: 'Campaign retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.campaignsService.create(dto, user.id);

    return {
      success: true,
      data,
      message: 'Campaign created successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    const data = await this.campaignsService.update(id, dto);

    return {
      success: true,
      data,
      message: 'Campaign updated successfully',
    };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.campaignsService.archive(id);

    return {
      success: true,
      data,
      message: 'Campaign archived successfully',
    };
  }
}
