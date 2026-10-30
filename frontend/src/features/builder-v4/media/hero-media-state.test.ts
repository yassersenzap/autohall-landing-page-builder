import { describe, expect, it } from 'vitest';
import { CHERY_ASSET_ID } from './media-constants';
import { isEngineAssetId, isUserHeroMediaAssigned } from './hero-media-state';
import type { MediaAsset } from '../types/assets.types';

const getAsset = (id: string): MediaAsset | undefined => {
  if (id === CHERY_ASSET_ID) {
    return {
      id,
      name: 'Chery',
      src: '/assets/hero-fixtures/chery.webp',
      mimeType: 'image/webp',
      source: 'builtin',
      tags: [],
      createdAt: '',
    };
  }
  if (id === 'user-upload-1') {
    return {
      id,
      name: 'User BMW',
      src: 'data:image/png;base64,abc',
      mimeType: 'image/png',
      source: 'upload',
      tags: ['upload'],
      createdAt: '',
    };
  }
  return undefined;
};

describe('hero-media-state', () => {
  it('treats engine asset ids as not user-assigned', () => {
    expect(isEngineAssetId(CHERY_ASSET_ID)).toBe(true);
    expect(
      isUserHeroMediaAssigned({ src: '/assets/hero-fixtures/chery.webp', assetId: CHERY_ASSET_ID }, getAsset),
    ).toBe(false);
  });

  it('treats upload asset as user-assigned', () => {
    expect(
      isUserHeroMediaAssigned({ src: 'data:image/png;base64,abc', assetId: 'user-upload-1' }, getAsset),
    ).toBe(true);
  });

  it('treats empty props as not assigned', () => {
    expect(isUserHeroMediaAssigned({ src: '', alt: '' }, getAsset)).toBe(false);
  });

  it('treats orphan src without assetId as assigned', () => {
    expect(isUserHeroMediaAssigned({ src: 'data:image/png;base64,xyz', alt: '' }, getAsset)).toBe(true);
  });
});
