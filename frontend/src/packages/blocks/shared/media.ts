import type { CSSProperties } from 'react';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { num, str } from './props';

export function resolveImageSrc(props: Record<string, unknown>, assetKey = 'imageAssetId', urlKey = 'imageUrl'): string {
  const assetId = str(props, assetKey);
  if (assetId) return assetPublicFileUrl(assetId);
  return str(props, urlKey);
}

export function buildImageStyle(props: Record<string, unknown>): CSSProperties {
  const fit = str(props, 'imageFit', 'cover');
  const zoom = num(props, 'imageZoom', 100);
  const focalX = num(props, 'focalPointX', 50);
  const focalY = num(props, 'focalPointY', 50);
  return {
    objectFit: fit === 'contain' ? 'contain' : 'cover',
    objectPosition: `${focalX}% ${focalY}%`,
    transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
