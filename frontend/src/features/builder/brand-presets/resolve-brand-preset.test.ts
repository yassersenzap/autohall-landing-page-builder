import { describe, expect, it } from 'vitest';
import {
  AUTOHALL_NEUTRAL_BRAND_PRESET,
  resolveBrandPreset,
  resolveBrandPresetId,
} from './resolve-brand-preset';

describe('resolveBrandPreset', () => {
  it('returns Ford preset for valid ford brandId', () => {
    const preset = resolveBrandPreset('ford');
    expect(preset.id).toBe('ford');
    expect(preset.primaryColor).toBe('#003478');
  });

  it('returns Opel preset for valid opel brandId', () => {
    const preset = resolveBrandPreset('opel');
    expect(preset.id).toBe('opel');
    expect(preset.primaryColor).toBe('#f7d300');
  });

  it('falls back to Auto Hall neutral for unknown brandId', () => {
    const preset = resolveBrandPreset('unknown_brand');
    expect(preset.primaryColor).toBe(AUTOHALL_NEUTRAL_BRAND_PRESET.primaryColor);
    expect(preset.name).toBe('Auto Hall');
  });

  it('falls back to Auto Hall neutral for null or empty brandId', () => {
    expect(resolveBrandPreset(null).primaryColor).toBe('#b91c1c');
    expect(resolveBrandPreset('').primaryColor).toBe('#b91c1c');
    expect(resolveBrandPreset(undefined).textColor).toBe('#18181b');
  });

  it('resolveBrandPresetId returns resolved id', () => {
    expect(resolveBrandPresetId('jeep')).toBe('jeep');
    expect(resolveBrandPresetId('invalid')).toBe(AUTOHALL_NEUTRAL_BRAND_PRESET.id);
  });
});
