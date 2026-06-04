import { describe, expect, it } from '@jest/globals';
import {
  buildBlockSectionClasses,
  normalizeBlockDesign,
  normalizeHexColor,
} from './block-style';

describe('block-style', () => {
  it('normalizes hero split_image_left from legacy imageAlignment', () => {
    const design = normalizeBlockDesign('hero', {
      imageAlignment: 'left',
      backgroundTheme: 'dark',
    });
    expect(design.layoutVariant).toBe('split_image_left');
    expect(design.backgroundMode).toBe('dark');
    expect(design.mediaPosition).toBe('left');
  });

  it('falls back unknown layoutVariant to hero default', () => {
    const design = normalizeBlockDesign('hero', {
      design: { layoutVariant: 'invalid_layout_xyz' },
    });
    expect(design.layoutVariant).toBe('split_image_right');
  });

  it('rejects unsafe hex colors', () => {
    expect(normalizeHexColor('javascript:alert(1)')).toBeNull();
    expect(normalizeHexColor('#b91c1c')).toBe('#b91c1c');
  });

  it('builds hero background_image classes', () => {
    const design = normalizeBlockDesign('hero', {
      design: { layoutVariant: 'background_image', overlayOpacity: 'medium' },
    });
    const cls = buildBlockSectionClasses('hero', 'lp-hero', design);
    expect(cls).toContain('lp-hero--layout-background_image');
    expect(cls).toContain('lp-hero--overlay-medium');
  });
});
