import { describe, expect, it } from 'vitest';
import {
  computeSafeZones,
  heroFormGridColumns,
  resolveImageObjectFit,
  clampFormSafeWidthPx,
  DEFAULT_HERO_FORM_GEOMETRY,
} from '../studio-compat.js';

describe('hero-form campaign engine', () => {
  it('defaults to 72/28 safe zones', () => {
    const zones = computeSafeZones(DEFAULT_HERO_FORM_GEOMETRY);
    expect(zones.mediaColumnFr).toBe(72);
    expect(zones.formColumnFr).toBe(28);
    expect(zones.formSafeWidthPx).toBe(400);
  });

  it('clamps form width between 360 and 440px', () => {
    expect(clampFormSafeWidthPx(300)).toBe(360);
    expect(clampFormSafeWidthPx(500)).toBe(440);
    expect(clampFormSafeWidthPx(400)).toBe(400);
  });

  it('uses two-column grid in split and floating modes', () => {
    expect(heroFormGridColumns(DEFAULT_HERO_FORM_GEOMETRY)).toBe('72fr 28fr');
    expect(
      heroFormGridColumns({ ...DEFAULT_HERO_FORM_GEOMETRY, mode: 'floating-card' }),
    ).toBe('72fr 28fr');
  });

  it('maps image behavior to object-fit', () => {
    expect(resolveImageObjectFit('campaign-poster')).toBe('contain');
    expect(resolveImageObjectFit('background')).toBe('cover');
    expect(resolveImageObjectFit('smart-crop')).toBe('cover');
  });
});
