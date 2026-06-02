import { Prisma } from '@prisma/client';

export type LandingTheme = {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
  cssVariables: string;
};

const DEFAULT_PRIMARY = '#b91c1c';
const DEFAULT_FONT =
  "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

function readThemeObject(themeJson: Prisma.JsonValue | null): Record<string, unknown> {
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

export function resolveLandingTheme(
  themeJson: Prisma.JsonValue | null,
): LandingTheme {
  const theme = readThemeObject(themeJson);
  const primaryColor = normalizeHexColor(theme.primaryColor, DEFAULT_PRIMARY);
  const fontFamily =
    typeof theme.fontFamily === 'string' && theme.fontFamily.trim()
      ? theme.fontFamily.trim()
      : DEFAULT_FONT;
  const mode =
    theme.mode === 'dark' || theme.appearance === 'dark' ? 'dark' : 'light';

  const primaryHover = shadeHex(primaryColor, mode === 'dark' ? 24 : -18);
  const primarySoft = `${primaryColor}1f`;

  const cssVariables = `--lp-primary: ${primaryColor}; --lp-primary-hover: ${primaryHover}; --lp-primary-soft: ${primarySoft}; --lp-font: ${fontFamily}, system-ui, sans-serif; --lp-display-font: ${fontFamily}, system-ui, sans-serif;`;

  return {
    mode,
    primaryColor,
    fontFamily,
    cssVariables,
  };
}
