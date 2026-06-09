import {
  buildPremiumSectionClasses,
  normalizePremiumDesign,
  parseTrustItems,
} from './premium-block-design';

describe('premium-block-design (backend)', () => {
  it('ignores invalid variant values', () => {
    const design = normalizePremiumDesign({
      design: { variant: 'freeform', tone: 'neon' },
    });
    expect(design.variant).toBe('split-form');
    expect(design.tone).toBe('light');
  });

  it('parses trust reassurance items', () => {
    expect(
      parseTrustItems({
        trustItems: ['Réponse sous 24h', '', '  Essai gratuit  '],
      }),
    ).toEqual(['Réponse sous 24h', 'Essai gratuit']);
  });

  it('builds vehicle offer premium classes', () => {
    const classes = buildPremiumSectionClasses(
      'lp-vehicle-offer',
      normalizePremiumDesign({
        design: { variant: 'compact', tone: 'dark', ctaStyle: 'white' },
      }),
    );
    expect(classes).toContain('lp-vehicle-offer--variant-compact');
    expect(classes).toContain('lp-vehicle-offer--tone-dark');
    expect(classes).toContain('lp-vehicle-offer--cta-white');
  });
});
