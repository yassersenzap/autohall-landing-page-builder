import { Module } from '@nestjs/common';
import { PageAssetsModule } from '../page-assets/page-assets.module';
import { StudioV2DocumentModule } from '../studio-v2/studio-v2-document.module';
import { StudioV2ExportService } from './studio-v2-export.service';
import { StudioV2PreviewController } from './studio-v2-preview.controller';
import { StudioV2RendererService } from './studio-v2-renderer.service';

@Module({
  imports: [StudioV2DocumentModule, PageAssetsModule],
  controllers: [StudioV2PreviewController],
  providers: [StudioV2RendererService, StudioV2ExportService],
  exports: [StudioV2RendererService, StudioV2ExportService],
})
export class StudioV2RendererModule {}
