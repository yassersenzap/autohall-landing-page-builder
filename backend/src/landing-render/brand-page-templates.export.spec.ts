import { describe, expect, it } from '@jest/globals';
import { buildIndexHtml } from '../page-export/static-export.builder';
import { renderBlockHtml } from './block-renderer';
import type { RenderAssetMap } from './render-asset.types';

/** Minimal props mirroring ford/opel brand showcase templates for export parity. */
const FORD_BRAND_BLOCKS = [
  {
    blockType: 'vehicle_showcase_split',
    sortOrder: 0,
    propsJson: {
      brand: 'Ford',
      model: 'Ranger',
      headline: 'Ford chez Auto Hall',
      price: 'À partir de — DH',
      motionPreset: 'reveal',
      imageAssetId: 'ford-hero',
    },
  },
  {
    blockType: 'premium_bento_features',
    sortOrder: 1,
    propsJson: {
      title: 'Avantages Ford',
      cards: [{ title: 'Réseau', description: 'National' }],
      motionPreset: 'stagger_children',
    },
  },
  {
    blockType: 'animated_stats_strip',
    sortOrder: 2,
    propsJson: {
      metrics: [{ value: '50+', label: 'Concessions' }],
      countAnimation: 'count_up',
    },
  },
  {
    blockType: 'sticky_lead_cta',
    sortOrder: 3,
    propsJson: {
      title: 'Réservez un essai',
      primaryCtaLabel: 'Contact',
      primaryCtaHref: '#lead-form',
    },
  },
  {
    blockType: 'footer_legal',
    sortOrder: 4,
    propsJson: { legalText: '© Auto Hall. Photos non contractuelles.' },
  },
];

describe('brand page template export parity', () => {
  const exportContext = {
    mode: 'export' as const,
    assetMap: {
      'ford-hero': {
        assetId: 'ford-hero',
        exportPath: 'assets/images/ford-ranger.jpg',
        previewUrl: 'http://localhost:3000/api/assets/ford-hero',
        absolutePath: '/tmp/ford.jpg',
      },
    } as RenderAssetMap,
  };

  it('renders Ford brand page blocks with premium classes', () => {
    for (const block of FORD_BRAND_BLOCKS) {
      const html = renderBlockHtml(block, exportContext);
      expect(html).not.toContain('localhost');
      expect(html).not.toContain('/studio');
      expect(html).not.toContain('blob:');
      expect(html).not.toContain('_studio');
    }

    const showcase = renderBlockHtml(FORD_BRAND_BLOCKS[0], exportContext);
    expect(showcase).toContain('lp-vehicle-showcase');
    expect(showcase).toContain('assets/images/ford-ranger.jpg');
    expect(showcase).toContain('data-lp-motion');

    const bento = renderBlockHtml(FORD_BRAND_BLOCKS[1], exportContext);
    expect(bento).toContain('lp-premium-bento');
  });

  it('exports brand page HTML with motion runtime once', () => {
    const html = buildIndexHtml(
      { title: 'Ford Marque', campaignName: 'Ford', brand: 'Ford' },
      FORD_BRAND_BLOCKS,
      null,
      exportContext,
    );

    expect(html).toContain('js/motion-runtime.js');
    expect((html.match(/motion-runtime\.js/g) ?? []).length).toBe(1);
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('/api/assets/');
  });

  it('renders Opel brand hero lead block cleanly', () => {
    const html = renderBlockHtml({
      blockType: 'campaign_lead_hero',
      sortOrder: 0,
      propsJson: {
        brandId: 'opel',
        campaignTitle: 'Opel chez Auto Hall',
        formTitle: 'Contact',
        formCtaLabel: 'Continuer',
      },
    });
    expect(html).toContain('lp-campaign-lead-hero');
    expect(html).not.toContain('<script');
  });
});
