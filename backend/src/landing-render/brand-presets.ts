import { resolveBrandCtaPrimaryTextColor } from './brand-cta-contrast';

/** Backend mirror of frontend brand preset tokens (export-safe subset). */

export type BrandPresetTokens = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
};

export const AUTOHALL_NEUTRAL_BRAND: BrandPresetTokens = {
  id: 'autohall',
  name: 'Auto Hall',
  primaryColor: '#b91c1c',
  secondaryColor: '#18181b',
  accentColor: '#dc2626',
  backgroundColor: '#ffffff',
  textColor: '#18181b',
};

const BRAND_TOKENS: Record<string, BrandPresetTokens> = {
  opel: {
    id: 'opel',
    name: 'Opel',
    primaryColor: '#f7d300',
    secondaryColor: '#111827',
    accentColor: '#fbbf24',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
  },
  ford: {
    id: 'ford',
    name: 'Ford',
    primaryColor: '#003478',
    secondaryColor: '#0f172a',
    accentColor: '#1d4ed8',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
  },
  dfsk: {
    id: 'dfsk',
    name: 'DFSK',
    primaryColor: '#dc2626',
    secondaryColor: '#1c1917',
    accentColor: '#f59e0b',
    backgroundColor: '#fafaf9',
    textColor: '#1c1917',
  },
  nissan: {
    id: 'nissan',
    name: 'Nissan',
    primaryColor: '#c3002f',
    secondaryColor: '#1f2937',
    accentColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  },
  mitsubishi: {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    primaryColor: '#e60012',
    secondaryColor: '#111827',
    accentColor: '#374151',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
  },
  fiat: {
    id: 'fiat',
    name: 'Fiat',
    primaryColor: '#9b0c1c',
    secondaryColor: '#1f2937',
    accentColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  },
  fuso: {
    id: 'fuso',
    name: 'Fuso',
    primaryColor: '#e60012',
    secondaryColor: '#1e293b',
    accentColor: '#475569',
    backgroundColor: '#f1f5f9',
    textColor: '#0f172a',
  },
  chery: {
    id: 'chery',
    name: 'Chery',
    primaryColor: '#ca8a04',
    secondaryColor: '#1c1917',
    accentColor: '#fbbf24',
    backgroundColor: '#fafaf9',
    textColor: '#1c1917',
  },
  foton: {
    id: 'foton',
    name: 'Foton',
    primaryColor: '#1d4ed8',
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
  },
  seres: {
    id: 'seres',
    name: 'Seres',
    primaryColor: '#2563eb',
    secondaryColor: '#0b1220',
    accentColor: '#60a5fa',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
  },
  jeep: {
    id: 'jeep',
    name: 'Jeep',
    primaryColor: '#1c5429',
    secondaryColor: '#292524',
    accentColor: '#d6d3d1',
    backgroundColor: '#1c1917',
    textColor: '#fafaf9',
  },
  gaz: {
    id: 'gaz',
    name: 'Gaz',
    primaryColor: '#1e40af',
    secondaryColor: '#0f172a',
    accentColor: '#64748b',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
  },
  alfa_romeo: {
    id: 'alfa_romeo',
    name: 'Alfa Romeo',
    primaryColor: '#9b0c1c',
    secondaryColor: '#0f172a',
    accentColor: '#94a3b8',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
  },
  ford_trucks: {
    id: 'ford_trucks',
    name: 'Ford Trucks',
    primaryColor: '#003478',
    secondaryColor: '#1e293b',
    accentColor: '#2563eb',
    backgroundColor: '#f1f5f9',
    textColor: '#0f172a',
  },
  maserati: {
    id: 'maserati',
    name: 'Maserati',
    primaryColor: '#0c2340',
    secondaryColor: '#020617',
    accentColor: '#c0c0c0',
    backgroundColor: '#020617',
    textColor: '#f1f5f9',
  },
  industriel_agricole: {
    id: 'industriel_agricole',
    name: 'Industriel & Agricole',
    primaryColor: '#15803d',
    secondaryColor: '#1c1917',
    accentColor: '#ca8a04',
    backgroundColor: '#fafaf9',
    textColor: '#1c1917',
  },
};

export function resolveBrandPresetTokens(brandId: unknown): BrandPresetTokens {
  if (typeof brandId === 'string' && brandId in BRAND_TOKENS) {
    return BRAND_TOKENS[brandId];
  }
  return AUTOHALL_NEUTRAL_BRAND;
}

export function buildBrandInlineStyle(tokens: BrandPresetTokens): string {
  return [
    `--lp-brand-primary: ${tokens.primaryColor}`,
    `--lp-brand-secondary: ${tokens.secondaryColor}`,
    `--lp-brand-accent: ${tokens.accentColor}`,
    `--lp-brand-bg: ${tokens.backgroundColor}`,
    `--lp-brand-text: ${tokens.textColor}`,
    `--lp-brand-cta-primary-text: ${resolveBrandCtaPrimaryTextColor(tokens.id, tokens.primaryColor)}`,
  ].join('; ');
}
