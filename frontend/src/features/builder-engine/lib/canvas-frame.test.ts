import { describe, expect, it } from 'vitest';
import {
  CANVAS_DESKTOP_MAX_WIDTH,
  CANVAS_MOBILE_WIDTH,
  computeFitScale,
  nextCanvasZoom,
} from './canvas-frame';

describe('canvas-frame', () => {
  it('expose les largeurs document desktop et mobile', () => {
    expect(CANVAS_DESKTOP_MAX_WIDTH).toBe(1200);
    expect(CANVAS_MOBILE_WIDTH).toBe(390);
  });

  it('calcule un fit scale (legacy helper)', () => {
    expect(computeFitScale(600, 1200)).toBeLessThan(1);
    expect(computeFitScale(1400, 1200)).toBe(1);
  });

  it('parcourt les niveaux de zoom manuel', () => {
    expect(nextCanvasZoom(0.9, 'in')).toBe(1);
    expect(nextCanvasZoom(1, 'out')).toBe(0.9);
  });
});
