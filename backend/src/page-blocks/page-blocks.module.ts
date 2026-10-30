import { Module } from '@nestjs/common';
import { PageBlocksController } from './page-blocks.controller';
import { PageBlocksService } from './page-blocks.service';

@Module({
  controllers: [PageBlocksController],
  providers: [PageBlocksService],
  exports: [PageBlocksService],
})
export class PageBlocksModule {}
