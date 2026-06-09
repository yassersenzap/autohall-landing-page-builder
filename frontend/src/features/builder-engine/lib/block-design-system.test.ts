import { describe, expect, it } from 'vitest';
import {
  buildBlockDesignClasses,
  getDefaultDesignForBlock,
  normalizeSectionDesign,
} from './block-design-system';

describe('block-design-system', () => {
  it('provides defaults per block type', () => {
    expect(getDefaultDesignForBlock('hero_campaign').tone).toBe('brand');
    expect(getDefaultDesignForBlock('faq').variant).toBe('standard');
    expect(getDefaultDesignForBlock('cta_band').ctaStyle).toBe('white');
  });

  it('normalizes tone including neutral', () => {
    const design = normalizeSectionDesign('benefits', {
      design: { tone: 'neutral', alignment: 'center' },
    });
    expect(design.tone).toBe('neutral');
    expect(design.alignment).toBe('center');
  });

  it('builds alignment modifier classes', () => {
    const classes = buildBlockDesignClasses(
      'lp-benefits',
      normalizeSectionDesign('benefits', {
        design: { variant: 'grid', tone: 'light', alignment: 'split' },
      }),
    );
    expect(classes).toContain('lp-benefits--align-split');
    expect(classes).toContain('lp-benefits--variant-grid');
  });
});
