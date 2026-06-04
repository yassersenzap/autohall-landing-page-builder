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
import { UserRole } from '@prisma/client';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { Roles } from '../common/decorators/roles.decorator';
import { PageAssetsService } from './page-assets.service';

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

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly pageAssetsService: PageAssetsService) {}

  @Roles(...READ_ROLES)
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

  @Roles(...WRITE_ROLES)
  @Delete(':assetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('assetId', ParseUUIDPipe) assetId: string): Promise<void> {
    await this.pageAssetsService.deleteAsset(assetId);
  }
}
