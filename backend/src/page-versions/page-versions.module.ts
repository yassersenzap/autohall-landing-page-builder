import { Module } from '@nestjs/common';
import { PageVersionPublishController } from './page-version-publish.controller';
import { PageVersionsController } from './page-versions.controller';
import { PageVersionsService } from './page-versions.service';

@Module({
  controllers: [PageVersionsController, PageVersionPublishController],
  providers: [PageVersionsService],
  exports: [PageVersionsService],
})
export class PageVersionsModule {}
