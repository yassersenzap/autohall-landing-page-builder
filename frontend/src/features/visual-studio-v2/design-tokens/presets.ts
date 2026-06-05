import type { CSSProperties } from 'react';
import type { StudioV2DesignTokens, StudioV2RootProps, StudioV2ThemePresetId } from './types';

export const DEFAULT_DESIGN_TOKENS: StudioV2DesignTokens = {
  primaryColor: '#003b73',
  secondaryColor: '#0a2540',
  accentColor: '#e11d48',
  backgroundColor: '#ffffff',
  textColor: '#0f172a',
  headingColor: '#0f172a',
  fontFamily: 'Inter, system-ui, sans-serif',
  headingScale: 'normal',
  sectionSpacing: 'normal',
  buttonRadius: 'pill',
  buttonStyle: 'solid',
  pageMaxWidth: 'standard',
  cardRadius: 'soft',
  shadowStyle: 'soft',
};

export const THEME_PRESET_OPTIONS: { label: string; value: StudioV2ThemePresetId }[] = [
  { label: 'Auto Hall Bleu', value: 'autohall-blue' },
  { label: 'Ford Promo', value: 'ford-promo' },
  { label: 'SAV Rouge', value: 'sav-red' },
  { label: 'Gamme HEV Vert', value: 'gamme-hev-green' },
  { label: 'Premium Sombre', value: 'premium-dark' },
];

export const THEME_PRESETS: Record<StudioV2ThemePresetId, Partial<StudioV2DesignTokens>> = {
  'autohall-blue': {
    primaryColor: '#003b73',
    secondaryColor: '#0a2540',
    accentColor: '#e11d48',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    headingColor: '#003b73',
  },
  'ford-promo': {
    primaryColor: '#1a1a1a',
    secondaryColor: '#2d2d2d',
    accentColor: '#0066cc',
    backgroundColor: '#111111',
    textColor: '#f8fafc',
    headingColor: '#ffffff',
    buttonRadius: 'rounded',
    shadowStyle: 'elevated',
  },
  'sav-red': {
    primaryColor: '#b91c1c',
    secondaryColor: '#7f1d1d',
    accentColor: '#dc2626',
    backgroundColor: '#fff5f5',
    textColor: '#1f2937',
    headingColor: '#991b1b',
  },
  'gamme-hev-green': {
    primaryColor: '#047857',
    secondaryColor: '#065f46',
    accentColor: '#10b981',
    backgroundColor: '#f0fdf4',
    textColor: '#14532d',
    headingColor: '#047857',
  },
  'premium-dark': {
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#c9a227',
    backgroundColor: '#0b1120',
    textColor: '#e2e8f0',
    headingColor: '#f8fafc',
    cardRadius: 'round',
    shadowStyle: 'elevated',
  },
};

export function resolveDesignTokens(rootProps?: StudioV2RootProps | Record<string, unknown>): StudioV2DesignTokens {
  const presetKey =
    typeof rootProps?.themePreset === 'string' ? rootProps.themePreset : 'autohall-blue';
  const preset =
    THEME_PRESETS[presetKey as StudioV2ThemePresetId] ?? THEME_PRESETS['autohall-blue'];
  const custom =
    rootProps?.designTokens &&
    typeof rootProps.designTokens === 'object' &&
    !Array.isArray(rootProps.designTokens)
      ? (rootProps.designTokens as Partial<StudioV2DesignTokens>)
      : {};

  return { ...DEFAULT_DESIGN_TOKENS, ...preset, ...custom };
}

const RADIUS_MAP = { square: '0.25rem', rounded: '0.5rem', pill: '999px' };
const CARD_RADIUS_MAP = { none: '0', soft: '0.75rem', round: '1.25rem' };
const SHADOW_MAP = {
  none: 'none',
  soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
  elevated: '0 16px 48px rgba(15, 23, 42, 0.16)',
};
const MAX_WIDTH_MAP = {
  narrow: '48rem',
  standard: '72rem',
  wide: '90rem',
  full: '100%',
};

export function buildTokenStyleVars(tokens: StudioV2DesignTokens): CSSProperties {
  return {
    '--vs2-primary': tokens.primaryColor,
    '--vs2-secondary': tokens.secondaryColor,
    '--vs2-accent': tokens.accentColor,
    '--vs2-bg': tokens.backgroundColor,
    '--vs2-text': tokens.textColor,
    '--vs2-heading': tokens.headingColor,
    '--vs2-font': tokens.fontFamily,
    '--vs2-btn-radius': RADIUS_MAP[tokens.buttonRadius],
    '--vs2-card-radius': CARD_RADIUS_MAP[tokens.cardRadius],
    '--vs2-shadow': SHADOW_MAP[tokens.shadowStyle],
    '--vs2-page-max': MAX_WIDTH_MAP[tokens.pageMaxWidth],
  } as CSSProperties;
}
