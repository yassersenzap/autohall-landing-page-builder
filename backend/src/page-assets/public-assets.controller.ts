import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { Public } from '../common/decorators/public.decorator';
import { validatePublicAssetMime } from './asset-upload.policy';
import { PageAssetsService } from './page-assets.service';

@Public()
@Controller('api/public/assets')
export class PublicAssetsController {
  constructor(private readonly pageAssetsService: PageAssetsService) {}

  /**
   * Lecture publique d'un visuel marketing (UUID non devinable).
   * Utilisé par la preview HTML et compatible avec un futur hébergement statique.
   */
  @Get(':assetId/file')
  @Header('Cache-Control', 'public, max-age=3600')
  async streamFile(
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ): Promise<StreamableFile> {
    const { absolutePath, mimeType } =
      await this.pageAssetsService.getAssetFile(assetId);

    validatePublicAssetMime(mimeType);

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
}
