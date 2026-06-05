import type { StudioV2DesignTokens } from './types';

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

export const THEME_PRESETS: Record<string, Partial<StudioV2DesignTokens>> = {
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

export function resolveDesignTokens(
  rootProps: Record<string, unknown> | undefined,
): StudioV2DesignTokens {
  const presetKey =
    typeof rootProps?.themePreset === 'string' ? rootProps.themePreset : 'autohall-blue';
  const preset = THEME_PRESETS[presetKey] ?? THEME_PRESETS['autohall-blue'];
  const custom =
    rootProps?.designTokens &&
    typeof rootProps.designTokens === 'object' &&
    !Array.isArray(rootProps.designTokens)
      ? (rootProps.designTokens as Partial<StudioV2DesignTokens>)
      : {};

  return { ...DEFAULT_DESIGN_TOKENS, ...preset, ...custom };
}

export function buildTokenCss(tokens: StudioV2DesignTokens): string {
  const radiusMap = { square: '0.25rem', rounded: '0.5rem', pill: '999px' };
  const cardRadiusMap = { none: '0', soft: '0.75rem', round: '1.25rem' };
  const shadowMap = {
    none: 'none',
    soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
    elevated: '0 16px 48px rgba(15, 23, 42, 0.16)',
  };
  const maxWidthMap = {
    narrow: '48rem',
    standard: '72rem',
    wide: '90rem',
    full: '100%',
  };

  return `:root{
--vs2-primary:${tokens.primaryColor};
--vs2-secondary:${tokens.secondaryColor};
--vs2-accent:${tokens.accentColor};
--vs2-bg:${tokens.backgroundColor};
--vs2-text:${tokens.textColor};
--vs2-heading:${tokens.headingColor};
--vs2-font:${tokens.fontFamily};
--vs2-btn-radius:${radiusMap[tokens.buttonRadius]};
--vs2-card-radius:${cardRadiusMap[tokens.cardRadius]};
--vs2-shadow:${shadowMap[tokens.shadowStyle]};
--vs2-page-max:${maxWidthMap[tokens.pageMaxWidth]};
}`;
}
