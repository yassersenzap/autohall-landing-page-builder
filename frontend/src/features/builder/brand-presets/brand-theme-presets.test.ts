import { describe, expect, it } from 'vitest';
import {
  PAGE_BRAND_THEME_IDS,
  PAGE_BRAND_THEME_PRESETS,
  buildPageThemeFromTemplateBrand,
  getPageBrandTheme,
} from './brand-theme-presets';

describe('page brand theme presets', () => {
  it('defines autohall, chery, ford, opel and neutral presets', () => {
    expect(PAGE_BRAND_THEME_IDS).toEqual(
      expect.arrayContaining(['autohall', 'chery', 'ford', 'opel', 'neutral']),
    );
    for (const id of PAGE_BRAND_THEME_IDS) {
      const tokens = PAGE_BRAND_THEME_PRESETS[id];
      expect(tokens.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tokens.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tokens.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tokens.surfaceColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tokens.buttonStyle).toBeTruthy();
    }
  });

  it('builds Chery pageTheme from template brand', () => {
    const theme = buildPageThemeFromTemplateBrand('chery', {
      seoTitle: 'SEO conservé',
      seoDescription: 'Meta conservée',
    });
    expect(theme.primaryColor).toBe(getPageBrandTheme('chery').primaryColor);
    expect(theme.seoTitle).toBe('SEO conservé');
    expect(theme.seoDescription).toBe('Meta conservée');
  });

  it('builds Ford pageTheme from template brand', () => {
    const theme = buildPageThemeFromTemplateBrand('ford');
    expect(theme.primaryColor).toBe('#003478');
  });

  it('builds autohall-safe theme for generic template brand', () => {
    const theme = buildPageThemeFromTemplateBrand('autohall');
    expect(theme.primaryColor).toBe('#b91c1c');
    expect(getPageBrandTheme('neutral').primaryColor).toBe('#b91c1c');
  });
});
