import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import { PageAssetsService } from './page-assets.service';

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly pageAssetsService: PageAssetsService) {}

  @RequirePermission(Permission.PREVIEW_PAGE)
  @Get(':assetId/file')
  async streamFile(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<StreamableFile> {
    const { absolutePath, mimeType } =
      await this.pageAssetsService.getAssetFile(assetId);

    try {
      await access(absolutePath);
    } catch {
      throw new NotFoundException({
        success: false,
        message: 'Asset file not found on disk',
        code: 'ASSET_FILE_MISSING',
      });
    }

    const stream = createReadStream(absolutePath);
    return new StreamableFile(stream, { type: mimeType });
  }

  @RequirePermission(Permission.EDIT_PAGE)
  @Delete(':assetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<void> {
    await this.pageAssetsService.deleteAsset(assetId);
  }
}
