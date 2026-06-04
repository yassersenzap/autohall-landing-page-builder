import { describe, expect, it } from 'vitest';
import { LANDING_TEMPLATES, getLandingTemplate } from './landing-templates';

describe('landing-templates premium V1', () => {
  it('exposes 4 demo templates', () => {
    expect(LANDING_TEMPLATES).toHaveLength(4);
    expect(getLandingTemplate('quick_lead')).toBeDefined();
  });

  it('essai véhicule includes hero, trust, form, faq, footer', () => {
    const template = getLandingTemplate('test_drive');
    expect(template).toBeDefined();
    const types = template!.blocks.map((b) => b.blockType);
    expect(types).toEqual(['hero', 'trust_bar', 'lead_form', 'faq', 'footer_legal']);
    expect(template!.themeDefaults?.seoTitle).toBeTruthy();
  });

  it('offre véhicule includes features, image, cta and form', () => {
    const template = getLandingTemplate('seasonal_offer');
    const types = template!.blocks.map((b) => b.blockType);
    expect(types).toContain('features');
    expect(types).toContain('image');
    expect(types).toContain('final_cta');
    expect(types).toContain('lead_form');
  });

  it('templates use no external image URLs by default', () => {
    for (const template of LANDING_TEMPLATES) {
      for (const block of template.blocks) {
        const url = block.propsJson.imageUrl;
        if (typeof url === 'string' && url.startsWith('http')) {
          throw new Error(`External image in ${template.id}`);
        }
      }
    }
    expect(true).toBe(true);
  });
});
