import { describe, expect, it } from 'vitest';
import { clampBoxToZone, clampSize } from './constraints-engine';

describe('constraints-engine', () => {
  it('clamps floating form width to min/max', () => {
    expect(clampSize(233, 400, { minWidth: 480, maxWidth: 520 })).toEqual({
      width: 480,
      height: 400,
    });
    expect(clampSize(900, 400, { minWidth: 480, maxWidth: 520 })).toEqual({
      width: 520,
      height: 400,
    });
  });

  it('keeps hero content inside hero image zone', () => {
    const zone = { left: 80, top: 80, width: 600, height: 500 };
    const box = { left: 700, top: 600, width: 320, height: 120 };
    const clamped = clampBoxToZone(box, zone, {
      minWidth: 300,
      maxWidth: 700,
      canOverflow: false,
    });
    expect(clamped.left).toBeLessThanOrEqual(zone.left + zone.width - clamped.width);
    expect(clamped.top).toBeLessThanOrEqual(zone.top + zone.height - clamped.height);
    expect(clamped.left).toBeGreaterThanOrEqual(zone.left);
    expect(clamped.top).toBeGreaterThanOrEqual(zone.top);
  });
});
