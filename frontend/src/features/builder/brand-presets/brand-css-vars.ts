import type { BrandPreset } from './brand-preset.types';

export type BrandCssVarMap = {
  '--lp-brand-primary': string;
  '--lp-brand-secondary': string;
  '--lp-brand-accent': string;
  '--lp-brand-bg': string;
  '--lp-brand-text': string;
};

export function buildBrandCssVarMap(preset: BrandPreset): BrandCssVarMap {
  return {
    '--lp-brand-primary': preset.primaryColor,
    '--lp-brand-secondary': preset.secondaryColor,
    '--lp-brand-accent': preset.accentColor,
    '--lp-brand-bg': preset.backgroundColor,
    '--lp-brand-text': preset.textColor,
  };
}

export function buildBrandCssVarString(preset: BrandPreset): string {
  const vars = buildBrandCssVarMap(preset);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

export function brandCssVarMapToStyle(
  vars: BrandCssVarMap,
): Record<string, string> {
  return { ...vars };
}
