import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { ListLeadEventsQueryDto } from './dto/list-lead-events-query.dto';
import { UpdateLeadFollowUpDto } from './dto/update-lead-follow-up.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadEventsService } from './lead-events.service';

@Controller('api/lead-events')
export class LeadEventsController {
  constructor(private readonly leadEventsService: LeadEventsService) {}

  @RequirePermission(Permission.VIEW_LEADS)
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

  @RequirePermission(Permission.VIEW_LEADS)
  @Get('dashboard')
  async getDashboard() {
    const data = await this.leadEventsService.getDashboardKpis();

    return {
      success: true,
      data,
      message: 'Lead dashboard KPIs retrieved successfully',
    };
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Get('assignable-users')
  async findAssignableUsers() {
    const data = await this.leadEventsService.findAssignableUsers();

    return {
      success: true,
      data,
      message: 'Assignable users retrieved successfully',
    };
  }

  @RequirePermission(Permission.MANAGE_USERS)
  @Delete('purge-all')
  async purgeAll() {
    const data = await this.leadEventsService.purgeAllLeads();

    return {
      success: true,
      data,
      message: 'All test leads purged successfully',
    };
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Get('export')
  async exportLeads(
    @Query() query: ListLeadEventsQueryDto,
    @Res() res: any,
  ) {
    const buffer = await this.leadEventsService.exportLeadsExcel(query);
    const today = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="leads-${today}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Get(':id/history')
  async findHistory(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.leadEventsService.findStatusHistory(id);

    return {
      success: true,
      data,
      message: 'Lead status history retrieved successfully',
    };
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.leadEventsService.findOneById(id);

    return {
      success: true,
      data,
      message: 'Lead event retrieved successfully',
    };
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Patch(':id/follow-up')
  async updateFollowUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadFollowUpDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.leadEventsService.updateFollowUp(id, dto, user.id);

    return {
      success: true,
      data,
      message: 'Lead follow-up updated successfully',
    };
  }

  @RequirePermission(Permission.VIEW_LEADS)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.leadEventsService.updateStatus(id, dto, user.id);

    return {
      success: true,
      data,
      message: 'Lead status updated successfully',
    };
  }
}
