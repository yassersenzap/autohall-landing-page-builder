import { Module } from '@nestjs/common';
import { StudioV2DocumentController } from './studio-v2-document.controller';
import { StudioV2DocumentService } from './studio-v2-document.service';

@Module({
  controllers: [StudioV2DocumentController],
  providers: [StudioV2DocumentService],
  exports: [StudioV2DocumentService],
})
export class StudioV2DocumentModule {}
