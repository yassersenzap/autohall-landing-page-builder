import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DesignProjectService } from './design-project.service';
import { SaveDesignProjectDto } from './dto/save-design-project.dto';

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

@Controller('api/page-versions/:pageVersionId/design-project')
export class DesignProjectController {
  constructor(private readonly designProjectService: DesignProjectService) {}

  @Roles(...READ_ROLES)
  @Get()
  async get(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.designProjectService.getDesignProject(pageVersionId);
    return {
      success: true,
      data,
      message: 'Design project retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Put()
  async save(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Body() dto: SaveDesignProjectDto,
  ) {
    const data = await this.designProjectService.saveDesignProject(
      pageVersionId,
      dto,
    );
    return {
      success: true,
      data,
      message: 'Design project saved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Post('enable-grapesjs')
  @HttpCode(HttpStatus.OK)
  async enableGrapesjs(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.designProjectService.switchToGrapesjs(pageVersionId);
    return {
      success: true,
      data,
      message: 'Visual Design Studio enabled for this page version',
    };
  }
}
