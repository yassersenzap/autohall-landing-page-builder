import type { CSSProperties } from 'react';
import type { StudioV2DesignTokens } from './types';

const BTN_RADIUS = { square: '0.25rem', rounded: '0.5rem', pill: '999px' };
const RADIUS_SCALE = { none: '0', sm: '0.375rem', md: '0.75rem', lg: '1.25rem', xl: '1.75rem', full: '999px' };
const SHADOW_SCALE = {
  none: 'none',
  soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
  medium: '0 12px 32px rgba(15, 23, 42, 0.12)',
  strong: '0 20px 48px rgba(15, 23, 42, 0.18)',
  elevated: '0 16px 48px rgba(15, 23, 42, 0.16)',
};
const MAX_WIDTH = { narrow: '48rem', standard: '72rem', wide: '90rem', full: '100%' };
const HEADING_SCALE = {
  compact: 'clamp(1.5rem, 2.5vw, 2rem)',
  normal: 'clamp(1.75rem, 3vw, 2.5rem)',
  large: 'clamp(2rem, 3.5vw, 3rem)',
  hero: 'clamp(2.25rem, 4.5vw, 3.75rem)',
};
const BODY_SCALE = {
  compact: '0.9rem',
  normal: '1rem',
  large: '1.125rem',
};
const SECTION_SPACING = {
  compact: '2rem',
  normal: '3.5rem',
  large: '5rem',
  hero: '7rem',
};

export function buildTokenStyleVars(tokens: StudioV2DesignTokens): CSSProperties {
  return {
    '--vs2-primary': tokens.primaryColor,
    '--vs2-secondary': tokens.secondaryColor,
    '--vs2-accent': tokens.accentColor,
    '--vs2-bg': tokens.backgroundColor,
    '--vs2-text': tokens.textColor,
    '--vs2-heading': tokens.headingColor,
    '--vs2-muted': tokens.mutedTextColor,
    '--vs2-border': tokens.borderColor,
    '--vs2-font-heading': tokens.fontHeading,
    '--vs2-font-body': tokens.fontBody,
    '--vs2-font': tokens.fontBody,
    '--vs2-btn-radius': BTN_RADIUS[tokens.buttonRadius],
    '--vs2-card-radius': RADIUS_SCALE[tokens.radiusScale],
    '--vs2-radius-scale': RADIUS_SCALE[tokens.radiusScale],
    '--vs2-shadow': SHADOW_SCALE[tokens.shadowScale],
    '--vs2-shadow-scale': SHADOW_SCALE[tokens.shadowScale],
    '--vs2-page-max': MAX_WIDTH[tokens.containerWidth],
    '--vs2-heading-scale': HEADING_SCALE[tokens.headingScale],
    '--vs2-body-scale': BODY_SCALE[tokens.bodyScale],
    '--vs2-section-spacing': SECTION_SPACING[tokens.sectionSpacing],
  } as CSSProperties;
}

export function buildTokenCssString(tokens: StudioV2DesignTokens): string {
  const vars = buildTokenStyleVars(tokens);
  const lines = Object.entries(vars).map(([key, value]) => `${key}:${value}`);
  const btnOutline =
    tokens.buttonStyle === 'outline'
      ? `.vs2-hero__cta--primary,.vs2-cta__button,.lp-btn--primary{background:transparent;border:2px solid var(--vs2-accent);color:var(--vs2-accent)}`
      : '';
  return `:root{${lines.join(';')}}\n${btnOutline}`;
}
