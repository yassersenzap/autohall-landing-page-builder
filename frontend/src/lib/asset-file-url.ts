import { getAccessToken } from './auth-storage';
import { assetFileAbsoluteUrl } from './page-assets-api';

const blobUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

/**
 * Charge un asset protégé JWT et retourne une URL blob pour <img src>.
 * Ne jamais stocker le blob en base64 dans layout_json.
 */
export async function fetchAssetBlobUrl(assetId: string): Promise<string> {
  const cached = blobUrlCache.get(assetId);
  if (cached) return cached;

  const pending = inflight.get(assetId);
  if (pending) return pending;

  const promise = (async () => {
    const token = getAccessToken();
    const response = await fetch(assetFileAbsoluteUrl(assetId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Asset file request failed (${response.status})`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(assetId, url);
    return url;
  })();

  inflight.set(assetId, promise);

  try {
    return await promise;
  } finally {
    inflight.delete(assetId);
  }
}

export function revokeAssetBlobUrl(assetId: string): void {
  const url = blobUrlCache.get(assetId);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(assetId);
  }
}
