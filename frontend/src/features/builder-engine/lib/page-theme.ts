import type { PageThemeDraft } from '../store/builder-document.store';

export function parsePageThemeFromJson(themeJson: unknown): PageThemeDraft {
  const defaults: PageThemeDraft = {
    primaryColor: '#b91c1c',
    secondaryColor: '#18181b',
    mode: 'dark',
    fontFamily: 'Inter',
    headingScale: 'normal',
    sectionSpacing: 'normal',
    buttonStyle: 'pill',
    seoTitle: '',
    seoDescription: '',
  };

  if (!themeJson || typeof themeJson !== 'object' || Array.isArray(themeJson)) {
    return defaults;
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
  const seo =
    page.seo && typeof page.seo === 'object' && !Array.isArray(page.seo)
      ? (page.seo as Record<string, unknown>)
      : {};

  const headingScale =
    theme.headingScale === 'compact' || theme.headingScale === 'large'
      ? theme.headingScale
      : defaults.headingScale;
  const sectionSpacing =
    theme.sectionSpacing === 'compact' || theme.sectionSpacing === 'spacious'
      ? theme.sectionSpacing
      : defaults.sectionSpacing;
  const buttonStyle =
    theme.buttonStyle === 'rounded' || theme.buttonStyle === 'square'
      ? theme.buttonStyle
      : defaults.buttonStyle;

  return {
    primaryColor:
      typeof theme.primaryColor === 'string' ? theme.primaryColor : defaults.primaryColor,
    secondaryColor:
      typeof theme.secondaryColor === 'string'
        ? theme.secondaryColor
        : defaults.secondaryColor,
    mode: theme.mode === 'light' || theme.appearance === 'light' ? 'light' : 'dark',
    fontFamily:
      typeof theme.fontFamily === 'string' ? theme.fontFamily : defaults.fontFamily,
    headingScale,
    sectionSpacing,
    buttonStyle,
    seoTitle: typeof seo.title === 'string' ? seo.title : defaults.seoTitle,
    seoDescription:
      typeof seo.description === 'string' ? seo.description : defaults.seoDescription,
  };
}
