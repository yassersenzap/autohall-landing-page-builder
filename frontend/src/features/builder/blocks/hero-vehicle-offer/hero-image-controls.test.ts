import { describe, expect, it } from 'vitest';
import {
  buildHeroFocalInlineStyle,
  buildHeroFocalStyleVars,
  resolveHeroFocalPoint,
  resolveHeroImageAlt,
} from './hero-image-controls';

describe('hero-image-controls', () => {
  it('resolves crop presets to focal percentages', () => {
    expect(resolveHeroFocalPoint({ cropPreset: 'top' })).toEqual({
      cropPreset: 'top',
      x: 50,
      y: 20,
    });
    expect(resolveHeroFocalPoint({ cropPreset: 'left' })).toEqual({
      cropPreset: 'left',
      x: 20,
      y: 50,
    });
  });

  it('uses custom focalPointX/Y when crop preset is custom', () => {
    expect(
      resolveHeroFocalPoint({
        cropPreset: 'custom',
        focalPointX: 30,
        focalPointY: 70,
      }),
    ).toEqual({ cropPreset: 'custom', x: 30, y: 70 });
  });

  it('maps legacy focalPoint enum to crop presets', () => {
    expect(resolveHeroFocalPoint({ focalPoint: 'bottom' }).cropPreset).toBe('bottom');
    expect(resolveHeroFocalPoint({ focalPoint: 'bottom' }).y).toBe(80);
  });

  it('builds focal CSS variables for preview/export', () => {
    expect(buildHeroFocalStyleVars(25, 75)).toEqual({
      '--lp-hero-focal-x': '25%',
      '--lp-hero-focal-y': '75%',
      '--lp-media-focal-x': '25%',
      '--lp-media-focal-y': '75%',
    });
    expect(buildHeroFocalInlineStyle(25, 75)).toBe(
      '--lp-hero-focal-x: 25%; --lp-hero-focal-y: 75%; --lp-media-focal-x: 25%; --lp-media-focal-y: 75%',
    );
  });

  it('clamps focal values to 0–100', () => {
    expect(resolveHeroFocalPoint({ cropPreset: 'custom', focalPointX: 150, focalPointY: -5 })).toEqual({
      cropPreset: 'custom',
      x: 100,
      y: 0,
    });
  });

  it('resolves hero image alt with fallback chain', () => {
    expect(resolveHeroImageAlt({ heroImageAlt: 'Ranger 3/4' })).toBe('Ranger 3/4');
    expect(resolveHeroImageAlt({ modelName: 'Ford Ranger' })).toBe('Ford Ranger');
    expect(resolveHeroImageAlt({ headline: 'Offre' })).toBe('Offre');
    expect(resolveHeroImageAlt({})).toBe('Véhicule');
  });
});
