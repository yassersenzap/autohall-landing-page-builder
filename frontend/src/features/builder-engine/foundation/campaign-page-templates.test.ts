import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { isBuilderDocumentDirty } from '../lib/compare-builder-document';
import {
  materializeCampaignTemplate,
  selectFirstMeaningfulBlockId,
} from './apply-campaign-template';
import {
  CAMPAIGN_PAGE_TEMPLATE_BLOCK_TYPES,
  CAMPAIGN_PAGE_TEMPLATES,
  getCampaignPageTemplateById,
} from './campaign-page-templates';
import { isBackendSupportedBlockType } from '../registry/backend-block-types';

const EXPECTED_TEMPLATE_IDS = [
  'chery-campaign-offer',
  'chery-model-landing',
  'ford-offer-campaign',
  'opel-test-drive',
  'autohall-generic-campaign',
] as const;

describe('campaign page templates registry', () => {
  it('contains the five premium SI Digital templates', () => {
    expect(CAMPAIGN_PAGE_TEMPLATES).toHaveLength(5);
    for (const id of EXPECTED_TEMPLATE_IDS) {
      expect(getCampaignPageTemplateById(id)).toBeDefined();
    }
  });

  it('each template has non-empty blocks with allowed types only', () => {
    for (const template of CAMPAIGN_PAGE_TEMPLATES) {
      expect(template.blocks.length).toBeGreaterThan(3);
      for (const block of template.blocks) {
        expect(CAMPAIGN_PAGE_TEMPLATE_BLOCK_TYPES.has(block.type)).toBe(true);
        expect(isBackendSupportedBlockType(block.type)).toBe(true);
      }
    }
  });

  it('materializes blocks with French placeholder copy and no remote image URLs', () => {
    for (const template of CAMPAIGN_PAGE_TEMPLATES) {
      const blocks = materializeCampaignTemplate(template);
      expect(blocks.length).toBe(template.blocks.length);
      expect(blocks[0]?.propsJson).toBeTruthy();

      const serialized = JSON.stringify(blocks);
      expect(serialized).not.toMatch(/https?:\/\//);
      expect(serialized).not.toMatch(/blob:/);
    }
  });

  it('selects hero block as first meaningful selection target', () => {
    const template = getCampaignPageTemplateById('ford-offer-campaign')!;
    const blocks = materializeCampaignTemplate(template);
    const selectedId = selectFirstMeaningfulBlockId(blocks);
    const selected = blocks.find((block) => block.id === selectedId);
    expect(selected?.type).toBe('campaign_lead_hero');
  });
});

describe('builder-document.store applyCampaignTemplate', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('applies template blocks to empty document and selects hero', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('chery-campaign-offer');

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks.length).toBeGreaterThan(4);
    expect(state.blocks[0]?.type).toBe('campaign_lead_hero');
    expect(state.selectedBlockId).toBe(state.blocks[0]?.id);
    expect(state.blocks[0]?.propsJson.brandId).toBe('chery');
  });

  it('marks document dirty compared to empty baseline after apply', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('opel-test-drive');
    const { blocks } = useBuilderDocumentStore.getState();
    expect(
      isBuilderDocumentDirty(blocks, [], false),
    ).toBe(true);
  });

  it('replaces existing blocks when template is applied', () => {
    useBuilderDocumentStore.getState().applyPageStarter(['faq'], 'replace');
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);

    useBuilderDocumentStore.getState().applyCampaignTemplate('autohall-generic-campaign');

    const { blocks } = useBuilderDocumentStore.getState();
    expect(blocks.some((block) => block.type === 'faq' && blocks.length === 1)).toBe(false);
    expect(blocks.some((block) => block.type === 'campaign_lead_hero')).toBe(true);
    expect(blocks.length).toBeGreaterThan(3);
  });
});
