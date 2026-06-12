import { renderHeroVehicleOfferHtml } from './hero-vehicle-offer.render';
import { resolveBrandPresetTokens } from './brand-presets';
import { resolveBrandCtaPrimaryTextColor } from './brand-cta-contrast';
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
    heroImageAlt: 'Ford Ranger vue 3/4',
    imageFit: 'cover',
    imagePosition: 'right',
    cropPreset: 'center',
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

  it('reflects image controls in modifier classes and focal inline style', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      imageFit: 'contain',
      imagePosition: 'left',
      cropPreset: 'top',
      overlayIntensity: 'heavy',
      layoutVariant: 'full-bleed-overlay',
    });

    expect(html).toContain('lp-hero-vehicle-offer--fit-contain');
    expect(html).toContain('lp-hero-vehicle-offer--position-left');
    expect(html).toContain('lp-hero-vehicle-offer--crop-top');
    expect(html).toContain('lp-hero-vehicle-offer--overlay-heavy');
    expect(html).toContain('lp-hero-vehicle-offer--layout-full-bleed-overlay');
    expect(html).toContain('--lp-hero-focal-x: 50%');
    expect(html).toContain('--lp-hero-focal-y: 20%');
    expect(html).toContain('lp-hero-vehicle-offer__overlay');
  });

  it('exports custom focal point via inline CSS variables', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      cropPreset: 'custom',
      focalPointX: 15,
      focalPointY: 85,
    });

    expect(html).toContain('--lp-hero-focal-x: 15%');
    expect(html).toContain('--lp-hero-focal-y: 85%');
    expect(html).toContain('lp-hero-vehicle-offer--crop-custom');
  });

  it('exports mobile image safely with relative path', () => {
    const html = renderHeroVehicleOfferHtml(
      {
        ...baseProps,
        mobileImage: 'mobile-asset-id',
      },
      {
        mode: 'export',
        assetMap: {
          'mobile-asset-id': {
            previewUrl: 'http://localhost:3000/api/assets/mobile',
            exportPath: 'assets/images/ranger-mobile.jpg',
            storagePath: 'pv/mobile.jpg',
            storedName: 'mobile.jpg',
            mimeType: 'image/jpeg',
            absolutePath: '/tmp/mobile.jpg',
          },
        },
      },
    );

    expect(html).toContain('lp-hero-vehicle-offer__img-mobile');
    expect(html).toContain('src="assets/images/ranger-mobile.jpg"');
    expect(html).not.toContain('/api/assets/');
  });

  it('escapes alt text and renders placeholder when no image', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      heroImageAlt: 'Ranger <script>',
      heroImage: '',
      heroImageUrl: '',
      mobileImage: '',
      mobileImageUrl: '',
    });

    expect(html).toContain('aria-label="Ranger &lt;script&gt;"');
    expect(html).toContain('lp-hero-vehicle-offer__media-placeholder');
    expect(html).not.toContain('<script>');
  });

  it('includes brand-safe CTA text color for Opel', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      brandId: 'opel',
    });

    expect(html).toContain('--lp-brand-cta-primary-text: #111827');
    expect(resolveBrandCtaPrimaryTextColor('opel', '#f7d300')).toBe('#111827');
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

  it('reflects blockVisual image scale, offer card and price emphasis in export', () => {
    const html = renderHeroVehicleOfferHtml({
      ...baseProps,
      blockVisual: {
        vehicleImageScale: 'xl',
        offerCardStyle: 'elevated',
        priceEmphasis: 'strong',
        heroHeight: 'tall',
        vehicleImagePosition: 'right',
        layoutEmphasis: 'vehicle_focus',
        badgePlacement: 'top',
      },
    });

    expect(html).toContain('lp-hero-vehicle-offer--bv-image-scale-xl');
    expect(html).toContain('lp-hero-vehicle-offer--bv-offer-card-elevated');
    expect(html).toContain('lp-hero-vehicle-offer--bv-price-emphasis-strong');
    expect(html).toContain('lp-hero-vehicle-offer--bv-height-tall');
  });

  it('resolveBrandPresetTokens falls back to Auto Hall neutral', () => {
    const fallback = resolveBrandPresetTokens('unknown_brand');
    expect(fallback.primaryColor).toBe('#b91c1c');
    expect(fallback.name).toBe('Auto Hall');

    const ford = resolveBrandPresetTokens('ford');
    expect(ford.primaryColor).toBe('#003478');
  });
});
