import { describe, expect, it } from 'vitest';
import {
  STUDIO_V2_TEMPLATES,
  TEMPLATE_ID_ALIASES,
  buildStudioV2TemplateDocument,
  getStudioV2Template,
} from './index';

describe('STUDIO_V2_STARTERS', () => {
  it('exposes eight professional starters', () => {
    expect(STUDIO_V2_TEMPLATES.map((t) => t.id)).toEqual([
      'lead-capture-simple',
      'vehicle-offer-promo',
      'after-sales-appointment',
      'event-landing',
      'premium-launch',
      'racing-sport-campaign',
      'financing-offer',
      'minimal-landing',
    ]);
  });

  it('vehicle offer starter includes hero, offer and lead form', () => {
    const doc = STUDIO_V2_TEMPLATES.find((t) => t.id === 'vehicle-offer-promo')!.build();
    const json = JSON.stringify(doc);
    expect(json).toContain('HeroAutoHall');
    expect(json).toContain('VehicleOffer');
    expect(json).toContain('LeadFormAutoHall');
    expect((doc.root?.props as { themePreset?: string })?.themePreset).toBe('ford-promo');
  });

  it('resolves legacy starter aliases', () => {
    expect(getStudioV2Template('ford-promo')?.id).toBe('vehicle-offer-promo');
    expect(getStudioV2Template('offre-sav')?.id).toBe('after-sales-appointment');
    expect(buildStudioV2TemplateDocument('capture-lead-rapide').content?.length).toBeGreaterThan(0);
    expect(TEMPLATE_ID_ALIASES['ford-promo']).toBe('vehicle-offer-promo');
  });
});
