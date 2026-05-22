import { config } from 'dotenv';
import { join } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CampaignStatus,
  FormFieldType,
  LandingPageStatus,
  LeadEventStatus,
  LeadRequestType,
  PageVersionStatus,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

function loadEnv(): void {
  const rootEnv = join(__dirname, '..', '..', '.env');
  const backendEnv = join(__dirname, '..', '.env');
  config({ path: rootEnv });
  config({ path: backendEnv, override: true });
}

const SEED_ADMIN_EMAIL = 'admin@autohall.local';
/** Mot de passe de développement uniquement — ne jamais utiliser en production. */
const SEED_ADMIN_PASSWORD = 'Autohall_Dev_2026!';

async function runSeed(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: {
      fullName: 'Administrateur Auto Hall (seed)',
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      fullName: 'Administrateur Auto Hall (seed)',
      email: SEED_ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      name: 'Campagne démo — Offre printemps',
      brand: 'Auto Hall',
      model: 'Modèle démo',
      campaignType: 'PROMOTION',
      status: CampaignStatus.ACTIVE,
      createdById: admin.id,
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Campagne démo — Offre printemps',
      brand: 'Auto Hall',
      model: 'Modèle démo',
      campaignType: 'PROMOTION',
      description: 'Données de démonstration pour le développement local.',
      status: CampaignStatus.ACTIVE,
      createdById: admin.id,
    },
  });

  const landingPage = await prisma.landingPage.upsert({
    where: { slug: 'demo-offre-printemps' },
    update: {
      title: 'Landing démo — Offre printemps',
      campaignId: campaign.id,
      status: LandingPageStatus.DRAFT,
      createdById: admin.id,
    },
    create: {
      title: 'Landing démo — Offre printemps',
      slug: 'demo-offre-printemps',
      campaignId: campaign.id,
      status: LandingPageStatus.DRAFT,
      createdById: admin.id,
    },
  });

  const pageVersion = await prisma.pageVersion.upsert({
    where: {
      landingPageId_versionNumber: {
        landingPageId: landingPage.id,
        versionNumber: 1,
      },
    },
    update: {
      label: 'Version initiale',
      status: PageVersionStatus.DRAFT,
      themeJson: {
        version: '1.0',
        page: {
          title: 'Offre Auto Hall',
          language: 'fr',
          theme: {
            primaryColor: '#003B73',
            fontFamily: 'Inter',
          },
        },
      },
      createdById: admin.id,
    },
    create: {
      landingPageId: landingPage.id,
      versionNumber: 1,
      label: 'Version initiale',
      status: PageVersionStatus.DRAFT,
      themeJson: {
        version: '1.0',
        page: {
          title: 'Offre Auto Hall',
          language: 'fr',
          theme: {
            primaryColor: '#003B73',
            fontFamily: 'Inter',
          },
        },
      },
      createdById: admin.id,
    },
  });

  await prisma.pageBlock.upsert({
    where: {
      pageVersionId_blockKey: {
        pageVersionId: pageVersion.id,
        blockKey: 'block_hero_001',
      },
    },
    update: {
      blockType: 'hero',
      sortOrder: 1,
      propsJson: {
        title: 'Promo exclusive Auto Hall',
        subtitle: 'Découvrez nos offres du mois',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
      },
    },
    create: {
      pageVersionId: pageVersion.id,
      blockKey: 'block_hero_001',
      blockType: 'hero',
      sortOrder: 1,
      propsJson: {
        title: 'Promo exclusive Auto Hall',
        subtitle: 'Découvrez nos offres du mois',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
      },
    },
  });

  const form = await prisma.form.upsert({
    where: { pageVersionId: pageVersion.id },
    update: {
      requestType: LeadRequestType.TEST_DRIVE,
      title: 'Demande d’essai',
      subtitle: 'Un conseiller vous recontacte sous 24 h.',
      isEnabled: true,
    },
    create: {
      pageVersionId: pageVersion.id,
      requestType: LeadRequestType.TEST_DRIVE,
      title: 'Demande d’essai',
      subtitle: 'Un conseiller vous recontacte sous 24 h.',
      isEnabled: true,
    },
  });

  const formFields: Array<{
    fieldKey: string;
    fieldType: FormFieldType;
    label: string;
    sortOrder: number;
    isRequired: boolean;
  }> = [
    {
      fieldKey: 'full_name',
      fieldType: FormFieldType.FULL_NAME,
      label: 'Nom complet',
      sortOrder: 1,
      isRequired: true,
    },
    {
      fieldKey: 'phone',
      fieldType: FormFieldType.PHONE,
      label: 'Téléphone',
      sortOrder: 2,
      isRequired: true,
    },
    {
      fieldKey: 'email',
      fieldType: FormFieldType.EMAIL,
      label: 'Email',
      sortOrder: 3,
      isRequired: false,
    },
    {
      fieldKey: 'city',
      fieldType: FormFieldType.CITY,
      label: 'Ville',
      sortOrder: 4,
      isRequired: false,
    },
  ];

  for (const field of formFields) {
    await prisma.formField.upsert({
      where: {
        formId_fieldKey: {
          formId: form.id,
          fieldKey: field.fieldKey,
        },
      },
      update: field,
      create: {
        formId: form.id,
        ...field,
      },
    });
  }

  const existingLead = await prisma.leadEvent.findFirst({
    where: {
      landingPageId: landingPage.id,
      email: 'lead.demo@example.com',
    },
  });

  if (!existingLead) {
    await prisma.leadEvent.create({
      data: {
        campaignId: campaign.id,
        landingPageId: landingPage.id,
        fullName: 'Jean Dupont (démo)',
        phone: '+212600000000',
        email: 'lead.demo@example.com',
        city: 'Casablanca',
        brand: campaign.brand,
        model: campaign.model,
        requestType: LeadRequestType.TEST_DRIVE,
        sourceUrl: 'https://demo.autohall.local/offre-printemps',
        rawPayload: {
          source: 'seed',
          formId: form.id,
          fields: {
            full_name: 'Jean Dupont (démo)',
            phone: '+212600000000',
            email: 'lead.demo@example.com',
            city: 'Casablanca',
          },
        },
        status: LeadEventStatus.RECEIVED,
      },
    });
  }

  console.log('[seed] Données de démonstration prêtes.');
  console.log(`[seed] Admin : ${SEED_ADMIN_EMAIL} (mot de passe documenté dans prisma/seed.ts — dev uniquement)`);
  console.log(`[seed] Campagne : ${campaign.name}`);
  console.log(`[seed] Landing : /${landingPage.slug} (version ${pageVersion.versionNumber})`);
}

async function main(): Promise<void> {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run the seed.');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await runSeed(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('[seed] Échec :', error);
  process.exit(1);
});
