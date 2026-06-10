import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { getEnvFilePaths } from './src/config/env-paths';

// Load .env files for local CLI. Do not override vars already set (Docker Compose injects them).
for (const envPath of getEnvFilePaths()) {
  config({ path: envPath, override: false });
}

/**
 * Prisma CLI datasource URL.
 * - Docker: set via Compose `environment` / root `.env` (host must be `postgres`).
 * - Local: set in root `.env` or `backend/.env`.
 * Use process.env (not env()) so `prisma generate` can run at image build without a real DB.
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl && process.argv.some((arg) => /migrate|db\s|studio/.test(arg))) {
  throw new Error(
    'DATABASE_URL is not set. For Docker: copy .env.example to .env, set POSTGRES_PASSWORD and JWT_SECRET, ' +
      'and ensure DATABASE_URL uses host "postgres" (not localhost).',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
