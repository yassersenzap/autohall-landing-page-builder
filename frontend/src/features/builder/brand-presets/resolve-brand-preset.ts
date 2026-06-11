import type { BrandPreset, BrandPresetId } from './brand-preset.types';
import { getBrandPreset, isBrandPresetId } from './brand-presets';

/** Neutral Auto Hall fallback when brandId is missing or unknown. */
export const AUTOHALL_NEUTRAL_BRAND_PRESET: BrandPreset = {
  id: 'opel',
  name: 'Auto Hall',
  category: 'european_mainstream',
  tone: 'light',
  primaryColor: '#b91c1c',
  secondaryColor: '#18181b',
  accentColor: '#dc2626',
  backgroundColor: '#ffffff',
  textColor: '#18181b',
  fontStrategy: 'humanist-sans',
  buttonStyle: 'rounded',
  imageStyle: 'lifestyle-bleed',
  recommendedBlocks: ['hero_vehicle_offer', 'lead_form', 'footer_legal'],
};

/**
 * Resolves a brand preset from a block or campaign brandId.
 * Falls back to Auto Hall neutral when the id is absent or invalid.
 */
export function resolveBrandPreset(brandId: unknown): BrandPreset {
  if (typeof brandId === 'string' && isBrandPresetId(brandId)) {
    return getBrandPreset(brandId) ?? AUTOHALL_NEUTRAL_BRAND_PRESET;
  }
  return AUTOHALL_NEUTRAL_BRAND_PRESET;
}

export function resolveBrandPresetId(brandId: unknown): BrandPresetId {
  return resolveBrandPreset(brandId).id;
}
