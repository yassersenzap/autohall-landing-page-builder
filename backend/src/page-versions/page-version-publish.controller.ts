import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PageVersionsService } from './page-versions.service';

const WRITE_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

@Controller('api/page-versions/:pageVersionId')
export class PageVersionPublishController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @Roles(...WRITE_ROLES)
  @Post('publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageVersionsService.publish(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page version published successfully',
    };
  }
}
