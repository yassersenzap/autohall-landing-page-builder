import { Module } from '@nestjs/common';
import { PageExportController } from './page-export.controller';
import { PageExportService } from './page-export.service';

@Module({
  controllers: [PageExportController],
  providers: [PageExportService],
  exports: [PageExportService],
})
export class PageExportModule {}
