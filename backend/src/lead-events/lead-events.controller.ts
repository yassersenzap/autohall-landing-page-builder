import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ListLeadEventsQueryDto } from './dto/list-lead-events-query.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadEventsService } from './lead-events.service';

const INTERNAL_READ_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

@Controller('api/lead-events')
export class LeadEventsController {
  constructor(private readonly leadEventsService: LeadEventsService) {}

  @Roles(...INTERNAL_READ_ROLES)
  @Get()
  async findAll(@Query() query: ListLeadEventsQueryDto) {
    const result = await this.leadEventsService.findAllForAdmin(query);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Lead events retrieved successfully',
    };
  }

  @Roles(...INTERNAL_READ_ROLES)
  @Get(':id/history')
  async findHistory(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.leadEventsService.findStatusHistory(id);

    return {
      success: true,
      data,
      message: 'Lead status history retrieved successfully',
    };
  }

  @Roles(...INTERNAL_READ_ROLES)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.leadEventsService.findOneById(id);

    return {
      success: true,
      data,
      message: 'Lead event retrieved successfully',
    };
  }

  @Roles(...INTERNAL_READ_ROLES)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.leadEventsService.updateStatus(
      id,
      dto,
      user.id,
    );

    return {
      success: true,
      data,
      message: 'Lead status updated successfully',
    };
  }
}
