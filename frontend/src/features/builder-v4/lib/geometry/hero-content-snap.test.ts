import { describe, expect, it } from 'vitest';
import { layoutForContentAnchor } from './hero-content-snap';

describe('hero-content-snap', () => {
  it('anchors content block to center-left safe zone', () => {
    const layout = layoutForContentAnchor(
      'center-left',
      { width: 800, height: 600 },
      { width: 320, height: 140 },
      { top: 64, left: 64, right: 64, bottom: 64 },
    );
    expect(layout.position).toBe('absolute');
    expect(layout.left).toBe(64);
    expect(layout.top).toBeGreaterThan(48);
  });
});
