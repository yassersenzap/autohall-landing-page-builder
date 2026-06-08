import { asPropString } from '@/features/builder-engine/lib/block-props';
import type { MediaFieldValue } from './MediaFieldControl';

export function mediaValueFromProps(propsJson: Record<string, unknown>): MediaFieldValue {
  return {
    imageAssetId: asPropString(propsJson.imageAssetId),
    imageUrl: asPropString(propsJson.imageUrl),
    alt: asPropString(propsJson.alt),
    objectFit: (asPropString(propsJson.objectFit) as 'cover' | 'contain') || 'cover',
  };
}

export function patchMediaProps(
  patch: (p: Record<string, unknown>) => void,
  next: MediaFieldValue,
): void {
  patch({
    imageAssetId: next.imageAssetId ?? '',
    imageUrl: next.imageUrl ?? '',
    alt: next.alt ?? '',
    objectFit: next.objectFit ?? 'cover',
  });
}
