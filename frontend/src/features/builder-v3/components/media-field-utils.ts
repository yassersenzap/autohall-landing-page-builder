import { asPropString } from '@/features/builder-engine/lib/block-props';
import { sanitizeMediaFieldPatch, sanitizePersistedMediaUrl } from '../lib/media-url-safety';
import type { MediaFieldValue } from './MediaFieldControl';

export function mediaValueFromProps(propsJson: Record<string, unknown>): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson.imageAssetId),
    imageUrl: sanitizePersistedMediaUrl(asPropString(propsJson.imageUrl)),
    alt: asPropString(propsJson.alt),
    objectFit: (asPropString(propsJson.objectFit) as 'cover' | 'contain') || 'cover',
  };
}

export function mediaValueFromKeys(
  propsJson: Record<string, unknown>,
  assetKey: string,
  urlKey: string,
  altKey?: string,
): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson[assetKey]),
    imageUrl: sanitizePersistedMediaUrl(asPropString(propsJson[urlKey])),
    alt: altKey ? asPropString(propsJson[altKey]) : undefined,
  };
}

export function buildMediaValuePatch(
  assetKey: string,
  urlKey: string,
  altKey: string | undefined,
  next: MediaFieldValue,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    [assetKey]: next.imageAssetId ?? '',
    [urlKey]: sanitizePersistedMediaUrl(next.imageUrl),
  };
  if (altKey && next.alt !== undefined) {
    patch[altKey] = next.alt;
  }
  return sanitizeMediaFieldPatch(patch);
}

export function patchMediaProps(
  patch: (p: Record<string, unknown>) => void,
  next: MediaFieldValue,
): void {
  patch(
    sanitizeMediaFieldPatch({
      imageAssetId: next.imageAssetId ?? '',
      imageUrl: sanitizePersistedMediaUrl(next.imageUrl),
      alt: next.alt ?? '',
      objectFit: next.objectFit ?? 'cover',
    }),
  );
}

export function clearMediaValuePatch(
  assetKey: string,
  urlKey: string,
): Record<string, unknown> {
  return {
    [assetKey]: '',
    [urlKey]: '',
  };
}
