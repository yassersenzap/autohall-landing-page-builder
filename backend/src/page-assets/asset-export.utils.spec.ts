import { extractUsedAssetIdsFromBlocks } from './asset-export.utils';

describe('asset-export.utils', () => {
  it('collects imageAssetId from block props', () => {
    const ids = extractUsedAssetIdsFromBlocks([
      {
        propsJson: {
          title: 'Hero',
          imageAssetId: '11111111-1111-1111-1111-111111111111',
        },
      },
      {
        propsJson: { imageUrl: 'https://example.com/x.jpg' },
      },
    ]);

    expect(ids).toEqual(['11111111-1111-1111-1111-111111111111']);
  });
});
