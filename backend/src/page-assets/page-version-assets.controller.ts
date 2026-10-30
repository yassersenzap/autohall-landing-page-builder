import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { PageAssetsService } from './page-assets.service';

@Controller('api/page-versions/:pageVersionId/assets')
export class PageVersionAssetsController {
  constructor(private readonly pageAssetsService: PageAssetsService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get()
  async list(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageAssetsService.listForPageVersion(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page assets retrieved successfully',
    };
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  async upload(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const data = await this.pageAssetsService.uploadForPageVersion(
      pageVersionId,
      file,
    );

    return {
      success: true,
      data,
      message: 'Asset uploaded successfully',
    };
  }
}
