import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';
import { ACTIVE_V3_BLOCK_TYPES } from '../landing-render/block-design-system';
import type { RenderAssetMap } from '../landing-render/render-asset.types';

describe('BuilderV3HtmlCompilerService all active blocks', () => {
  const compiler = new BuilderV3HtmlCompilerService();
  const baseInput = {
    pageTitle: 'Campagne Auto Hall QA',
    metaDescription: 'Page test premium blocks',
    primaryColor: '#b91c1c',
    secondaryColor: '#1e293b',
    headingFont: 'Inter',
    bodyFont: 'Roboto',
    renderContext: { mode: 'export' as const, assetMap: {} as RenderAssetMap },
  };

  const PLACEHOLDER_SNIPPETS = [
    'Titre principal à renseigner',
    'Sous-titre à renseigner',
    'Visuel véhicule',
    'Image 1',
    'Modèle et offre à renseigner',
    'Témoignage à compléter',
    'Réponse à compléter',
    'Sélectionnez une image',
  ];

  const minimalProps: Record<string, Record<string, unknown>> = {
    hero_campaign: { title: 'Réservez votre essai en concession', buttonText: 'Essai' },
    hero_form_campaign: {
      title: 'Réservez votre essai en concession',
      form: { title: 'Contact', submitText: 'Envoyer' },
    },
    hero_vehicle_offer: {
      brandId: 'ford',
      modelName: 'Ford Ranger',
      headline: 'Réservez votre essai en concession',
      primaryCtaLabel: 'Essai',
    },
    promo_autohall: { title: 'Auto Hall', formTitle: 'Offre', submitText: 'Envoyer' },
    lead_form: { title: 'Contact', submitText: 'Envoyer' },
    cta_band: { title: 'Essai gratuit', buttonText: 'Réserver' },
    final_cta: { title: 'Essai gratuit', buttonText: 'Réserver' },
    vehicle_offer: { heading: 'Offre du moment', priceValue: '299 900 DH', buttonText: 'Offre' },
    vehicle_range: {
      heading: 'Gamme',
      vehicles: [{ name: 'SUV', energy: 'Hybride', ctaText: 'Voir' }],
    },
    vehicle_features: {
      heading: 'Caractéristiques',
      items: [{ title: 'Moteur', description: 'Hybride' }],
    },
    gallery: { heading: 'Galerie' },
    pricing_trim: {
      heading: 'Finitions',
      trims: [{ name: 'Active', price: '189 900 DH', buttonText: 'Choisir' }],
    },
    benefits: {
      heading: 'Avantages',
      items: [{ title: 'Réseau', description: 'National' }],
    },
    trust_bar: { metrics: [{ value: '+50', label: 'Concessions' }] },
    testimonials: {
      heading: 'Avis',
      items: [{ quote: 'Excellent service', author: 'Karim B.' }],
    },
    faq: {
      heading: 'FAQ',
      items: [{ question: 'Essai ?', answer: 'Oui, en concession.' }],
    },
    footer_legal: { legalText: '© Auto Hall. Photos non contractuelles.' },
    rich_text: { titre: 'Auto Hall', contenu: 'Campagne premium.' },
    media_only: {},
    spacer_divider: { type: 'solid', hauteur: 'M' },
    video_embed: {},
  };

  it('routes every active V3 block through landing render', () => {
    expect(ACTIVE_V3_BLOCK_TYPES.length).toBe(21);
    const html = compiler.compile({
      ...baseInput,
      blocks: ACTIVE_V3_BLOCK_TYPES.map((type, index) => ({
        type,
        sortOrder: index + 1,
        propsJson: minimalProps[type] ?? {},
      })),
    });

    expect(html).toContain('assets/style.css');
    expect(html).not.toContain('cdn.tailwindcss.com');
    expect(html).not.toContain('blob:');
    expect(html).not.toContain('localhost:5173');

    for (const snippet of PLACEHOLDER_SNIPPETS) {
      expect(html).not.toContain(snippet);
    }
  });

  it('exports QA campaign page with expected lp-* sections', () => {
    const qaBlocks = [
      'hero_form_campaign',
      'vehicle_offer',
      'vehicle_range',
      'benefits',
      'faq',
      'final_cta',
      'footer_legal',
    ] as const;

    const html = compiler.compile({
      ...baseInput,
      blocks: qaBlocks.map((type, index) => ({
        type,
        sortOrder: index + 1,
        propsJson: minimalProps[type] ?? {},
      })),
    });

    expect(html).toContain('lp-hero-form-campaign');
    expect(html).toContain('lp-vehicle-offer');
    expect(html).toContain('lp-vehicle-range');
    expect(html).toContain('lp-benefits');
    expect(html).toContain('lp-faq');
    expect(html).toContain('lp-final-cta');
    expect(html).toContain('lp-footer-legal');
    expect(html).toContain('form class="lp-lead-form');
  });

  it('maps design props to CSS modifier classes', () => {
    const html = compiler.compile({
      ...baseInput,
      blocks: [
        {
          type: 'benefits',
          sortOrder: 1,
          propsJson: {
            heading: 'Avantages',
            items: [{ title: 'A', description: 'B' }],
            design: { tone: 'brand', variant: 'grid', alignment: 'center', density: 'comfortable' },
          },
        },
      ],
    });

    expect(html).toContain('lp-benefits--tone-brand');
    expect(html).toContain('lp-benefits--variant-grid');
    expect(html).toContain('lp-benefits--align-center');
  });

  it('renders rich_text with French prop keys', () => {
    const html = compiler.compile({
      ...baseInput,
      blocks: [
        {
          type: 'rich_text',
          sortOrder: 1,
          propsJson: {
            titre: 'Un accompagnement de confiance',
            contenu: 'Texte campagne Auto Hall.',
          },
        },
      ],
    });

    expect(html).toContain('lp-rich-text');
    expect(html).toContain('Un accompagnement de confiance');
    expect(html).toContain('Texte campagne Auto Hall.');
  });

  it('renders testimonials from items array', () => {
    const html = compiler.compile({
      ...baseInput,
      blocks: [
        {
          type: 'testimonials',
          sortOrder: 1,
          propsJson: {
            heading: 'Avis',
            items: [{ quote: 'Service excellent', author: 'Karim B.' }],
          },
        },
      ],
    });

    expect(html).toContain('lp-testimonial-card');
    expect(html).toContain('Service excellent');
    expect(html).toContain('Karim B.');
  });
});
