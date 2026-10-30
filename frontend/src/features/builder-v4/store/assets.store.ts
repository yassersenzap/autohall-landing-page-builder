import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeRandomId } from '@/lib/create-safe-random-id';
import { ENGINE_MEDIA_ASSETS } from '../constants/default-assets';
import { STOCK_MEDIA_ASSETS } from '../constants/stock-media';
import type { MediaAsset } from '../types/assets.types';
import { resolveMediaSrc } from '../media/resolve-media-src';
import { markAssetsStoreRehydrated } from '../lib/rehydrate-coordinator';
import { useBuilderV4Store } from './document.store';
import { isDocumentEmpty } from '../lib/document-lifecycle';

export type AssetsState = {
  assets: MediaAsset[];
  searchQuery: string;
  previewAssetId: string | null;
  uploadError: string | null;
  activeTab: 'library' | 'upload';
  favoriteAssetIds: string[];
  recentAssetIds: string[];

  setSearchQuery: (query: string) => void;
  setPreviewAssetId: (id: string | null) => void;
  setActiveTab: (tab: 'library' | 'upload') => void;
  clearUploadError: () => void;
  toggleFavorite: (id: string) => void;

  addAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'> & { id?: string }) => MediaAsset;
  removeAsset: (id: string) => void;
  getAsset: (id: string) => MediaAsset | undefined;
  markRecent: (id: string) => void;

  applyAssetToNode: (nodeId: string, assetId: string) => void;
  /** Atomic Hero + Form — image layer only, keeps form visible. */
  applyAssetToHeroImageLayer: (assetId: string) => boolean;
  applyAssetToSelectedImage: (assetId: string) => boolean;
};

const MAX_RECENT = 12;

function mergeEngineAssets(stored: MediaAsset[]): MediaAsset[] {
  const byId = new Map<string, MediaAsset>();
  for (const asset of ENGINE_MEDIA_ASSETS) {
    byId.set(asset.id, asset);
  }
  for (const asset of STOCK_MEDIA_ASSETS) {
    byId.set(asset.id, asset);
  }
  for (const asset of stored) {
    if (asset.source === 'upload') {
      byId.set(asset.id, asset);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function filterAssets(assets: MediaAsset[], query: string): MediaAsset[] {
  const q = query.trim().toLowerCase();
  if (!q) return assets;
  return assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(q) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

function resolveAssetById(state: AssetsState, id: string): MediaAsset | undefined {
  return state.assets.find((asset) => asset.id === id);
}

/** User uploads — sole media library surface (Framer-style). */
export function selectMediaImages(state: AssetsState): MediaAsset[] {
  return state.assets
    .filter((asset) => asset.source === 'upload')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** User uploads only — legacy selector. */
export function selectLibraryAssets(state: AssetsState): MediaAsset[] {
  return filterAssets(selectMediaImages(state), state.searchQuery);
}

export function selectUploadAssets(state: AssetsState): MediaAsset[] {
  return selectLibraryAssets(state);
}

export function selectStockLibraryAssets(state: AssetsState): MediaAsset[] {
  return filterAssets(STOCK_MEDIA_ASSETS, state.searchQuery);
}

export function selectAllBrowsableAssets(state: AssetsState): MediaAsset[] {
  const uploads = state.assets.filter((asset) => asset.source === 'upload');
  const byId = new Map<string, MediaAsset>();
  for (const asset of STOCK_MEDIA_ASSETS) byId.set(asset.id, asset);
  for (const asset of uploads) byId.set(asset.id, asset);
  return filterAssets(Array.from(byId.values()), state.searchQuery);
}

export function selectFavoriteAssets(state: AssetsState): MediaAsset[] {
  const favorites = state.favoriteAssetIds
    .map((id) => resolveAssetById(state, id))
    .filter((asset): asset is MediaAsset => Boolean(asset));
  return filterAssets(favorites, state.searchQuery);
}

export function selectRecentAssets(state: AssetsState): MediaAsset[] {
  const recents = state.recentAssetIds
    .map((id) => resolveAssetById(state, id))
    .filter((asset): asset is MediaAsset => Boolean(asset));
  return filterAssets(recents, state.searchQuery);
}

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set, get) => ({
      assets: mergeEngineAssets([]),
      searchQuery: '',
      previewAssetId: null,
      uploadError: null,
      activeTab: 'library',
      favoriteAssetIds: [],
      recentAssetIds: [],

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setPreviewAssetId: (previewAssetId) => set({ previewAssetId }),
      setActiveTab: (activeTab) => set({ activeTab }),
      clearUploadError: () => set({ uploadError: null }),

      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favoriteAssetIds.includes(id);
          return {
            favoriteAssetIds: exists
              ? state.favoriteAssetIds.filter((assetId) => assetId !== id)
              : [id, ...state.favoriteAssetIds],
          };
        }),

      markRecent: (id) =>
        set((state) => ({
          recentAssetIds: [id, ...state.recentAssetIds.filter((assetId) => assetId !== id)].slice(
            0,
            MAX_RECENT,
          ),
        })),

      addAsset: (input) => {
        const asset: MediaAsset = {
          ...input,
          id: input.id ?? createSafeRandomId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          assets: mergeEngineAssets([asset, ...state.assets.filter((a) => a.id !== asset.id)]),
        }));
        get().markRecent(asset.id);
        return asset;
      },

      removeAsset: (id) => {
        const target = get().assets.find((a) => a.id === id);
        if (!target || target.source === 'builtin') return;
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
          favoriteAssetIds: state.favoriteAssetIds.filter((assetId) => assetId !== id),
          recentAssetIds: state.recentAssetIds.filter((assetId) => assetId !== id),
        }));
      },

      getAsset: (id) => get().assets.find((a) => a.id === id),

      applyAssetToNode: (nodeId, assetId) => {
        const asset = get().getAsset(assetId);
        if (!asset) return;
        get().markRecent(assetId);
        const node = useBuilderV4Store.getState().getNode(nodeId);
        if (!node || node.kind !== 'image') return;
        const resolved = resolveMediaSrc({ assetId: asset.id, src: asset.src }, get().getAsset);
        useBuilderV4Store.getState().updateNodeProps(nodeId, {
          src: resolved.src,
          alt: asset.name,
          assetId: asset.id,
        });
      },

      applyAssetToHeroImageLayer: (assetId) => {
        const asset = get().getAsset(assetId);
        if (!asset) return false;
        get().markRecent(assetId);
        const store = useBuilderV4Store.getState();
        const resolved = resolveMediaSrc({ assetId: asset.id, src: asset.src }, get().getAsset);

        if (isDocumentEmpty(store.document)) {
          store.insertCanvasBlock('hero-form');
        }

        return useBuilderV4Store.getState().applyHeroImageAsset({
          assetId: asset.id,
          src: resolved.src,
          alt: asset.name,
        });
      },

      applyAssetToSelectedImage: (assetId) => {
        return get().applyAssetToHeroImageLayer(assetId);
      },
    }),
    {
      name: 'autohall-builder-v4-assets-v1',
      partialize: (state) => ({
        assets: state.assets.filter((a) => a.source === 'upload'),
        favoriteAssetIds: state.favoriteAssetIds,
        recentAssetIds: state.recentAssetIds,
      }),
      merge: (persisted, current) => {
        const stored = (persisted as Partial<AssetsState>)?.assets ?? [];
        const favoriteAssetIds = (persisted as Partial<AssetsState>)?.favoriteAssetIds ?? [];
        const recentAssetIds = (persisted as Partial<AssetsState>)?.recentAssetIds ?? [];
        return {
          ...current,
          assets: mergeEngineAssets(stored),
          favoriteAssetIds,
          recentAssetIds,
        };
      },
      onRehydrateStorage: () => () => {
        markAssetsStoreRehydrated();
      },
    },
  ),
);
