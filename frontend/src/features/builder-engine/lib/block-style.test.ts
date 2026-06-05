import { describe, expect, it } from 'vitest';
import {
  buildCanvasSectionClass,
  getDesignFromProps,
  normalizeBlockDesign,
} from './block-style';

describe('block-style (frontend)', () => {
  it('changes hero canvas classes when layoutVariant changes', () => {
    const centered = buildCanvasSectionClass('hero', 'lp-hero', {
      design: { layoutVariant: 'centered', backgroundMode: 'light' },
    });
    const splitLeft = buildCanvasSectionClass('hero', 'lp-hero', {
      design: { layoutVariant: 'split_image_left' },
    });
    expect(centered).toContain('lp-hero--layout-centered');
    expect(splitLeft).toContain('lp-hero--layout-split_image_left');
  });

  it('applies media fit classes on design', () => {
    const design = getDesignFromProps('hero', {
      design: { mediaFit: 'contain', mediaFocal: 'bottom' },
    });
    expect(design.mediaFit).toBe('contain');
    expect(design.mediaFocal).toBe('bottom');
  });

  it('normalizes features showcase variant', () => {
    const design = normalizeBlockDesign('features', {
      design: { layoutVariant: 'showcase' },
    });
    expect(design.layoutVariant).toBe('showcase');
  });
});
