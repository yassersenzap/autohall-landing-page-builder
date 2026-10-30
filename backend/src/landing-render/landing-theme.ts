import { Prisma } from '@prisma/client';
import {
  AUTOHALL_BODY_FONT,
  AUTOHALL_HEADING_FONT,
} from './constants/autohall-campaign-fonts';

export type LandingTheme = {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  cssVariables: string;
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  headingScale: 'compact' | 'normal' | 'large';
  buttonStyle: 'rounded' | 'pill' | 'square';
};

const DEFAULT_PRIMARY = '#b91c1c';

function readThemeObject(
  themeJson: Prisma.JsonValue | null,
): Record<string, unknown> {
  if (!themeJson || typeof themeJson !== 'object' || Array.isArray(themeJson)) {
    return {};
  }
  const root = themeJson as Record<string, unknown>;
  const page =
    root.page && typeof root.page === 'object' && !Array.isArray(root.page)
      ? (root.page as Record<string, unknown>)
      : root;
  const theme =
    page.theme && typeof page.theme === 'object' && !Array.isArray(page.theme)
      ? (page.theme as Record<string, unknown>)
      : {};
  return theme;
}

function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return trimmed.length === 4
      ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
      : trimmed;
  }
  return fallback;
}

function shadeHex(hex: string, percent: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }
  const num = parseInt(normalized, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function resolveFont(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function resolveLandingTheme(
  themeJson: Prisma.JsonValue | null,
): LandingTheme {
  const theme = readThemeObject(themeJson);
  const primaryColor = normalizeHexColor(theme.primaryColor, DEFAULT_PRIMARY);
  const headingFont = resolveFont(theme.headingFont, AUTOHALL_HEADING_FONT);
  const bodyFont = resolveFont(
    theme.bodyFont,
    resolveFont(theme.fontFamily, AUTOHALL_BODY_FONT),
  );
  const fontFamily = bodyFont;
  const mode =
    theme.mode === 'dark' || theme.appearance === 'dark' ? 'dark' : 'light';

  const primaryHover = shadeHex(primaryColor, mode === 'dark' ? 24 : -18);
  const primarySoft = `${primaryColor}1f`;

  const secondaryColor = normalizeHexColor(theme.secondaryColor, '#18181b');
  const headingScale =
    theme.headingScale === 'compact' || theme.headingScale === 'large'
      ? theme.headingScale
      : 'normal';
  const sectionSpacing =
    theme.sectionSpacing === 'compact' || theme.sectionSpacing === 'spacious'
      ? theme.sectionSpacing
      : 'normal';
  const buttonStyle =
    theme.buttonStyle === 'rounded' || theme.buttonStyle === 'square'
      ? theme.buttonStyle
      : 'pill';

  const cssVariables = [
    `--lp-primary: ${primaryColor}`,
    `--lp-primary-hover: ${primaryHover}`,
    `--lp-primary-soft: ${primarySoft}`,
    `--lp-secondary: ${secondaryColor}`,
    `--lp-font: ${bodyFont}`,
    `--lp-display-font: ${headingFont}`,
    `--ah-font-heading: ${headingFont}`,
    `--ah-font-mono: ${bodyFont}`,
    `--lp-heading-scale: ${headingScale}`,
    `--lp-section-spacing: ${sectionSpacing}`,
    `--lp-button-style: ${buttonStyle}`,
  ].join('; ');

  return {
    mode,
    primaryColor,
    fontFamily,
    headingFont,
    bodyFont,
    cssVariables,
    sectionSpacing,
    headingScale,
    buttonStyle,
  };
}
