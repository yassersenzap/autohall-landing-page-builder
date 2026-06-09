import { extractBuilderV3AssetIds } from './builder-v3-asset-collector';

describe('extractBuilderV3AssetIds', () => {
  it('collects imageAssetId from blocks and page settings', () => {
    const ids = extractBuilderV3AssetIds({
      blocks: [
        {
          propsJson: {
            imageAssetId: 'hero-asset-1',
            images: [{ imageAssetId: 'gallery-asset-1' }],
          },
        },
        {
          propsJson: {
            vehicles: [{ imageAssetId: 'vehicle-asset-1' }],
          },
        },
      ],
      pageSettings: {
        ogImageAssetId: 'og-asset-1',
        faviconAssetId: 'favicon-asset-1',
      },
    });

    expect(ids.sort()).toEqual(
      [
        'favicon-asset-1',
        'gallery-asset-1',
        'hero-asset-1',
        'og-asset-1',
        'vehicle-asset-1',
      ].sort(),
    );
  });
});
