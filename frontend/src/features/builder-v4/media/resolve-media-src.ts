import type { MediaAsset } from '../types/assets.types';
import type { ImageNodeProps } from '../types/nodes.types';
import { HERO_FIXTURE_PATHS } from './media-constants';

export type MediaResolveStatus = 'resolved' | 'orphan' | 'missing';

export type MediaResolveResult = {
  src: string;
  status: MediaResolveStatus;
};

export type MediaAssetLookup = (assetId: string) => MediaAsset | undefined;

/**
 * Single resolver: STORE assetId → src for render, preview, export (future).
 * Never returns empty string — missing/orphan → placeholder.webp.
 */
export function resolveMediaSrc(
  props: Pick<ImageNodeProps, 'src' | 'assetId'>,
  getAsset: MediaAssetLookup,
): MediaResolveResult {
  const placeholder = HERO_FIXTURE_PATHS.placeholder;

  if (props.assetId) {
    const asset = getAsset(props.assetId);
    if (asset?.src) {
      return { src: asset.src, status: 'resolved' };
    }
    if (props.src?.trim()) {
      return { src: props.src, status: 'orphan' };
    }
    return { src: placeholder, status: 'missing' };
  }

  if (props.src?.trim()) {
    return { src: props.src, status: 'resolved' };
  }

  return { src: placeholder, status: 'missing' };
}

/** User-owned src only — never falls back to engine placeholder. */
export function resolveUserMediaSrc(
  props: Pick<ImageNodeProps, 'src' | 'assetId'>,
  getAsset: MediaAssetLookup,
): string {
  if (props.assetId) {
    const asset = getAsset(props.assetId);
    if (asset?.src) return asset.src;
  }
  return props.src?.trim() ?? '';
}
