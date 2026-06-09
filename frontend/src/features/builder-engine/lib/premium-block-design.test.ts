import { describe, expect, it } from 'vitest';
import {
  buildPremiumSectionClasses,
  normalizePremiumDesign,
  resolveHeroFormLayoutVariant,
} from './premium-block-design';

describe('premium-block-design', () => {
  it('normalizes controlled design props with defaults', () => {
    const design = normalizePremiumDesign({});
    expect(design.variant).toBe('split-form');
    expect(design.tone).toBe('light');
    expect(design.mediaPosition).toBe('right');
    expect(design.density).toBe('comfortable');
    expect(design.imageShape).toBe('rounded-card');
    expect(design.ctaStyle).toBe('primary');
  });

  it('maps legacy imagePosition to mediaPosition', () => {
    const design = normalizePremiumDesign({
      design: { imagePosition: 'left', tone: 'dark' },
    });
    expect(design.mediaPosition).toBe('left');
    expect(design.tone).toBe('dark');
  });

  it('builds export class modifiers', () => {
    const design = normalizePremiumDesign({
      design: {
        variant: 'media-focus',
        tone: 'brand',
        mediaPosition: 'left',
        density: 'immersive',
        imageShape: 'full-bleed',
        ctaStyle: 'outline',
      },
    });
    const classes = buildPremiumSectionClasses('lp-hero-form-campaign', design);
    expect(classes).toContain('lp-hero-form-campaign--variant-media-focus');
    expect(classes).toContain('lp-hero-form-campaign--tone-brand');
    expect(classes).toContain('lp-hero-form-campaign--media-left');
    expect(classes).toContain('lp-hero-form-campaign--density-immersive');
    expect(classes).toContain('lp-hero-form-campaign--shape-full-bleed');
    expect(classes).toContain('lp-hero-form-campaign--cta-outline');
  });

  it('resolves hero layout variant from premium design', () => {
    expect(
      resolveHeroFormLayoutVariant(
        normalizePremiumDesign({ design: { variant: 'compact', mediaPosition: 'right' } }),
      ),
    ).toBe('text_left_form_right');
    expect(
      resolveHeroFormLayoutVariant(
        normalizePremiumDesign({
          design: { variant: 'split-form', mediaPosition: 'left' },
        }),
      ),
    ).toBe('form_left_text_right');
  });
});
