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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('api/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @RequirePermission(Permission.MANAGE_CAMPAIGNS)
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

  @RequirePermission(Permission.MANAGE_CAMPAIGNS)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.campaignsService.findOne(id);

    return {
      success: true,
      data,
      message: 'Campaign retrieved successfully',
    };
  }

  @RequirePermission(Permission.MANAGE_CAMPAIGNS)
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

  @RequirePermission(Permission.MANAGE_CAMPAIGNS)
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

  @RequirePermission(Permission.DELETE_CAMPAIGN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.campaignsService.softDelete(id);

    return {
      success: true,
      data,
      message: 'Campaign supprimée avec succès',
    };
  }
}
