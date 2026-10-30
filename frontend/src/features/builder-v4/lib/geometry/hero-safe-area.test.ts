import { describe, expect, it } from 'vitest';
import { flexLayoutForAnchor, layoutForHeroSafeArea } from './hero-safe-area';

describe('hero-safe-area', () => {
  it('maps center-left anchor to flex center start', () => {
    expect(flexLayoutForAnchor('center-left')).toEqual({ justify: 'center', align: 'start' });
  });

  it('builds overlay zone shell filling hero image', () => {
    const layout = layoutForHeroSafeArea('top-left', {
      top: 64,
      left: 64,
      right: 64,
      bottom: 64,
    });
    expect(layout.position).toBe('absolute');
    expect(layout.top).toBe(0);
    expect(layout.left).toBe(0);
    expect(layout.right).toBe(0);
    expect(layout.bottom).toBe(0);
    expect(layout.overflow).toBe('visible');
  });
});
