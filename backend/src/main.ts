import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolvePort(configService: ConfigService): number {
  const raw =
    configService.get<string>('BACKEND_PORT') ??
    configService.get<string>('PORT') ??
    '3000';
  const port = Number(raw);
  return Number.isFinite(port) && port > 0 ? port : 3000;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = resolvePort(configService);
  const corsOrigins = parseCorsOrigins(
    configService.get<string>('CORS_ALLOWED_ORIGINS'),
  );

  if (corsOrigins.length > 0) {
    app.enableCors({
      origin: corsOrigins,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  await app.listen(port);

  console.log(`[backend] Server running on http://localhost:${port}`);
  console.log(`[backend] GET http://localhost:${port}/health`);
  console.log(`[backend] GET http://localhost:${port}/health/db`);
  console.log(`[backend] POST http://localhost:${port}/api/auth/login`);
  console.log(`[backend] GET http://localhost:${port}/api/auth/me`);
  console.log(`[backend] GET http://localhost:${port}/api/campaigns`);
  console.log(
    `[backend] GET http://localhost:${port}/api/campaigns/:campaignId/landing-pages`,
  );
  console.log(
    `[backend] GET http://localhost:${port}/api/landing-pages/:landingPageId/versions`,
  );
  console.log(
    `[backend] GET http://localhost:${port}/api/page-versions/:pageVersionId/blocks`,
  );
  console.log(
    `[backend] GET http://localhost:${port}/api/page-versions/:pageVersionId/preview`,
  );
}

bootstrap().catch((error: unknown) => {
  console.error('[backend] Failed to start:', error);
  process.exit(1);
});
