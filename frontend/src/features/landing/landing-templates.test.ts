import { describe, expect, it } from 'vitest';
import { LANDING_TEMPLATES, getLandingTemplate } from './landing-templates';
import { getActivePaletteBlocks } from '../builder-engine/registry/block-registry';

describe('V1 landing templates', () => {
  it('exposes 3 stable templates', () => {
    expect(LANDING_TEMPLATES).toHaveLength(3);
    expect(getLandingTemplate('vehicle_offer')).toBeDefined();
    expect(getLandingTemplate('sav_offer')).toBeDefined();
    expect(getLandingTemplate('quick_lead')).toBeDefined();
  });

  it('vehicle offer includes hero, features, form with consent and footer', () => {
    const template = getLandingTemplate('vehicle_offer')!;
    const types = template.blocks.map((b) => b.blockType);
    expect(types).toEqual(['hero', 'features', 'lead_form', 'faq', 'footer_legal']);
    const form = template.blocks.find((b) => b.blockType === 'lead_form');
    expect(form?.propsJson.consentLabel).toBeTruthy();
    expect(form?.propsJson.formConfig).toBeTruthy();
    const hero = template.blocks.find((b) => b.blockType === 'hero');
    expect(hero?.propsJson.buttonTarget).toBe('#lead-form');
  });

  it('palette hides incomplete campaign blocks', () => {
    const types = getActivePaletteBlocks().map((b) => b.type);
    expect(types).toContain('hero');
    expect(types).toContain('lead_form');
    expect(types).toContain('benefits');
    expect(types).not.toContain('vehicle_range');
    expect(types).not.toContain('financing');
    expect(types).not.toContain('offer_highlights');
  });
});
