import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { materializeCampaignTemplate, selectFirstMeaningfulBlockId } from './apply-campaign-template';
import {
  CAMPAIGN_PAGE_TEMPLATES,
  getCampaignPageTemplateById,
  getGroupedCampaignPageTemplates,
} from './campaign-page-templates';
import { BRAND_PAGE_TEMPLATES } from './brand-page-templates';
import { countPremiumBlocks, templateHasMotion } from './brand-page-template-recipes';
import { isBackendSupportedBlockType } from '../registry/backend-block-types';
import { PREMIUM_ANIMATED_BLOCK_TYPES } from '@/features/builder/block-motion';

const NEW_BRAND_TEMPLATE_IDS = [
  'ford-brand-showcase',
  'opel-brand-showcase',
  'vehicle-offer-page',
  'test-drive-conversion',
  'sav-service-campaign',
] as const;

describe('brand page templates registry', () => {
  it('includes five production brand page recipes', () => {
    expect(BRAND_PAGE_TEMPLATES).toHaveLength(5);
    for (const id of NEW_BRAND_TEMPLATE_IDS) {
      expect(getCampaignPageTemplateById(id)).toBeDefined();
    }
    expect(CAMPAIGN_PAGE_TEMPLATES.length).toBe(10);
  });

  it('groups templates by use case for TemplatesPanel', () => {
    const groups = getGroupedCampaignPageTemplates();
    expect(groups.some((g) => g.group.id === 'brand-page' && g.templates.length >= 2)).toBe(true);
    expect(groups.some((g) => g.group.id === 'vehicle-offer' && g.templates.length >= 2)).toBe(true);
    expect(groups.some((g) => g.group.id === 'conversion' && g.templates.length >= 3)).toBe(true);
    expect(groups.some((g) => g.group.id === 'service' && g.templates.length >= 1)).toBe(true);
  });

  it('each brand template uses only supported block types', () => {
    for (const template of BRAND_PAGE_TEMPLATES) {
      for (const block of template.blocks) {
        expect(isBackendSupportedBlockType(block.type)).toBe(true);
      }
    }
  });

  it('includes premium animated blocks and motion-ready sections', () => {
    const ford = getCampaignPageTemplateById('ford-brand-showcase')!;
    expect(countPremiumBlocks(ford)).toBeGreaterThanOrEqual(4);
    expect(templateHasMotion(ford)).toBe(true);
    expect(
      ford.blocks.filter((b) =>
        (PREMIUM_ANIMATED_BLOCK_TYPES as readonly string[]).includes(b.type),
      ).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it('materializes without remote or blob image URLs', () => {
    for (const id of NEW_BRAND_TEMPLATE_IDS) {
      const blocks = materializeCampaignTemplate(getCampaignPageTemplateById(id)!);
      const serialized = JSON.stringify(blocks);
      expect(serialized).not.toMatch(/https?:\/\//);
      expect(serialized).not.toMatch(/blob:/);
    }
  });

  it('selects hero/showcase as first meaningful block', () => {
    const fordBlocks = materializeCampaignTemplate(getCampaignPageTemplateById('ford-brand-showcase')!);
    const fordHeroId = selectFirstMeaningfulBlockId(fordBlocks);
    expect(fordBlocks.find((b) => b.id === fordHeroId)?.type).toBe('vehicle_showcase_split');

    const opelBlocks = materializeCampaignTemplate(getCampaignPageTemplateById('opel-brand-showcase')!);
    expect(selectFirstMeaningfulBlockId(opelBlocks)).toBe(opelBlocks[0]?.id);
    expect(opelBlocks[0]?.type).toBe('campaign_lead_hero');
  });
});

describe('brand page template theme apply', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('applies Ford brand theme for Ford brand showcase', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('ford-brand-showcase');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#003478');
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe(
      useBuilderDocumentStore.getState().blocks[0]?.id,
    );
  });

  it('applies Opel brand theme for Opel brand showcase', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('opel-brand-showcase');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#f7d300');
  });

  it('undo restores document after brand template apply', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      {
        id: 'block-1',
        type: 'faq',
        label: 'FAQ',
        sortOrder: 0,
        propsJson: { heading: 'Avant' },
      },
    ]);
    useBuilderDocumentStore.getState().applyCampaignTemplate('ford-brand-showcase');
    expect(useBuilderDocumentStore.getState().blocks.length).toBeGreaterThan(5);
    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.heading).toBe('Avant');
  });
});
