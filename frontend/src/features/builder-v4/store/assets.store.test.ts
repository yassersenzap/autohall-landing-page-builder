import { describe, expect, it, beforeEach } from 'vitest';
import { HERO_FIXTURE_PATHS } from '../media/media-constants';
import {
  selectLibraryAssets,
  selectStockLibraryAssets,
  useAssetsStore,
} from './assets.store';

describe('useAssetsStore', () => {
  beforeEach(() => {
    useAssetsStore.setState((state) => ({
      searchQuery: '',
      previewAssetId: null,
      uploadError: null,
      favoriteAssetIds: [],
      recentAssetIds: [],
      assets: state.assets.filter((asset) => asset.source !== 'upload'),
    }));
  });

  it('resolves engine campaign asset without listing it in library uploads', () => {
    const asset = useAssetsStore.getState().getAsset('autohall-gamme-thermique');
    expect(asset?.src).toBe(HERO_FIXTURE_PATHS.chery);
    expect(selectLibraryAssets(useAssetsStore.getState())).toHaveLength(0);
  });

  it('exposes stock library assets for Media panel', () => {
    const stock = selectStockLibraryAssets(useAssetsStore.getState());
    expect(stock.length).toBeGreaterThan(0);
    expect(stock.some((asset) => asset.name === 'BMW')).toBe(true);
  });

  it('filters library uploads by search query', () => {
    useAssetsStore.getState().addAsset({
      name: 'BMW Upload',
      src: 'data:image/png;base64,abc',
      mimeType: 'image/png',
      source: 'upload',
      tags: ['upload', 'bmw'],
    });
    useAssetsStore.getState().setSearchQuery('bmw');
    const filtered = selectLibraryAssets(useAssetsStore.getState());
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.source).toBe('upload');
  });

  it('adds uploaded assets', () => {
    const created = useAssetsStore.getState().addAsset({
      name: 'Test Upload',
      src: 'data:image/png;base64,abc',
      mimeType: 'image/png',
      source: 'upload',
      tags: ['upload'],
    });
    expect(useAssetsStore.getState().getAsset(created.id)?.source).toBe('upload');
    expect(selectLibraryAssets(useAssetsStore.getState())).toHaveLength(1);
  });
});
