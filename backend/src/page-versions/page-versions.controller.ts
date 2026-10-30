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
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
import { ListPageVersionsQueryDto } from './dto/list-page-versions-query.dto';
import { UpdatePageVersionDto } from './dto/update-page-version.dto';
import { SaveStudioDocumentDto } from './dto/save-studio-document.dto';
import { PageVersionsService } from './page-versions.service';

@Controller('api/landing-pages/:landingPageId/versions')
export class PageVersionsController {
  constructor(private readonly pageVersionsService: PageVersionsService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get()
  async findAll(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Query() query: ListPageVersionsQueryDto,
  ) {
    const result = await this.pageVersionsService.findAll(landingPageId, query);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Page versions retrieved successfully',
    };
  }

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get(':id')
  async findOne(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageVersionsService.findOne(landingPageId, id);

    return {
      success: true,
      data,
      message: 'Page version retrieved successfully',
    };
  }

  @RequirePermission(Permission.CREATE_PAGE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Body() dto: CreatePageVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.pageVersionsService.create(
      landingPageId,
      dto,
      user.id,
    );

    return {
      success: true,
      data,
      message: 'Page version created successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Patch(':id')
  async update(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageVersionDto,
  ) {
    const data = await this.pageVersionsService.update(landingPageId, id, dto);

    return {
      success: true,
      data,
      message: 'Page version updated successfully',
    };
  }

  @RequirePermission(Permission.DELETE_PAGE)
  @Delete(':id')
  async remove(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageVersionsService.archive(landingPageId, id);

    return {
      success: true,
      data,
      message: 'Page version archived successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Get(':id/studio-document')
  async getStudioDocument(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const documentJson = await this.pageVersionsService.getStudioDocument(landingPageId, id);
    return {
      success: true,
      data: documentJson,
      message: 'Studio document retrieved successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Put(':id/studio-document')
  async saveStudioDocument(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveStudioDocumentDto,
  ) {
    const data = await this.pageVersionsService.saveStudioDocument(landingPageId, id, dto.documentJson);
    return {
      success: true,
      data,
      message: 'Studio document saved successfully',
    };
  }

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get(':id/preview-html')
  async getPreviewHtml(
    @Param('landingPageId', ParseUUIDPipe) landingPageId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: any,
  ) {
    const html = await this.pageVersionsService.getPreviewHtml(landingPageId, id);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
