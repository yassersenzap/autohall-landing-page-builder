import { describe, expect, it } from 'vitest';
import {
  LANDING_TEMPLATES,
  assertTemplateUsesDeliverableBlocks,
  getLandingTemplate,
} from './landing-templates';
import { isDeliverableBlockType } from '../builder-engine/registry/block-registry';

describe('Auto Hall campaign templates', () => {
  it('exposes 5 campaign templates', () => {
    expect(LANDING_TEMPLATES).toHaveLength(5);
    expect(getLandingTemplate('sav_offer')).toBeDefined();
    expect(getLandingTemplate('ford_promo')).toBeDefined();
    expect(getLandingTemplate('gamme_thermique')).toBeDefined();
    expect(getLandingTemplate('gamme_hev')).toBeDefined();
    expect(getLandingTemplate('quick_lead')).toBeDefined();
  });

  it('each template uses only deliverable flat blocks', () => {
    for (const template of LANDING_TEMPLATES) {
      expect(() => assertTemplateUsesDeliverableBlocks(template)).not.toThrow();
      for (const b of template.blocks) {
        expect(isDeliverableBlockType(b.blockType)).toBe(true);
        expect(b.blockType).not.toBe('layout_section');
        expect(b.propsJson.slots).toBeUndefined();
      }
    }
  });

  it('sav template uses hero_form_campaign', () => {
    const types = getLandingTemplate('sav_offer')!.blocks.map((b) => b.blockType);
    expect(types[0]).toBe('hero_form_campaign');
  });

  it('ford promo includes vehicle_offer and lead_form', () => {
    const types = getLandingTemplate('ford_promo')!.blocks.map((b) => b.blockType);
    expect(types).toContain('hero_campaign');
    expect(types).toContain('vehicle_offer');
    expect(types).toContain('lead_form');
  });

  it('gamme templates include vehicle_range as flat block', () => {
    for (const id of ['gamme_thermique', 'gamme_hev'] as const) {
      const types = getLandingTemplate(id)!.blocks.map((b) => b.blockType);
      expect(types).toContain('vehicle_range');
    }
  });
});
