import { describe, expect, it } from 'vitest';
import { sanitizePropsPatch } from './sanitize-props-patch';

describe('sanitizePropsPatch', () => {
  it('drops base64 data URLs from patches', () => {
    const patch = sanitizePropsPatch({
      imageUrl: 'data:image/png;base64,iVBORw0KGgo=',
      imageAssetId: 'asset-uuid',
    });

    expect(patch.imageUrl).toBeUndefined();
    expect(patch.imageAssetId).toBe('asset-uuid');
  });

  it('keeps imageAssetId as a short uuid string', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const patch = sanitizePropsPatch({ imageAssetId: id });
    expect(patch.imageAssetId).toBe(id);
  });

  it('preserves formConfig boolean flags', () => {
    const patch = sanitizePropsPatch({
      formConfig: {
        showCivility: true,
        showCity: false,
        showMessage: true,
        unknownKey: 'drop-me',
      },
    });

    expect(patch.formConfig).toEqual({
      showCivility: true,
      showCity: false,
      showMessage: true,
    });
  });
});
