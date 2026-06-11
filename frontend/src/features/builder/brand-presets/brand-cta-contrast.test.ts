import { describe, expect, it } from 'vitest';
import { resolveBrandCtaPrimaryTextColor } from './brand-cta-contrast';
import { buildBrandCssVarMap } from './brand-css-vars';
import { getBrandPreset } from './brand-presets';
import { AUTOHALL_NEUTRAL_BRAND_PRESET } from './resolve-brand-preset';

describe('brand-cta-contrast', () => {
  it('uses dark text on Opel yellow primary', () => {
    expect(resolveBrandCtaPrimaryTextColor('opel', '#f7d300')).toBe('#111827');
  });

  it('uses white text on Ford blue primary', () => {
    expect(resolveBrandCtaPrimaryTextColor('ford', '#003478')).toBe('#ffffff');
  });

  it('uses white text on Auto Hall neutral fallback red', () => {
    expect(resolveBrandCtaPrimaryTextColor('autohall', '#b91c1c')).toBe('#ffffff');
    expect(
      resolveBrandCtaPrimaryTextColor('unknown', AUTOHALL_NEUTRAL_BRAND_PRESET.primaryColor),
    ).toBe('#ffffff');
  });

  it('exposes CTA text color in brand CSS variables', () => {
    const ford = getBrandPreset('ford')!;
    const opel = getBrandPreset('opel')!;
    expect(buildBrandCssVarMap(ford)['--lp-brand-cta-primary-text']).toBe('#ffffff');
    expect(buildBrandCssVarMap(opel)['--lp-brand-cta-primary-text']).toBe('#111827');
  });
});
