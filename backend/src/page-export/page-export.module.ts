import { Module } from '@nestjs/common';
import { PageAssetsModule } from '../page-assets/page-assets.module';
import { PageExportController } from './page-export.controller';
import { PageExportService } from './page-export.service';

@Module({
  imports: [PageAssetsModule],
  controllers: [PageExportController],
  providers: [PageExportService],
  exports: [PageExportService],
})
export class PageExportModule {}
