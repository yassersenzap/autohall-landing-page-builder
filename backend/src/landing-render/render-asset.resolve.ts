import type { LandingRenderContext } from './render-asset.types';

function propString(
  props: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function isBlockedImageUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('javascript:')) return true;
  if (lower.startsWith('data:')) return true;
  if (lower.startsWith('blob:')) return true;
  if (lower.includes('/api/assets/')) return true;
  if (/\/api\/assets\//i.test(url)) return true;
  return false;
}

/**
 * Résout la source image Hero : imageAssetId (via map) prioritaire, puis imageUrl externe.
 */
/** Résolution image uploadée ou URL externe (Hero, section image, etc.). */
export function resolveHeroImageSrc(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string | null {
  const assetId = propString(props, 'imageAssetId');
  if (assetId && context?.assetMap[assetId]) {
    const entry = context.assetMap[assetId];
    return context.mode === 'export' ? entry.exportPath : entry.previewUrl;
  }

  const imageUrl = propString(props, 'imageUrl', 'src', 'url');
  if (!imageUrl) {
    return null;
  }

  if (isBlockedImageUrl(imageUrl)) {
    return null;
  }

  return imageUrl;
}

export function buildPublicAssetFileUrl(
  apiBaseUrl: string,
  assetId: string,
): string {
  const base = apiBaseUrl.replace(/\/$/, '');
  return `${base}/api/public/assets/${assetId}/file`;
}
