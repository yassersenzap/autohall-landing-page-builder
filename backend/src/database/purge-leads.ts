import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { getEnvFilePaths } from '../config/env-paths';

function loadEnv(): void {
  for (const envPath of getEnvFilePaths()) {
    config({ path: envPath, override: true });
  }
}

/**
 * Purge chirurgicale : supprime uniquement les entrées `lead_events`.
 * Les tables liées en cascade (historique, simulations) sont vidées par FK.
 * Ne touche pas User, Campaign, LandingPage, PageVersion, etc.
 */
async function purgeAllLeads(prisma: PrismaClient): Promise<number> {
  const result = await prisma.leadEvent.deleteMany({});
  return result.count;
}

async function main(): Promise<void> {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL est requis pour purger les leads.');
  }

  console.log('🧹 Démarrage du nettoyage des leads de test...');

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const deletedCount = await purgeAllLeads(prisma);
    console.log(`ℹ️  ${deletedCount} lead(s) supprimé(s).`);
    console.log('✅ Tous les leads ont été supprimés avec succès.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('[purge-leads] Échec :', error);
  process.exit(1);
});
