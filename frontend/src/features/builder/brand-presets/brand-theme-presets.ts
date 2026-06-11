import type { PageThemeDraft } from '@/features/builder-engine/store/builder-document.store';
import type { CampaignPageTemplateBrandId } from '@/features/builder-engine/foundation/campaign-page-templates.types';
import { getBrandPreset } from './brand-presets';
import type { BrandFontStrategy, BrandPresetTone } from './brand-preset.types';

/** Page-level brand theme ids used by campaign templates and Studio sync. */
export type PageBrandThemeId = 'autohall' | 'chery' | 'ford' | 'opel' | 'neutral';

export type PageBrandThemeTokens = {
  id: PageBrandThemeId;
  label: string;
  primaryColor: string;
  primarySoft: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  secondaryColor: string;
  textTone: 'light' | 'dark';
  mode: 'light' | 'dark';
  buttonStyle: PageThemeDraft['buttonStyle'];
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
};

const FONT_BY_STRATEGY: Record<BrandFontStrategy, string> = {
  'geometric-sans': 'Inter',
  'humanist-sans': 'Inter',
  'condensed-display': 'Inter',
  'luxury-serif': 'Georgia',
  'industrial-sans': 'Roboto',
  'modern-tech-sans': 'Inter',
};

function softHex(hex: string): string {
  const normalized = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return `${normalized}1a`;
  }
  return '#00000014';
}

function surfaceFromBackground(bg: string, tone: BrandPresetTone): string {
  if (tone === 'dark') return '#0f172a';
  if (bg.toLowerCase() === '#ffffff' || bg.toLowerCase() === '#fff') {
    return '#f4f4f5';
  }
  return bg;
}

function mapButtonStyle(
  style: 'pill' | 'rounded' | 'rectangular' | 'ghost',
): PageThemeDraft['buttonStyle'] {
  if (style === 'pill') return 'pill';
  if (style === 'rectangular') return 'square';
  return 'rounded';
}

function tokensFromBrandPreset(
  id: PageBrandThemeId,
  label: string,
): PageBrandThemeTokens {
  if (id === 'autohall' || id === 'neutral') {
    const primaryColor = '#b91c1c';
    const secondaryColor = '#18181b';
    const backgroundColor = id === 'neutral' ? '#fafafa' : '#ffffff';
    return {
      id,
      label,
      primaryColor,
      primarySoft: softHex(primaryColor),
      accentColor: '#dc2626',
      backgroundColor,
      surfaceColor: '#f4f4f5',
      secondaryColor,
      textTone: 'dark',
      mode: 'light',
      buttonStyle: 'pill',
      fontFamily: 'Inter',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
    };
  }

  const preset = getBrandPreset(id);
  if (!preset) {
    return tokensFromBrandPreset('autohall', label);
  }

  const mode: 'light' | 'dark' = preset.tone === 'dark' ? 'dark' : 'light';
  const fontFamily = FONT_BY_STRATEGY[preset.fontStrategy];

  return {
    id,
    label,
    primaryColor: preset.primaryColor,
    primarySoft: softHex(preset.primaryColor),
    accentColor: preset.accentColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: surfaceFromBackground(preset.backgroundColor, preset.tone),
    secondaryColor: preset.secondaryColor,
    textTone: mode === 'dark' ? 'light' : 'dark',
    mode,
    buttonStyle: mapButtonStyle(preset.buttonStyle),
    fontFamily,
    headingFont: fontFamily,
    bodyFont: 'Roboto',
  };
}

export const PAGE_BRAND_THEME_PRESETS: Record<PageBrandThemeId, PageBrandThemeTokens> = {
  autohall: tokensFromBrandPreset('autohall', 'Auto Hall'),
  chery: tokensFromBrandPreset('chery', 'Chery'),
  ford: tokensFromBrandPreset('ford', 'Ford'),
  opel: tokensFromBrandPreset('opel', 'Opel'),
  neutral: tokensFromBrandPreset('neutral', 'Neutre'),
};

export const PAGE_BRAND_THEME_IDS = Object.keys(
  PAGE_BRAND_THEME_PRESETS,
) as PageBrandThemeId[];

export function resolvePageBrandThemeId(
  brandId: CampaignPageTemplateBrandId,
): PageBrandThemeId {
  if (brandId === 'autohall') return 'autohall';
  if (brandId === 'chery') return 'chery';
  if (brandId === 'ford') return 'ford';
  if (brandId === 'opel') return 'opel';
  return 'neutral';
}

export function getPageBrandTheme(id: PageBrandThemeId): PageBrandThemeTokens {
  return PAGE_BRAND_THEME_PRESETS[id];
}

/** Maps template brand to pageTheme — preserves SEO/meta from current theme when provided. */
export function buildPageThemeFromTemplateBrand(
  brandId: CampaignPageTemplateBrandId,
  current?: Partial<PageThemeDraft>,
): PageThemeDraft {
  const themeId = resolvePageBrandThemeId(brandId);
  const tokens = getPageBrandTheme(themeId);

  return {
    primaryColor: tokens.primaryColor,
    secondaryColor: tokens.secondaryColor,
    mode: tokens.mode,
    fontFamily: tokens.fontFamily,
    headingFont: tokens.headingFont,
    bodyFont: tokens.bodyFont,
    headingScale: current?.headingScale ?? 'normal',
    sectionSpacing: current?.sectionSpacing ?? 'normal',
    buttonStyle: tokens.buttonStyle,
    seoTitle: current?.seoTitle ?? '',
    seoDescription: current?.seoDescription ?? '',
  };
}
