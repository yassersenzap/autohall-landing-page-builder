import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';
import type { RenderAssetMap } from '../landing-render/render-asset.types';

const ASSET_ID = '22222222-2222-2222-2222-222222222222';

describe('BuilderV3HtmlCompilerService assets', () => {
  const compiler = new BuilderV3HtmlCompilerService();

  const assetMap: RenderAssetMap = {
    [ASSET_ID]: {
      previewUrl: 'http://localhost:3000/api/public/assets/file',
      exportPath: 'assets/images/export-hero.png',
      storagePath: 'page-versions/pv/export-hero.png',
      storedName: 'export-hero.png',
      mimeType: 'image/png',
      absolutePath: '/tmp/export-hero.png',
    },
  };

  const renderContext = { mode: 'export' as const, assetMap };

  it('uses relative export path for media_only block with imageAssetId', () => {
    const html = compiler.compile({
      pageTitle: 'Test LP',
      metaDescription: 'Description',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      blocks: [
        {
          type: 'media_only',
          sortOrder: 1,
          propsJson: {
            imageAssetId: ASSET_ID,
            alt: 'Visuel campagne',
          },
        },
      ],
      renderContext,
    });

    expect(html).toContain('src="assets/images/export-hero.png"');
    expect(html).not.toContain('blob:');
    expect(html).not.toContain('/api/public/assets/');
  });

  it('resolves gallery items and page settings og image to relative paths', () => {
    const html = compiler.compile({
      pageTitle: 'Galerie',
      metaDescription: 'Desc',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      blocks: [
        {
          type: 'gallery',
          sortOrder: 1,
          propsJson: {
            images: [{ imageAssetId: ASSET_ID, alt: 'Photo 1' }],
          },
        },
      ],
      renderContext,
      pageSettings: { ogImageAssetId: ASSET_ID },
    });

    expect(html).toContain('src="assets/images/export-hero.png"');
    expect(html).toContain('property="og:image" content="assets/images/export-hero.png"');
    expect(html).not.toContain('blob:');
    expect(html).not.toContain('/api/public/assets/');
  });
});
