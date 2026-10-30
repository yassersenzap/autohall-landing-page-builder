import type { MediaAsset } from '../types/assets.types';
import type { ImageNodeProps } from '../types/nodes.types';
import { CHERY_ASSET_ID, PLACEHOLDER_ASSET_ID } from './media-constants';
import type { MediaAssetLookup } from './resolve-media-src';

const ENGINE_ASSET_IDS = new Set<string>([CHERY_ASSET_ID, PLACEHOLDER_ASSET_ID]);

export function isEngineAssetId(assetId?: string): boolean {
  return Boolean(assetId && ENGINE_ASSET_IDS.has(assetId));
}

/** True when the user explicitly assigned media (upload or orphan src), not engine defaults. */
export function isUserHeroMediaAssigned(
  props: Pick<ImageNodeProps, 'src' | 'assetId'>,
  getAsset: MediaAssetLookup,
): boolean {
  if (props.assetId) {
    const asset = getAsset(props.assetId);
    if (asset?.source === 'upload') return true;
    if (isEngineAssetId(props.assetId)) return false;
    return Boolean(props.src?.trim());
  }
  return Boolean(props.src?.trim());
}

export function isUploadAsset(asset: MediaAsset | undefined): boolean {
  return asset?.source === 'upload';
}
