import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CreatePublicLeadDto } from './dto/create-public-lead.dto';
import { LeadEventsService } from './lead-events.service';

@Public()
@Controller('api/public/leads')
export class PublicLeadsController {
  constructor(private readonly leadEventsService: LeadEventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePublicLeadDto, @Req() req: Request) {
    const data = await this.leadEventsService.createPublicLead(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: this.resolveClientIp(req),
    });

    return {
      success: true,
      data,
      message: 'Lead received successfully',
    };
  }

  private resolveClientIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim();
    }
    return req.ip;
  }
}
