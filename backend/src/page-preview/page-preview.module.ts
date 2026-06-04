import { Module } from '@nestjs/common';
import { PageAssetsModule } from '../page-assets/page-assets.module';
import { PagePreviewController } from './page-preview.controller';
import { PagePreviewService } from './page-preview.service';

@Module({
  imports: [PageAssetsModule],
  controllers: [PagePreviewController],
  providers: [PagePreviewService],
  exports: [PagePreviewService],
})
export class PagePreviewModule {}
