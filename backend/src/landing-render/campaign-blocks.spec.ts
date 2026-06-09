import { describe, expect, it } from '@jest/globals';
import { buildLandingDocumentHtml } from '../landing-render/landing-document.builder';
import { renderBlockHtml } from '../landing-render/block-renderer';
import { leadFormHasConsent } from '../landing-render/lead-form-fields.builder';
import type { RenderAssetMap } from '../landing-render/render-asset.types';

describe('Auto Hall campaign render', () => {
  it('renders lead form with consent checkbox', () => {
    const html = renderBlockHtml({
      blockType: 'lead_form',
      sortOrder: 0,
      propsJson: {
        title: 'Contact',
        submitText: 'Envoyer',
        consentLabel: 'J’accepte le traitement de mes données.',
        formConfig: { showConsent: true, useSplitName: true, showCity: true },
      },
    });
    expect(html).toContain('name="consent"');
    expect(html).toContain('name="city"');
    expect(html).toContain('name="lastName"');
    expect(html).toContain('lp-lead-form__consent-text');
  });

  it('detects missing consent label', () => {
    expect(
      leadFormHasConsent({
        formConfig: { showConsent: true },
        consentLabel: '',
      }),
    ).toBe(false);
  });

  it('renders vehicle offer block', () => {
    const html = renderBlockHtml({
      blockType: 'offer_highlights',
      sortOrder: 1,
      propsJson: {
        modelName: 'Ranger',
        tagline: 'Pick-up',
        priceValue: 'Sur devis',
        buttonText: 'Demander',
      },
    });
    expect(html).toContain('lp-vehicle-offer');
    expect(html).toContain('Ranger');
  });

  it('renders vehicle range grid', () => {
    const html = renderBlockHtml({
      blockType: 'vehicle_range',
      sortOrder: 2,
      propsJson: {
        heading: 'Gamme',
        vehicles: [
          {
            name: 'Modèle HEV',
            energy: 'HEV',
            tag: 'Nouveauté',
            ctaText: 'Découvrir',
          },
        ],
      },
    });
    expect(html).toContain('lp-vehicle-range');
    expect(html).toContain('Modèle HEV');
  });

  it('renders full vehicle offer page with asset and lead form', () => {
    const assetMap: RenderAssetMap = {
      'asset-hero-1': {
        previewUrl:
          'https://api.example.com/api/public/assets/asset-hero-1/file',
        exportPath: 'assets/images/hero-demo.webp',
        storagePath: 'hero-demo.webp',
        storedName: 'hero-demo.webp',
        mimeType: 'image/webp',
        absolutePath: '/tmp/hero-demo.webp',
      },
    };

    const html = buildLandingDocumentHtml({
      shell: {
        title: 'Offre véhicule',
        campaignName: 'Campagne démo',
        brand: 'Auto Hall',
      },
      themeJson: {
        page: {
          seo: { title: 'Offre véhicule', description: 'Description SEO' },
          theme: { mode: 'dark', primaryColor: '#003B73' },
        },
      },
      blocks: [
        {
          id: 'hero-1',
          blockType: 'hero',
          sortOrder: 1,
          propsJson: {
            title: 'Promo Auto Hall',
            buttonText: 'Je suis intéressé',
            imageAssetId: 'asset-hero-1',
            alt: 'Véhicule démo',
          },
        },
        {
          id: 'form-1',
          blockType: 'lead_form',
          sortOrder: 2,
          propsJson: {
            title: 'Contact',
            submitText: 'Envoyer',
            consentLabel: 'J’accepte le traitement de mes données.',
            formConfig: {
              showConsent: true,
              showCity: true,
              useSplitName: true,
            },
          },
        },
      ],
      includeScripts: true,
      stylesheetHref: 'css/landing-page.css',
      renderContext: { mode: 'export', assetMap },
    });

    expect(html).toContain('Promo Auto Hall');
    expect(html).toContain('assets/images/hero-demo.webp');
    expect(html).not.toContain('/api/assets/');
    expect(html).not.toContain('data:image');
    expect(html).toContain('name="city"');
    expect(html).toContain('name="consent"');
    expect(html).toContain('js/lead-form.js');
    expect(html).toContain('css/landing-page.css');
  });
});
