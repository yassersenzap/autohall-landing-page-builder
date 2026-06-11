import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { materializeCampaignTemplate } from '@/features/builder-engine/foundation/apply-campaign-template';
import { CAMPAIGN_PAGE_TEMPLATES } from '@/features/builder-engine/foundation/campaign-page-templates';
import {
  applyBlockVariantSafely,
  BLOCK_VARIANTS,
  BLOCK_VARIANT_SUPPORTED_TYPES,
  buildVariantPatchFromDefinition,
  getBlockVariantById,
  getBlockVariantsForType,
  mergeVariantPatchIntoProps,
} from './index';

describe('block variant registry', () => {
  it('contains expected campaign_lead_hero variants', () => {
    const ids = getBlockVariantsForType('campaign_lead_hero').map((v) => v.id);
    expect(ids).toEqual([
      'campaign-hero-split-premium-form',
      'campaign-hero-background-image',
      'campaign-hero-dual-media',
      'campaign-hero-compact-lead',
      'campaign-hero-minimal-offer',
    ]);
  });

  it('contains expected hero_vehicle_offer variants', () => {
    const ids = getBlockVariantsForType('hero_vehicle_offer').map((v) => v.id);
    expect(ids).toHaveLength(5);
    expect(ids).toContain('vehicle-hero-dark-brand');
  });

  it('scopes variants to supported block types only', () => {
    for (const variant of BLOCK_VARIANTS) {
      expect(BLOCK_VARIANT_SUPPORTED_TYPES).toContain(variant.blockType);
      expect(variant.blockType).not.toBe('lead_form');
    }
    expect(getBlockVariantsForType('lead_form')).toHaveLength(0);
  });
});

describe('applyBlockVariantSafely', () => {
  it('applies campaign_lead_hero layout/style but preserves headline/body/CTA', () => {
    const current = {
      campaignTitle: 'Mon titre custom',
      campaignSubtitle: 'Mon sous-titre',
      formCtaLabel: 'Mon CTA',
      legalText: 'Mentions perso',
      layoutVariant: 'media_left_form_right',
      design: { tone: 'light', formTheme: 'light' },
    };

    const patch = applyBlockVariantSafely(
      'campaign_lead_hero',
      current,
      'campaign-hero-background-image',
    );
    expect(patch).toBeTruthy();

    const merged = mergeVariantPatchIntoProps(current, patch!);
    expect(merged.campaignTitle).toBe('Mon titre custom');
    expect(merged.campaignSubtitle).toBe('Mon sous-titre');
    expect(merged.formCtaLabel).toBe('Mon CTA');
    expect(merged.legalText).toBe('Mentions perso');
    expect(merged.layoutVariant).toBe('background_media_form_right');
    expect(merged.design).toMatchObject({ formTheme: 'glass', tone: 'dark' });
  });

  it('applies hero_vehicle_offer variant but preserves model/price/copy', () => {
    const current = {
      modelName: 'Chery Tiggo 7',
      headline: 'Headline perso',
      priceText: '199 900 DH',
      primaryCtaLabel: 'Essai gratuit',
      layoutVariant: 'split-media-right',
      design: { tone: 'light', density: 'comfortable' },
    };

    const patch = applyBlockVariantSafely(
      'hero_vehicle_offer',
      current,
      'vehicle-hero-compact-promo',
    );
    expect(patch).toBeTruthy();

    const merged = mergeVariantPatchIntoProps(current, patch!);
    expect(merged.modelName).toBe('Chery Tiggo 7');
    expect(merged.headline).toBe('Headline perso');
    expect(merged.priceText).toBe('199 900 DH');
    expect(merged.primaryCtaLabel).toBe('Essai gratuit');
    expect(merged.design).toMatchObject({ density: 'compact' });
  });

  it('sanitizes sectionStyle patch and drops invalid keys', () => {
    const variant = getBlockVariantById('faq-clean-accordion')!;
    const patch = buildVariantPatchFromDefinition({
      ...variant,
      sectionStylePatch: {
        ...variant.sectionStylePatch,
        sectionBackground: 'not-a-real-token',
        rogueStudioField: true,
      },
    });

    expect(patch.sectionStyle).toMatchObject({
      sectionPaddingY: 'lg',
      contentAlignment: 'center',
    });
    expect(patch.sectionStyle).not.toHaveProperty('rogueStudioField');
    expect((patch.sectionStyle as Record<string, unknown>).sectionBackground).toBe('default');
  });

  it('ignores unknown variant id safely', () => {
    expect(
      applyBlockVariantSafely('campaign_lead_hero', {}, 'does-not-exist'),
    ).toBeNull();
  });

  it('ignores variant id when block type mismatches', () => {
    expect(
      applyBlockVariantSafely('faq', {}, 'campaign-hero-split-premium-form'),
    ).toBeNull();
  });

  it('does not mutate media URLs or export-only fields from variant patches', () => {
    const variant = getBlockVariantById('campaign-hero-split-premium-form')!;
    const patch = buildVariantPatchFromDefinition({
      ...variant,
      propsPatch: {
        ...variant.propsPatch,
        primaryImage: 'blob:fake',
        formProviderType: 'external_iframe',
        symfonyFormIncludeKey: 'testdrive_campaign',
      },
    });

    expect(patch.primaryImage).toBeUndefined();
    expect(patch.formProviderType).toBeUndefined();
    expect(patch.symfonyFormIncludeKey).toBeUndefined();
  });
});

describe('builder-document.store applyBlockVariant', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('marks document dirty and preserves selection', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      {
        id: 'hero-1',
        type: 'campaign_lead_hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: {
          campaignTitle: 'Titre',
          formCtaLabel: 'CTA',
          layoutVariant: 'media_left_form_right',
        },
      },
    ]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    const ok = useBuilderDocumentStore
      .getState()
      .applyBlockVariant('hero-1', 'campaign-hero-compact-lead');
    expect(ok).toBe(true);

    const state = useBuilderDocumentStore.getState();
    expect(state.themeDirty).toBe(true);
    expect(state.selectedBlockId).toBe('hero-1');
    expect(state.blocks[0]?.propsJson.campaignTitle).toBe('Titre');
    expect(state.blocks[0]?.propsJson.layoutVariant).toBe('form_left_media_right');
  });
});

describe('campaign templates compatibility', () => {
  it('templates still apply and remain valid after variant model addition', () => {
    for (const template of CAMPAIGN_PAGE_TEMPLATES) {
      const blocks = materializeCampaignTemplate(template);
      expect(blocks.length).toBeGreaterThan(0);
      const serialized = JSON.stringify(blocks);
      expect(serialized).not.toMatch(/blob:/);
    }
  });
});
