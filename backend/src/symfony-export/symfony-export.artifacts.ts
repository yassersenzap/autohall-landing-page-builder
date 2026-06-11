import type { BuilderV3ZipTextEntry } from '../studio-v2-renderer/builder-v3-export.utils';
import {
  blockRequiresSymfonyArtifacts,
  blockRequiresSymfonyPageExample,
  parseCampaignLeadHeroFormIntegration,
} from './export-contracts.registry';
import type { CampaignLeadHeroFormIntegration } from './export-contracts.types';
import { buildSymfonyIntegrationReadme } from './symfony-export-readme';
import {
  renderSymfonyCampaignPageExample,
  renderSymfonyTestDriveTwigSlot,
} from './symfony-twig-slot.renderer';

export const SYMFONY_FRAGMENT_ZIP_PATH =
  'symfony/campaign-lead-hero.fragment.html.twig';
export const SYMFONY_PAGE_EXAMPLE_ZIP_PATH =
  'symfony/campaign-page.example.html.twig';
export const SYMFONY_README_ZIP_PATH =
  'symfony/README_SYMFONY_INTEGRATION.md';

export type ExportBlockInput = {
  type: string;
  sortOrder?: number;
  propsJson?: Record<string, unknown>;
};

export type SymfonyExportPlan = {
  includeArtifacts: boolean;
  includePageExample: boolean;
  primaryIntegration: CampaignLeadHeroFormIntegration | null;
};

export function analyzeSymfonyExportPlan(
  blocks: ExportBlockInput[],
): SymfonyExportPlan {
  let primaryIntegration: CampaignLeadHeroFormIntegration | null = null;
  let includeArtifacts = false;
  let includePageExample = false;

  for (const block of blocks) {
    if (block.type !== 'campaign_lead_hero') continue;

    const integration = parseCampaignLeadHeroFormIntegration(
      block.propsJson ?? {},
    );

    if (!primaryIntegration) {
      primaryIntegration = integration;
    }

    if (blockRequiresSymfonyArtifacts(integration)) {
      includeArtifacts = true;
    }
    if (blockRequiresSymfonyPageExample(integration)) {
      includePageExample = true;
    }
  }

  return { includeArtifacts, includePageExample, primaryIntegration };
}

export function buildSymfonyExportZipEntries(input: {
  blocks: ExportBlockInput[];
  pageTitle: string;
}): BuilderV3ZipTextEntry[] {
  const plan = analyzeSymfonyExportPlan(input.blocks);
  if (!plan.includeArtifacts || !plan.primaryIntegration) {
    return [];
  }

  const { symfonyFormIncludeKey } = plan.primaryIntegration;
  const fragmentContent = renderSymfonyTestDriveTwigSlot({
    includeKey: symfonyFormIncludeKey,
  });

  const entries: BuilderV3ZipTextEntry[] = [
    {
      kind: 'text',
      path: SYMFONY_FRAGMENT_ZIP_PATH,
      content: fragmentContent,
    },
    {
      kind: 'text',
      path: SYMFONY_README_ZIP_PATH,
      content: buildSymfonyIntegrationReadme({
        pageTitle: input.pageTitle,
        includeKey: symfonyFormIncludeKey,
        includePageExample: plan.includePageExample,
      }),
    },
  ];

  if (plan.includePageExample) {
    entries.push({
      kind: 'text',
      path: SYMFONY_PAGE_EXAMPLE_ZIP_PATH,
      content: renderSymfonyCampaignPageExample({
        pageTitle: input.pageTitle,
        fragmentTemplatePath: 'builder/campaign-lead-hero.fragment.html.twig',
      }),
    });
  }

  return entries;
}
