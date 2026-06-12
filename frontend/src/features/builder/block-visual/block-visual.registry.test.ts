import { describe, expect, it } from 'vitest';
import { buildControlPatch } from '@/features/builder-v3/panels/inspector/inspector-control-utils';
import { getBlockVisualInspectorControls } from './block-visual.inspector-controls';
import {
  appendBlockVisualToClass,
  buildCampaignLeadHeroBlockVisualClasses,
  buildHeroVehicleOfferBlockVisualClasses,
  hasBlockVisualControls,
  parseCampaignLeadHeroBlockVisual,
  sanitizeBlockVisualPatch,
} from './block-visual.registry';
import { applyBlockVariantSafely, mergeVariantPatchIntoProps } from '../block-variants/apply-block-variant';
import { campaignLeadHeroDefaultContent, campaignLeadHeroDefaultDesign } from '../blocks/campaign-lead-hero/campaign-lead-hero.definition';
import {
  buildCampaignLeadHeroSectionClasses,
  resolveContentPlacement,
} from '../blocks/campaign-lead-hero/parse-campaign-lead-hero-props';

describe('block-visual registry', () => {
  it('exposes controls only for supported block types', () => {
    expect(hasBlockVisualControls('campaign_lead_hero')).toBe(true);
    expect(hasBlockVisualControls('hero_vehicle_offer')).toBe(true);
    expect(hasBlockVisualControls('faq')).toBe(true);
    expect(hasBlockVisualControls('footer_legal')).toBe(false);
    expect(getBlockVisualInspectorControls('footer_legal')).toEqual([]);
  });

  it('renders campaign_lead_hero block visual modifier classes', () => {
    const classes = buildCampaignLeadHeroBlockVisualClasses({
      heroHeight: 'tall',
      formWidth: 'lg',
      formPosition: 'left',
      mediaRatio: 'cinematic',
      mediaEmphasis: 'form_focus',
      contentMaxWidth: 'sm',
      formCardStyle: 'glass',
      verticalAlignment: 'top',
    });

    expect(classes).toContain('lp-campaign-lead-hero--bv-height-tall');
    expect(classes).toContain('lp-campaign-lead-hero--bv-form-width-lg');
    expect(classes).toContain('lp-campaign-lead-hero--bv-form-card-glass');
  });

  it('renders hero_vehicle_offer block visual modifier classes', () => {
    const classes = buildHeroVehicleOfferBlockVisualClasses({
      heroHeight: 'compact',
      vehicleImageScale: 'xl',
      vehicleImagePosition: 'center',
      offerCardStyle: 'elevated',
      priceEmphasis: 'strong',
      layoutEmphasis: 'vehicle_focus',
      badgePlacement: 'media',
    });

    expect(classes).toContain('lp-hero-vehicle-offer--bv-height-compact');
    expect(classes).toContain('lp-hero-vehicle-offer--bv-image-scale-xl');
    expect(classes).toContain('lp-hero-vehicle-offer--bv-price-emphasis-strong');
  });

  it('sanitizes invalid block visual values to safe defaults', () => {
    const parsed = parseCampaignLeadHeroBlockVisual({
      blockVisual: {
        heroHeight: 'INVALID',
        formWidth: 'xxl',
        mediaRatio: 'blob:evil',
      },
    });

    expect(parsed.heroHeight).toBe('default');
    expect(parsed.formWidth).toBe('md');
    expect(parsed.mediaRatio).toBe('landscape');
  });

  it('buildControlPatch emits sanitized blockVisual patch for hero controls', () => {
    const control = getBlockVisualInspectorControls('campaign_lead_hero').find(
      (c) => c.propKey === 'formWidth',
    );
    expect(control).toBeDefined();

    const patch = buildControlPatch({}, control!, 'lg');
    expect(patch).toEqual({ blockVisual: { formWidth: 'lg' } });

    const sanitized = sanitizeBlockVisualPatch('campaign_lead_hero', patch.blockVisual as Record<string, unknown>);
    expect(sanitized.formWidth).toBe('lg');
  });

  it('merges block visual classes into campaign hero section classes', () => {
    const classes = buildCampaignLeadHeroSectionClasses(
      {
        ...campaignLeadHeroDefaultContent,
        layoutVariant: 'media_left_form_right',
        resolvedContentPlacement: resolveContentPlacement('media_left_form_right', undefined),
        design: campaignLeadHeroDefaultDesign,
      },
      {
        blockVisual: { heroHeight: 'tall', formWidth: 'sm', mediaRatio: 'portrait' },
      },
    );

    expect(classes).toContain('lp-campaign-lead-hero--bv-height-tall');
    expect(classes).toContain('lp-campaign-lead-hero--bv-form-width-sm');
    expect(classes).toContain('lp-campaign-lead-hero--bv-media-ratio-portrait');
  });

  it('variants apply blockVisual without overwriting campaign content', () => {
    const current = {
      campaignTitle: 'Titre original',
      offerBadge: 'Offre VIP',
      formTitle: 'Mon formulaire',
    };

    const patch = applyBlockVariantSafely('campaign_lead_hero', current, 'campaign-hero-compact-lead');
    expect(patch).not.toBeNull();

    const merged = mergeVariantPatchIntoProps(current, patch!);
    expect(merged.campaignTitle).toBe('Titre original');
    expect(merged.offerBadge).toBe('Offre VIP');
    expect(merged.formTitle).toBe('Mon formulaire');
    expect(merged.blockVisual).toMatchObject({
      heroHeight: 'compact',
      formWidth: 'sm',
    });
  });

  it('appendBlockVisualToClass preserves base classes', () => {
    const result = appendBlockVisualToClass('faq', 'lp-block lp-faq', {
      blockVisual: { faqStyle: 'boxed', faqDensity: 'compact' },
    });
    expect(result).toContain('lp-block lp-faq');
    expect(result).toContain('lp-faq--bv-style-boxed');
    expect(result).toContain('lp-faq--bv-density-compact');
  });
});
