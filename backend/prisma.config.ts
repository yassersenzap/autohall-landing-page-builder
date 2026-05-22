import { config } from 'dotenv';
import { join } from 'path';
import { defineConfig } from 'prisma/config';
import { getEnvFilePaths } from './src/config/env-paths';

for (const envPath of getEnvFilePaths()) {
  config({ path: envPath, override: true });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
