import { renderHeroVehicleOfferHtml } from './hero-vehicle-offer.render';
import { resolveBrandPresetTokens } from './brand-presets';
import { renderBlockHtml } from './block-renderer';

describe('hero-vehicle-offer.render', () => {
  const baseProps = {
    brandId: 'ford',
    modelName: 'Ford Ranger',
    headline: 'Découvrez le nouveau Ranger',
    subheadline: 'Offre de lancement exclusive',
    offerLabel: 'Offre limitée',
    priceText: 'À partir de 299 900 DH',
    primaryCtaLabel: 'Réserver un essai',
    secondaryCtaLabel: 'Voir les finitions',
    imageFit: 'cover',
    imagePosition: 'right',
    focalPoint: 'center',
    overlayIntensity: 'medium',
    layoutVariant: 'split-media-right',
    design: { tone: 'brand', ctaStyle: 'primary', showOfferBadge: true },
  };

  it('renders expected content and brand CSS variables', () => {
    const html = renderHeroVehicleOfferHtml(baseProps);

    expect(html).toContain('lp-hero-vehicle-offer');
    expect(html).toContain('lp-hero-vehicle-offer__headline');
    expect(html).toContain('lp-hero-vehicle-offer__cta');
    expect(html).toContain('Découvrez le nouveau Ranger');
    expect(html).toContain('Ford Ranger');
    expect(html).toContain('Réserver un essai');
    expect(html).toContain('--lp-brand-primary: #003478');
    expect(html).toContain('Ford');
  });

  it('reflects image controls in modifier classes', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      imageFit: 'contain',
      imagePosition: 'left',
      focalPoint: 'top',
      overlayIntensity: 'heavy',
      layoutVariant: 'full-bleed-overlay',
    });

    expect(html).toContain('lp-hero-vehicle-offer--fit-contain');
    expect(html).toContain('lp-hero-vehicle-offer--position-left');
    expect(html).toContain('lp-hero-vehicle-offer--focal-top');
    expect(html).toContain('lp-hero-vehicle-offer--overlay-heavy');
    expect(html).toContain('lp-hero-vehicle-offer--layout-full-bleed-overlay');
    expect(html).toContain('lp-hero-vehicle-offer__overlay');
  });

  it('does not include React or private builder references', () => {
    const html = renderHeroVehicleOfferHtml(baseProps);

    expect(html).not.toContain('react');
    expect(html).not.toContain('React');
    expect(html).not.toContain('vite');
    expect(html).not.toContain('/studio');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('/api/assets/');
    expect(html).not.toContain('data:');
  });

  it('routes through renderBlockHtml', () => {
    const html = renderBlockHtml({
      blockType: 'hero_vehicle_offer',
      sortOrder: 1,
      propsJson: baseProps,
    });

    expect(html).toContain('lp-hero-vehicle-offer');
    expect(html).toContain('Découvrez le nouveau Ranger');
  });

  it('resolveBrandPresetTokens falls back to Auto Hall neutral', () => {
    const fallback = resolveBrandPresetTokens('unknown_brand');
    expect(fallback.primaryColor).toBe('#b91c1c');
    expect(fallback.name).toBe('Auto Hall');

    const ford = resolveBrandPresetTokens('ford');
    expect(ford.primaryColor).toBe('#003478');
  });
});
