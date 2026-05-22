import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('PostgreSQL connection established');
    } catch {
      this.logger.warn(
        'PostgreSQL unavailable at startup — GET /health/db will return disconnected until the database is reachable',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}
