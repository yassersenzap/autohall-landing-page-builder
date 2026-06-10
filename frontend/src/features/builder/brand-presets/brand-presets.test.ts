import { describe, expect, it } from 'vitest';
import {
  BRAND_PRESET_REQUIRED_TOKEN_KEYS,
  type BrandPresetId,
} from './brand-preset.types';
import { BRAND_PRESETS, getBrandPreset, isBrandPresetId } from './brand-presets';

const REQUIRED_BRANDS: BrandPresetId[] = [
  'opel',
  'ford',
  'jeep',
  'alfa_romeo',
  'chery',
  'fuso',
  'ford_trucks',
  'maserati',
];

describe('brand-presets', () => {
  it('contains all required Auto Hall brands', () => {
    const ids = BRAND_PRESETS.map((preset) => preset.id);
    for (const brandId of REQUIRED_BRANDS) {
      expect(ids).toContain(brandId);
      expect(getBrandPreset(brandId)).toBeDefined();
      expect(isBrandPresetId(brandId)).toBe(true);
    }
  });

  it('assigns required visual tokens to every preset', () => {
    for (const preset of BRAND_PRESETS) {
      for (const key of BRAND_PRESET_REQUIRED_TOKEN_KEYS) {
        const value = preset[key];
        expect(value, `${preset.id}.${key}`).toBeTruthy();
        if (key.endsWith('Color')) {
          expect(String(value)).toMatch(/^#[0-9a-f]{6}$/i);
        }
      }
      expect(preset.recommendedBlocks.length).toBeGreaterThan(0);
      expect(preset.name.length).toBeGreaterThan(0);
    }
  });

  it('resolves presets by id', () => {
    expect(getBrandPreset('ford')?.primaryColor).toBe('#003478');
    expect(getBrandPreset('unknown_brand' as BrandPresetId)).toBeUndefined();
  });
});
