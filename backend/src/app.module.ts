import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvFilePaths } from './config/env-paths';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { HealthModule } from './health/health.module';
import { LeadEventsModule } from './lead-events/lead-events.module';
import { LandingPagesModule } from './landing-pages/landing-pages.module';
import { PageAssetsModule } from './page-assets/page-assets.module';
import { PageBlocksModule } from './page-blocks/page-blocks.module';
import { PageExportModule } from './page-export/page-export.module';
import { PagePreviewModule } from './page-preview/page-preview.module';
import { PageVersionsModule } from './page-versions/page-versions.module';
import { DesignStudioModule } from './design-studio/design-studio.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
    }),
    PrismaModule,
    AuthModule,
    CampaignsModule,
    LandingPagesModule,
    PageVersionsModule,
    PageBlocksModule,
    PageAssetsModule,
    PagePreviewModule,
    DesignStudioModule,
    PageExportModule,
    LeadEventsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
