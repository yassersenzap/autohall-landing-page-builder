import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PageExportService } from './page-export.service';

const EXPORT_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

@Controller('api/page-versions/:pageVersionId')
export class PageExportController {
  constructor(private readonly pageExportService: PageExportService) {}

  @Roles(...EXPORT_ROLES)
  @Get('export')
  async export(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
  ): Promise<StreamableFile> {
    const result = await this.pageExportService.exportZip(pageVersionId);

    return new StreamableFile(result.buffer, {
      type: result.mimeType,
      disposition: `attachment; filename="${result.filename}"`,
    });
  }
}
