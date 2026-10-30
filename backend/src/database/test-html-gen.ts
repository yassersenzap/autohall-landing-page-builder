import { config } from 'dotenv';
import { join } from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { generateExportHtml } from '../../../frontend/src/features/builder-v4/lib/generate-export-html';
import * as fs from 'fs';

function loadEnv(): void {
  const rootEnv = join(__dirname, '..', '..', '..', '.env');
  const backendEnv = join(__dirname, '..', '..', '.env');
  config({ path: rootEnv });
  config({ path: backendEnv, override: true });
}

async function main() {
  loadEnv();
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const pvs = await prisma.pageVersion.findMany({
    include: { studioDocument: true }
  });
  const pv = pvs.find(p => p.id.toLowerCase().includes('f5ee27b2'));
  if (!pv) {
    console.error('Page version not found');
    return;
  }

  const doc = pv.studioDocument?.documentJson as any;
  if (!doc) {
    console.error('No document JSON');
    return;
  }

  console.log('Generating HTML for page version:', pv.id);
  const html = generateExportHtml(doc, {
    apiBaseUrl: 'http://localhost:3000',
    campaignId: '00000000-0000-4000-8000-000000000001',
    landingPageId: pv.landingPageId,
    pageVersionId: pv.id,
  });

  const outPath = join(__dirname, '..', '..', '..', '.gemini', 'antigravity-ide', 'brain', 'da7d60df-3dfc-4f53-b17e-a8582db76163', 'scratch', 'exported_index.html');
  fs.writeFileSync(outPath, html);
  console.log('HTML written to:', outPath);
  console.log('HTML contains ford-promo:', html.includes('ford-promo'));
  console.log('HTML contains lp-form class:', html.includes('class="lp-form"'));
  console.log('HTML contains __EXPORT_API_URL__:', html.includes('__EXPORT_API_URL__'));
}

main().catch(console.error);
