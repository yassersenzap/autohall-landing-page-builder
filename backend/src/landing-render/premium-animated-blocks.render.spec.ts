import { describe, expect, it } from '@jest/globals';
import { buildIndexHtml } from '../page-export/static-export.builder';
import { getLandingPageStylesheet } from '../landing-render/landing-styles';
import { renderBlockHtml } from './block-renderer';

describe('premium animated blocks render', () => {
  const exportContext = {
    mode: 'export' as const,
    assetMap: {
      asset1: {
        assetId: 'asset1',
        exportPath: 'assets/images/hero.jpg',
        previewUrl: 'http://localhost:3000/api/assets/asset1',
        absolutePath: '/tmp/hero.jpg',
      },
    },
  };

  it('renders premium bento with motion classes', () => {
    const html = renderBlockHtml({
      blockType: 'premium_bento_features',
      sortOrder: 0,
      propsJson: {
        title: 'Avantages',
        cards: [{ title: 'Réseau', description: 'National' }],
        motionPreset: 'fade_up',
      },
    });
    expect(html).toContain('lp-premium-bento');
    expect(html).toContain('lp-motion--fade-up');
    expect(html).toContain('data-lp-motion');
    expect(html).toContain('Réseau');
    expect(html).not.toContain('<script');
  });

  it('renders animated stats with count-up attributes', () => {
    const html = renderBlockHtml({
      blockType: 'animated_stats_strip',
      sortOrder: 0,
      propsJson: {
        metrics: [{ value: '50+', label: 'Concessions' }],
        countAnimation: 'count_up',
      },
    });
    expect(html).toContain('lp-stats-strip');
    expect(html).toContain('data-lp-count-up');
    expect(html).toContain('data-lp-count-target="50"');
  });

  it('renders vehicle showcase with relative export image path', () => {
    const html = renderBlockHtml(
      {
        blockType: 'vehicle_showcase_split',
        sortOrder: 0,
        propsJson: {
          headline: 'Ford Ranger',
          imageAssetId: 'asset1',
        },
      },
      exportContext,
    );
    expect(html).toContain('assets/images/hero.jpg');
    expect(html).not.toContain('localhost');
    expect(html).not.toContain('/api/assets');
  });

  it('stylesheet includes reduced motion rules', () => {
    const css = getLandingPageStylesheet();
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('.lp-motion');
  });

  it('index.html includes motion runtime once', () => {
    const html = buildIndexHtml(
      { title: 'LP', campaignName: 'Camp', brand: 'Auto Hall' },
      [
        {
          blockType: 'premium_bento_features',
          sortOrder: 0,
          propsJson: { title: 'Test', cards: [{ title: 'A', description: 'B' }] },
        },
        {
          blockType: 'animated_stats_strip',
          sortOrder: 1,
          propsJson: { metrics: [{ value: '10', label: 'X' }] },
        },
      ],
      null,
    );
    expect(html).toContain('js/motion-runtime.js');
    expect((html.match(/motion-runtime\.js/g) ?? []).length).toBe(1);
  });
});
