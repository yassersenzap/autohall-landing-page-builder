import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UpsertStudioV2DocumentDto } from './dto/upsert-studio-v2-document.dto';
import { StudioV2DocumentService } from './studio-v2-document.service';

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

@Controller('api/page-versions/:pageVersionId/studio-v2-document')
export class StudioV2DocumentController {
  constructor(
    private readonly studioV2DocumentService: StudioV2DocumentService,
  ) {}

  @Roles(...READ_ROLES)
  @Get()
  async getDocument(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ) {
    const data = await this.studioV2DocumentService.getOrCreate(pageVersionId);
    return {
      success: true,
      data,
      message: 'Studio V2 document retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Put()
  async upsertDocument(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Body() dto: UpsertStudioV2DocumentDto,
  ) {
    const data = await this.studioV2DocumentService.upsert(pageVersionId, dto);
    return {
      success: true,
      data,
      message: 'Studio V2 document saved successfully',
    };
  }
}
