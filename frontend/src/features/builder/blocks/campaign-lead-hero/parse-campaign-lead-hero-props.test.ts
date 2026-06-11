import { describe, expect, it } from 'vitest';
import { resolveBrandPreset } from '../../brand-presets/resolve-brand-preset';
import {
  campaignLeadHeroDefaultContent,
  campaignLeadHeroDefaultDesign,
} from './campaign-lead-hero.definition';
import {
  buildCampaignLeadHeroSectionClasses,
  isDualMediaLayout,
  parseCampaignLeadHeroProps,
  resolveContentPlacement,
} from './parse-campaign-lead-hero-props';
import { CAMPAIGN_LEAD_HERO_TYPE } from './campaign-lead-hero.types';
import { getPremiumBlockDefinition } from '../../block-registry/block-registry';

describe('campaign-lead-hero props', () => {
  it('is registered in premium block registry', () => {
    const definition = getPremiumBlockDefinition(CAMPAIGN_LEAD_HERO_TYPE);
    expect(definition?.type).toBe('campaign_lead_hero');
    expect(definition?.defaultContent.campaignTitle).toBeTruthy();
    expect(definition?.defaultDesign.formTheme).toBe('light');
    expect(definition?.defaultContent.contentPlacement).toBe('hidden');
  });

  it('parses dual media layout and secondary image fields', () => {
    const parsed = parseCampaignLeadHeroProps({
      layoutVariant: 'dual_media_form_right',
      secondaryImage: 'asset-secondary',
      secondaryImageUrl: 'https://example.com/secondary.jpg',
      secondaryImageAlt: 'Vue arrière',
    });

    expect(parsed.layoutVariant).toBe('dual_media_form_right');
    expect(isDualMediaLayout(parsed.layoutVariant)).toBe(true);
    expect(parsed.secondaryImage).toBe('asset-secondary');
    expect(parsed.secondaryImageUrl).toBe('https://example.com/secondary.jpg');
    expect(parsed.secondaryImageAlt).toBe('Vue arrière');
    expect(parsed.resolvedContentPlacement).toBe('overlay_media');
  });

  it('builds layout modifier classes for all variants', () => {
    const variants = [
      'media_left_form_right',
      'form_left_media_right',
      'background_media_form_right',
      'background_media_form_left',
      'dual_media_form_right',
      'dual_media_form_left',
    ] as const;

    for (const layoutVariant of variants) {
      const classes = buildCampaignLeadHeroSectionClasses({
        ...campaignLeadHeroDefaultContent,
        layoutVariant,
        resolvedContentPlacement: resolveContentPlacement(layoutVariant, undefined),
        design: campaignLeadHeroDefaultDesign,
      });
      expect(classes).toContain(`lp-campaign-lead-hero--layout-${layoutVariant}`);
    }
  });

  it('maps formTheme and content placement into section classes', () => {
    const classes = buildCampaignLeadHeroSectionClasses({
      ...campaignLeadHeroDefaultContent,
      layoutVariant: 'media_left_form_right',
      resolvedContentPlacement: 'hidden',
      design: { ...campaignLeadHeroDefaultDesign, formTheme: 'light' },
    });

    expect(classes).toContain('lp-campaign-lead-hero--form-theme-light');
    expect(classes).toContain('lp-campaign-lead-hero--content-hidden');
    expect(classes).toContain('lp-campaign-lead-hero--layout-media_left_form_right');
  });

  it('defaults content placement by layout when not set', () => {
    expect(resolveContentPlacement('media_left_form_right', undefined)).toBe('hidden');
    expect(resolveContentPlacement('background_media_form_right', undefined)).toBe('beside_form');
    expect(resolveContentPlacement('dual_media_form_left', undefined)).toBe('overlay_media');
  });

  it('falls back to default brand when brandId is unknown', () => {
    const parsed = parseCampaignLeadHeroProps({ brandId: 'not_a_real_brand' });
    const brand = resolveBrandPreset(parsed.brandId);
    expect(brand.name).toBe('Auto Hall');
    expect(parsed.campaignTitle).toBe(campaignLeadHeroDefaultContent.campaignTitle);
    expect(parsed.design.formTheme).toBe('light');
  });
});
