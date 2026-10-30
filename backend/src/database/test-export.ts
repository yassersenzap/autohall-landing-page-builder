import { config } from 'dotenv';
import { join } from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function loadEnv(): void {
  const rootEnv = join(__dirname, '..', '..', '.env');
  const backendEnv = join(__dirname, '..', '.env');
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
    console.error('Page version not found in memory filter. List:');
    pvs.forEach(p => console.log(typeof p.id, JSON.stringify(p.id)));
    return;
  }
  console.log('--- DB Page Details ---');
  console.log('Title:', pv.label);
  const docJson = pv.studioDocument?.documentJson as any;
  if (!docJson) {
    console.log('No studio document found');
    return;
  }
  console.log('Nodes count:', Object.keys(docJson.nodes || {}).length);
  const nodes = docJson.nodes || {};
  const blocks = Object.values(nodes).map((n: any) => ({
    id: n.id,
    kind: n.kind,
    blockType: n.props?.blockType,
  }));
  console.log('Blocks:', blocks);
}

main().catch(console.error);
