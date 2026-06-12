import { describe, expect, it } from 'vitest';
import {
  applyBlockVariantSafely,
  mergeVariantPatchIntoProps,
} from '../block-variants/apply-block-variant';
import {
  buildBlockTypographyClasses,
  parseBlockTypography,
  sanitizeBlockTypographyPatch,
} from './block-typography.registry';

describe('block-typography.registry', () => {
  it('sanitizes unknown typography values to defaults', () => {
    const parsed = parseBlockTypography({
      typography: {
        titleScale: 'huge',
        subtitleScale: 'xxl',
        bodyScale: 'invalid',
        titleWeight: 'heavy',
        textMaxWidth: 'full',
        mobileTitleScale: 'tiny',
        eyebrowStyle: 'neon',
      },
    });

    expect(parsed.titleScale).toBe('lg');
    expect(parsed.subtitleScale).toBe('md');
    expect(parsed.bodyScale).toBe('md');
    expect(parsed.titleWeight).toBe('bold');
    expect(parsed.textMaxWidth).toBe('lg');
    expect(parsed.mobileTitleScale).toBe('inherit');
    expect(parsed.eyebrowStyle).toBe('badge');
  });

  it('emits stable typography classes for non-default presets', () => {
    const classes = buildBlockTypographyClasses(
      {
        typography: {
          titleScale: 'display',
          titleWeight: 'black',
          textMaxWidth: 'sm',
        },
      },
      'campaign_lead_hero',
    );

    expect(classes).toContain('lp-typo-title-display');
    expect(classes).toContain('lp-typo-weight-black');
    expect(classes).toContain('lp-typo-max-sm');
  });

  it('sanitizes patch for supported block types only', () => {
    expect(
      sanitizeBlockTypographyPatch('campaign_lead_hero', { titleScale: 'xl' }),
    ).toEqual({ titleScale: 'xl' });
    expect(sanitizeBlockTypographyPatch('rich_text', { titleScale: 'xl' })).toEqual({});
  });

  it('variants apply typography without overwriting campaign content', () => {
    const current = {
      campaignTitle: 'Titre utilisateur',
      campaignSubtitle: 'Sous-titre utilisateur',
      layoutVariant: 'media_left_form_right',
    };
    const patch = applyBlockVariantSafely(
      'campaign_lead_hero',
      current,
      'campaign-hero-compact-lead',
    );
    expect(patch).not.toBeNull();
    const merged = mergeVariantPatchIntoProps(current, patch!);

    expect(merged.campaignTitle).toBe('Titre utilisateur');
    expect(merged.campaignSubtitle).toBe('Sous-titre utilisateur');
    expect(merged.typography).toMatchObject({
      titleScale: 'sm',
      mobileTitleScale: 'sm',
      subtitleScale: 'sm',
    });
  });
});
