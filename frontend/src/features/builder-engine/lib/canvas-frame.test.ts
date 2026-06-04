import { describe, expect, it } from 'vitest';
import {
  CANVAS_DESKTOP_MAX_WIDTH,
  CANVAS_FIT_MIN_SCALE,
  CANVAS_MOBILE_WIDTH,
  computeFitScale,
  nextCanvasZoom,
  resolveEffectiveZoom,
} from './canvas-frame';

describe('canvas-frame', () => {
  it('expose les largeurs document desktop et mobile', () => {
    expect(CANVAS_DESKTOP_MAX_WIDTH).toBe(1200);
    expect(CANVAS_MOBILE_WIDTH).toBe(390);
  });

  it('calcule un fit scale avec plancher 80 %', () => {
    expect(computeFitScale(600, 1200)).toBe(CANVAS_FIT_MIN_SCALE);
    expect(computeFitScale(1400, 1200)).toBe(1);
    expect(computeFitScale(200, 1200)).toBe(CANVAS_FIT_MIN_SCALE);
  });

  it('résout le zoom effectif en mode fit ou manuel', () => {
    expect(resolveEffectiveZoom('fit', 0.85, 1)).toBe(0.85);
    expect(resolveEffectiveZoom('manual', 0.85, 0.9)).toBe(0.9);
  });

  it('parcourt les niveaux de zoom manuel', () => {
    expect(nextCanvasZoom(0.9, 'in')).toBe(1);
    expect(nextCanvasZoom(1, 'out')).toBe(0.9);
  });
});
