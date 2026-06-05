import { describe, expect, it } from 'vitest';
import { STUDIO_V2_TEMPLATES } from './index';

describe('STUDIO_V2_TEMPLATES', () => {
  it('exposes five production templates', () => {
    expect(STUDIO_V2_TEMPLATES.map((t) => t.id)).toEqual([
      'offre-sav',
      'ford-promo',
      'gamme-thermique',
      'gamme-hev',
      'capture-lead-rapide',
    ]);
  });

  it('ford-promo template includes hero, offer and lead form', () => {
    const doc = STUDIO_V2_TEMPLATES.find((t) => t.id === 'ford-promo')!.build();
    const json = JSON.stringify(doc);
    expect(json).toContain('HeroAutoHall');
    expect(json).toContain('VehicleOffer');
    expect(json).toContain('LeadFormAutoHall');
    expect((doc.root?.props as { themePreset?: string })?.themePreset).toBe('ford-promo');
  });
});
