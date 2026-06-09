import { Module } from '@nestjs/common';
import { PageVersionByIdController } from './page-version-by-id.controller';
import { PageVersionPublishController } from './page-version-publish.controller';
import { PageVersionsController } from './page-versions.controller';
import { PageVersionsService } from './page-versions.service';

@Module({
  controllers: [
    PageVersionsController,
    PageVersionByIdController,
    PageVersionPublishController,
  ],
  providers: [PageVersionsService],
  exports: [PageVersionsService],
})
export class PageVersionsModule {}
