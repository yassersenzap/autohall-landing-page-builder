import { Module } from '@nestjs/common';
import { PagePreviewController } from './page-preview.controller';
import { PagePreviewService } from './page-preview.service';

@Module({
  controllers: [PagePreviewController],
  providers: [PagePreviewService],
  exports: [PagePreviewService],
})
export class PagePreviewModule {}
