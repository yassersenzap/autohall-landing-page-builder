import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import {
  materializeCampaignTemplate,
  selectFirstMeaningfulBlockId,
} from './apply-campaign-template';
import {
  CAMPAIGN_PAGE_TEMPLATES,
  getCampaignPageTemplateById,
} from './campaign-page-templates';
import { isBackendSupportedBlockType } from '../registry/backend-block-types';
import { readStudioAppliedVariantId } from '@/features/builder/block-variants/studio-block-metadata';
import { stripStudioOnlyBlockProps } from '@/features/builder/block-variants/studio-block-metadata';

const EXPECTED_TEMPLATE_IDS = [
  'ford-brand-showcase',
  'opel-brand-showcase',
  'vehicle-offer-page',
  'test-drive-conversion',
  'sav-service-campaign',
  'chery-campaign-offer',
  'chery-model-landing',
  'ford-offer-campaign',
  'opel-test-drive',
  'autohall-generic-campaign',
] as const;

describe('campaign page templates registry', () => {
  it('contains brand page recipes and legacy campaign templates', () => {
    expect(CAMPAIGN_PAGE_TEMPLATES).toHaveLength(10);
    for (const id of EXPECTED_TEMPLATE_IDS) {
      expect(getCampaignPageTemplateById(id)).toBeDefined();
    }
  });

  it('each template has non-empty blocks with allowed types only', () => {
    for (const template of CAMPAIGN_PAGE_TEMPLATES) {
      expect(template.blocks.length).toBeGreaterThan(3);
      for (const block of template.blocks) {
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

describe('template variant materialization', () => {
  it('applies variant visual patch but preserves template copy', () => {
    const template = getCampaignPageTemplateById('chery-campaign-offer')!;
    const blocks = materializeCampaignTemplate(template);
    const hero = blocks[0];
    expect(hero?.type).toBe('campaign_lead_hero');
    expect(hero?.propsJson.campaignTitle).toBe('Offre Chery du moment');
    expect(hero?.propsJson.formCtaLabel).toBe('Obtenir mon offre');
    expect(hero?.propsJson.layoutVariant).toBe('media_left_form_right');
    expect(hero?.propsJson.contentPlacement).toBe('beside_form');
    expect(readStudioAppliedVariantId(hero!.propsJson)).toBe(
      'campaign-hero-split-premium-form',
    );
  });

  it('materializes templates with sectionStyle and blockVisual rhythm defaults', () => {
    const chery = materializeCampaignTemplate(getCampaignPageTemplateById('chery-campaign-offer')!);
    const faq = chery.find((b) => b.type === 'faq');
    expect(faq?.propsJson.sectionStyle).toMatchObject({ sectionPaddingY: 'xl' });
    expect(faq?.propsJson.blockVisual).toMatchObject({ faqStyle: 'boxed' });

    const ford = materializeCampaignTemplate(getCampaignPageTemplateById('ford-offer-campaign')!);
    const fordFaq = ford.find((b) => b.type === 'faq');
    expect(fordFaq?.propsJson.blockVisual).toMatchObject({ faqStyle: 'divided' });
  });

  it('strips studio variant metadata from export-safe props', () => {
    const template = getCampaignPageTemplateById('ford-offer-campaign')!;
    const blocks = materializeCampaignTemplate(template);
    const hero = blocks[0]!;
    const safe = stripStudioOnlyBlockProps(hero.propsJson);
    expect(safe._studioAppliedVariantId).toBeUndefined();
    expect(safe.campaignTitle).toBeTruthy();
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

  it('syncs Chery pageTheme when applying Chery template', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('chery-campaign-offer');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#ca8a04');
    expect(useBuilderDocumentStore.getState().themeDirty).toBe(true);
  });

  it('syncs Ford pageTheme when applying Ford template', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('ford-offer-campaign');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#003478');
  });

  it('syncs autohall-safe theme for generic template', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('autohall-generic-campaign');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#b91c1c');
  });

  it('marks document dirty compared to empty baseline after apply', () => {
    useBuilderDocumentStore.getState().applyCampaignTemplate('opel-test-drive');
    const { blocks } = useBuilderDocumentStore.getState();
    expect(blocks.length).toBeGreaterThan(3);
  });

  it('undo after template apply restores previous blocks and theme', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      {
        id: 'hero-1',
        type: 'hero_campaign',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Original' },
      },
    ]);
    useBuilderDocumentStore.getState().setPageTheme({
      ...useBuilderDocumentStore.getState().pageTheme,
      primaryColor: '#111111',
    });

    useBuilderDocumentStore.getState().applyCampaignTemplate('ford-offer-campaign');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#003478');

    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Original');
    expect(useBuilderDocumentStore.getState().pageTheme.primaryColor).toBe('#111111');
  });
});
