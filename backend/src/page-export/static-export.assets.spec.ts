import { buildIndexHtml } from './static-export.builder';
import type { RenderAssetMap } from '../landing-render/render-asset.types';

const ASSET_ID = '22222222-2222-2222-2222-222222222222';

describe('static export assets', () => {
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

  it('index.html uses relative export path for uploaded hero image', () => {
    const html = buildIndexHtml(
      { title: 'LP', campaignName: 'Camp', brand: 'Auto Hall' },
      [
        {
          blockType: 'hero',
          sortOrder: 0,
          propsJson: {
            title: 'Offre',
            imageAssetId: ASSET_ID,
          },
        },
      ],
      null,
      { mode: 'export', assetMap },
    );

    expect(html).toContain('src="assets/images/export-hero.png"');
    expect(html).not.toMatch(/\/api\/assets\//);
    expect(html).not.toContain('data:image');
  });
});
