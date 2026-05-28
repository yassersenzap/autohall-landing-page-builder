import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { ListLeadEventsQueryDto } from './dto/list-lead-events-query.dto';
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
}
