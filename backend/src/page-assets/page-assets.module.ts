import { Module } from '@nestjs/common';
import { AssetRenderService } from './asset-render.service';
import { AssetsController } from './assets.controller';
import { PageAssetsService } from './page-assets.service';
import { PageVersionAssetsController } from './page-version-assets.controller';
import { PublicAssetsController } from './public-assets.controller';

@Module({
  controllers: [
    PageVersionAssetsController,
    AssetsController,
    PublicAssetsController,
  ],
  providers: [PageAssetsService, AssetRenderService],
  exports: [PageAssetsService, AssetRenderService],
})
export class PageAssetsModule {}
