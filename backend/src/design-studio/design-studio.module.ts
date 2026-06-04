import { Module } from '@nestjs/common';
import { DesignProjectController } from './design-project.controller';
import { DesignProjectService } from './design-project.service';

@Module({
  controllers: [DesignProjectController],
  providers: [DesignProjectService],
  exports: [DesignProjectService],
})
export class DesignStudioModule {}
