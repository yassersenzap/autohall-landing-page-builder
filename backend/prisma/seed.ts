import { config } from 'dotenv';
import { join } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CampaignStatus,
  FormFieldType,
  Prisma,
  LandingPageStatus,
  LeadEventStatus,
  LeadRequestType,
  PageVersionStatus,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { buildDefaultStudioV2Document } from './seed-data/default-studio-document';

function loadEnv(): void {
  const rootEnv = join(__dirname, '..', '..', '.env');
  const backendEnv = join(__dirname, '..', '.env');
  config({ path: rootEnv });
  config({ path: backendEnv, override: true });
}

const DEFAULT_SEED_ADMIN_EMAIL = 'admin@autohall.local';

function resolveSeedAdminCredentials(): { email: string; password: string } {
  const email =
    process.env.SEED_ADMIN_EMAIL?.trim() || DEFAULT_SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!password) {
    throw new Error(
      '[seed] SEED_ADMIN_PASSWORD is not set. Configure it in the root .env (Docker) or backend/.env (local dev), then run npm run db:seed again.',
    );
  }

  if (password.length < 12) {
    throw new Error(
      '[seed] SEED_ADMIN_PASSWORD must be at least 12 characters.',
    );
  }

  return { email, password };
}

async function runSeed(
  prisma: PrismaClient,
  adminEmail: string,
  adminPassword: string,
): Promise<void> {
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: 'Administrateur Auto Hall (seed)',
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      fullName: 'Administrateur Auto Hall (seed)',
      email: adminEmail,
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
            mode: 'dark',
          },
          seo: {
            title: 'Offre véhicule — Auto Hall',
            description: 'Landing démo promotion Auto Hall.',
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
            mode: 'dark',
          },
          seo: {
            title: 'Offre véhicule — Auto Hall',
            description: 'Landing démo promotion Auto Hall.',
          },
        },
      },
      createdById: admin.id,
    },
  });

  await prisma.pageBlock.deleteMany({ where: { pageVersionId: pageVersion.id } });

  const demoBlocks: Array<{ blockKey: string; blockType: string; sortOrder: number; propsJson: Record<string, unknown> }> = [
    {
      blockKey: 'block_hero',
      blockType: 'hero',
      sortOrder: 1,
      propsJson: {
        eyebrow: 'Offre en cours',
        title: 'Promo exclusive Auto Hall',
        subtitle: 'Découvrez nos offres du moment en concession.',
        buttonText: 'Je suis intéressé',
        buttonTarget: '#lead-form',
        promoBadge: 'Offre limitée',
        design: { layoutVariant: 'split_image_right', backgroundMode: 'dark', mediaPosition: 'right' },
      },
    },
    {
      blockKey: 'block_features',
      blockType: 'features',
      sortOrder: 2,
      propsJson: {
        heading: 'Points forts',
        subtitle: 'Les atouts du véhicule ou de l’offre.',
        items: [
          { title: 'Garantie', description: 'Conditions constructeur à préciser.' },
          { title: 'Essai', description: 'Essai en concession sur rendez-vous.' },
        ],
        design: { layoutVariant: 'grid_cards', backgroundMode: 'light' },
      },
    },
    {
      blockKey: 'block_form',
      blockType: 'lead_form',
      sortOrder: 3,
      propsJson: {
        title: 'Contactez-nous',
        subtitle: 'Un conseiller vous recontacte.',
        submitText: 'Envoyer votre demande',
        consentLabel:
          'J’ai lu et j’accepte sans réserve les termes de la clause relative à la protection des données personnelles.',
        requiredFieldsNote: '* Champs obligatoires.',
        formConfig: {
          showCivility: true,
          useSplitName: true,
          showCity: true,
          showVehicleModel: true,
          showMessage: false,
          showEmail: true,
          showConsent: true,
        },
        fields: [
          { name: 'civility', label: 'Civilité', type: 'select', required: false },
          { name: 'lastName', label: 'Nom', type: 'text', required: true },
          { name: 'firstName', label: 'Prénom', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: false },
          { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
          { name: 'city', label: 'Ville', type: 'select', required: true },
          { name: 'vehicleModel', label: 'Modèle souhaité', type: 'text', required: false },
        ],
        design: { layoutVariant: 'card_right' },
      },
    },
    {
      blockKey: 'block_faq',
      blockType: 'faq',
      sortOrder: 4,
      propsJson: {
        heading: 'Questions fréquentes',
        items: [
          {
            question: 'Comment profiter de l’offre ?',
            answer: 'Remplissez le formulaire, un conseiller vous rappelle.',
          },
        ],
      },
    },
    {
      blockKey: 'block_footer',
      blockType: 'footer_legal',
      sortOrder: 5,
      propsJson: {
        legalText: 'Auto Hall — mentions légales à compléter avant publication.',
      },
    },
  ];

  const studioDocument = buildDefaultStudioV2Document() as Prisma.InputJsonValue;

  await prisma.pageVersionStudioDocument.upsert({
    where: { pageVersionId: pageVersion.id },
    update: {
      engine: 'puck',
      documentJson: studioDocument,
    },
    create: {
      pageVersionId: pageVersion.id,
      engine: 'puck',
      documentJson: studioDocument,
    },
  });

  for (const spec of demoBlocks) {
    await prisma.pageBlock.upsert({
      where: {
        pageVersionId_blockKey: {
          pageVersionId: pageVersion.id,
          blockKey: spec.blockKey,
        },
      },
      update: {
        blockType: spec.blockType,
        sortOrder: spec.sortOrder,
        propsJson: spec.propsJson as Prisma.InputJsonValue,
      },
      create: {
        pageVersionId: pageVersion.id,
        blockKey: spec.blockKey,
        blockType: spec.blockType,
        sortOrder: spec.sortOrder,
        propsJson: spec.propsJson as Prisma.InputJsonValue,
      },
    });
  }

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
  console.log(`[seed] Admin user ready: ${adminEmail}`);
  console.log('[seed] Password loaded from SEED_ADMIN_PASSWORD.');
  console.log(`[seed] Campagne : ${campaign.name}`);
  console.log(`[seed] Landing : /${landingPage.slug} (version ${pageVersion.versionNumber})`);
  console.log(`[seed] Landing Studio : document prêt pour la version ${pageVersion.id}`);
}

async function main(): Promise<void> {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run the seed.');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const { email: adminEmail, password: adminPassword } =
    resolveSeedAdminCredentials();

  try {
    await runSeed(prisma, adminEmail, adminPassword);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('[seed] Échec :', error);
  process.exit(1);
});
