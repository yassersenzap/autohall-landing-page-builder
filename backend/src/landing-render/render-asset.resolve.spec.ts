import { renderBlockHtml } from './block-renderer';
import {
  buildPublicAssetFileUrl,
  resolveHeroImageSrc,
} from './render-asset.resolve';
import type {
  LandingRenderContext,
  RenderAssetMap,
} from './render-asset.types';

const ASSET_ID = '11111111-1111-1111-1111-111111111111';

function buildContext(
  mode: 'preview' | 'export',
  assetMap: RenderAssetMap = {},
): LandingRenderContext {
  return { mode, assetMap };
}

describe('render-asset.resolve', () => {
  const assetMap: RenderAssetMap = {
    [ASSET_ID]: {
      previewUrl:
        'http://api.example.com/api/public/assets/11111111-1111-1111-1111-111111111111/file',
      exportPath: 'assets/images/hero-test.webp',
      storagePath: 'page-versions/x/hero-test.webp',
      storedName: 'hero-test.webp',
      mimeType: 'image/webp',
      absolutePath: '/tmp/hero-test.webp',
    },
  };

  it('uses exportPath when imageAssetId exists in export mode', () => {
    const src = resolveHeroImageSrc(
      { imageAssetId: ASSET_ID, imageUrl: 'https://cdn.example.com/x.jpg' },
      buildContext('export', assetMap),
    );
    expect(src).toBe('assets/images/hero-test.webp');
  });

  it('uses previewUrl when imageAssetId exists in preview mode', () => {
    const src = resolveHeroImageSrc(
      { imageAssetId: ASSET_ID },
      buildContext('preview', assetMap),
    );
    expect(src).toContain('/api/public/assets/');
    expect(src).not.toContain('/api/assets/');
  });

  it('keeps external imageUrl when no imageAssetId', () => {
    const src = resolveHeroImageSrc(
      { imageUrl: 'https://cdn.example.com/car.jpg' },
      buildContext('export', assetMap),
    );
    expect(src).toBe('https://cdn.example.com/car.jpg');
  });

  it('rejects data URLs in export mode', () => {
    const src = resolveHeroImageSrc(
      { imageUrl: 'data:image/png;base64,abc' },
      buildContext('export'),
    );
    expect(src).toBeNull();
  });

  it('builds public asset file URL', () => {
    expect(buildPublicAssetFileUrl('http://localhost:3000', ASSET_ID)).toBe(
      'http://localhost:3000/api/public/assets/11111111-1111-1111-1111-111111111111/file',
    );
  });
});

describe('renderBlockHtml hero', () => {
  const assetMap: RenderAssetMap = {
    [ASSET_ID]: {
      previewUrl:
        'http://localhost:3000/api/public/assets/11111111-1111-1111-1111-111111111111/file',
      exportPath: 'assets/images/hero.webp',
      storagePath: 'page-versions/pv/hero.webp',
      storedName: 'hero.webp',
      mimeType: 'image/webp',
      absolutePath: '/storage/hero.webp',
    },
  };

  it('renders export HTML with relative asset path', () => {
    const html = renderBlockHtml(
      {
        blockType: 'hero',
        sortOrder: 0,
        propsJson: {
          title: 'Test',
          imageAssetId: ASSET_ID,
          imageUrl: 'https://ignored.example/x.jpg',
        },
      },
      { mode: 'export', assetMap },
    );

    expect(html).toContain('src="assets/images/hero.webp"');
    expect(html).not.toContain('/api/assets/');
    expect(html).not.toContain('localhost');
    expect(html).not.toContain('data:image');
  });

  it('renders preview HTML with public asset URL', () => {
    const html = renderBlockHtml(
      {
        blockType: 'hero',
        sortOrder: 0,
        propsJson: { title: 'Test', imageAssetId: ASSET_ID },
      },
      { mode: 'preview', assetMap },
    );

    expect(html).toContain('/api/public/assets/');
    expect(html).not.toContain('/api/assets/');
  });

  it('renders external imageUrl when no asset', () => {
    const html = renderBlockHtml({
      blockType: 'hero',
      sortOrder: 0,
      propsJson: {
        title: 'Test',
        imageUrl: 'https://cdn.example.com/hero.jpg',
      },
    });

    expect(html).toContain('src="https://cdn.example.com/hero.jpg"');
  });
});
