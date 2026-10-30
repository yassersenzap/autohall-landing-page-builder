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
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { CreatePageBlockDto } from './dto/create-page-block.dto';
import { UpdatePageBlockDto } from './dto/update-page-block.dto';
import { PageBlocksService } from './page-blocks.service';

/**
 * @legacy Pipeline page_blocks (builder blocs V1) — conservé pour compatibilité API.
 * Le frontend officiel utilise le Landing Studio (`studio-v2-document`).
 */
@Controller('api/page-versions/:pageVersionId/blocks')
export class PageBlocksController {
  constructor(private readonly pageBlocksService: PageBlocksService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get()
  async findAll(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageBlocksService.findAll(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page blocks retrieved successfully',
    };
  }

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get(':id')
  async findOne(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageBlocksService.findOne(pageVersionId, id);

    return {
      success: true,
      data,
      message: 'Page block retrieved successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Body() dto: CreatePageBlockDto,
  ) {
    const data = await this.pageBlocksService.create(pageVersionId, dto);

    return {
      success: true,
      data,
      message: 'Page block created successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Patch(':id')
  async update(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageBlockDto,
  ) {
    const data = await this.pageBlocksService.update(pageVersionId, id, dto);

    return {
      success: true,
      data,
      message: 'Page block updated successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Delete(':id')
  async remove(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.pageBlocksService.remove(pageVersionId, id);

    return {
      success: true,
      data,
      message: 'Page block deleted successfully',
    };
  }
}
