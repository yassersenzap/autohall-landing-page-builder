import { describe, expect, it } from '@jest/globals';
import { renderBlockHtml } from './block-renderer';
import type { RenderAssetMap } from './render-asset.types';

const ASSET_ID = '33333333-3333-3333-3333-333333333333';

describe('marketing content blocks render', () => {
  const assetMap: RenderAssetMap = {
    [ASSET_ID]: {
      previewUrl: 'http://localhost:3000/api/assets/file',
      exportPath: 'assets/images/gallery-1.jpg',
      storagePath: 'gallery-1.jpg',
      storedName: 'gallery-1.jpg',
      mimeType: 'image/jpeg',
      absolutePath: '/tmp/gallery-1.jpg',
    },
  };

  it('renders edited FAQ items with escaped text', () => {
    const html = renderBlockHtml({
      blockType: 'faq',
      sortOrder: 0,
      propsJson: {
        heading: 'FAQ',
        items: [
          {
            question: 'Prix <script>',
            answer: 'Sur devis & négociation',
          },
        ],
      },
    });

    expect(html).toContain('lp-faq');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Sur devis &amp; négociation');
    expect(html).not.toContain('<script>');
  });

  it('renders edited benefits items safely', () => {
    const html = renderBlockHtml({
      blockType: 'benefits',
      sortOrder: 0,
      propsJson: {
        heading: 'Avantages',
        items: [{ title: 'Réseau', description: 'Partout au Maroc' }],
      },
    });

    expect(html).toContain('lp-benefits');
    expect(html).toContain('Réseau');
    expect(html).not.toContain('_studio');
  });

  it('renders vehicle_features items safely', () => {
    const html = renderBlockHtml({
      blockType: 'vehicle_features',
      sortOrder: 0,
      propsJson: {
        heading: 'Points clés',
        items: [{ title: 'Hybride', description: 'Efficience' }],
      },
    });

    expect(html).toContain('lp-features');
    expect(html).toContain('Hybride');
  });

  it('exports gallery array images with relative asset paths', () => {
    const html = renderBlockHtml(
      {
        blockType: 'gallery',
        sortOrder: 0,
        propsJson: {
          images: [{ imageAssetId: ASSET_ID, alt: 'Vue avant' }],
        },
      },
      { mode: 'export', assetMap },
    );

    expect(html).toContain('assets/images/gallery-1.jpg');
    expect(html).not.toContain('localhost');
    expect(html).not.toContain('/api/assets');
  });

  it('exports vehicle_range nested images with safe CTA links', () => {
    const html = renderBlockHtml(
      {
        blockType: 'vehicle_range',
        sortOrder: 0,
        propsJson: {
          vehicles: [
            {
              name: 'Ranger',
              imageAssetId: ASSET_ID,
              ctaText: 'Découvrir',
              ctaTarget: 'javascript:evil()',
            },
          ],
        },
      },
      { mode: 'export', assetMap },
    );

    expect(html).toContain('assets/images/gallery-1.jpg');
    expect(html).toContain('href="#lead-form"');
    expect(html).not.toContain('javascript:');
  });

  it('blocks unsafe image URLs in gallery items', () => {
    const html = renderBlockHtml({
      blockType: 'gallery',
      sortOrder: 0,
      propsJson: {
        images: [{ url: 'blob:http://local', alt: 'Test' }],
      },
    });

    expect(html).not.toContain('blob:');
  });
});
