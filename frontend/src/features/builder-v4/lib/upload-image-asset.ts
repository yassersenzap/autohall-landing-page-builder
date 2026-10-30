import { readImageFile } from './read-image-file';
import { uploadPageVersionAsset, assetPublicFileUrl } from '@/lib/page-assets-api';
import { useBuilderV4Store } from '../store/document.store';
import { useAssetsStore } from '../store/assets.store';

export type UploadedImageResult = {
  assetId: string;
  src: string;
  alt: string;
  name: string;
  serverUrl?: string;
};

/**
 * Uploads an image file:
 * - If pageVersionId is set: uploads to server → stores server URL as src (cross-browser persistent)
 * - Otherwise (true sandbox, no document to attach the asset to): reads as base64 → stores in memory
 *
 * When pageVersionId IS set but the server upload fails, this throws rather than
 * silently degrading to base64 — embedding a multi-MB data URI into `node.props`
 * bloats the document JSON past the save endpoint's body-size limit, causing every
 * subsequent save to fail with no indication of why. Callers should show an upload
 * error and let the user retry instead of ending up with a poisoned document.
 */
export async function uploadOrEmbedImage(file: File): Promise<UploadedImageResult> {
  const parsed = await readImageFile(file);
  const pageVersionId = useBuilderV4Store.getState().pageVersionId;

  if (pageVersionId) {
    const serverAsset = await uploadPageVersionAsset(pageVersionId, file);
    const serverUrl = assetPublicFileUrl(serverAsset.id);

    // Store in asset store with server URL so canvas can resolve it
    const asset = useAssetsStore.getState().addAsset({
      id: serverAsset.id,
      name: parsed.name,
      src: serverUrl,
      mimeType: parsed.mimeType,
      width: parsed.width,
      height: parsed.height,
      sizeBytes: parsed.sizeBytes,
      source: 'upload',
      tags: ['upload', 'server'],
    });

    return {
      assetId: asset.id,
      src: serverUrl,
      alt: parsed.name,
      name: parsed.name,
      serverUrl,
    };
  }

  // True sandbox mode — no document to persist a server asset against.
  // parsed.src is a temporary ObjectURL (blob:) used only for canvas preview.
  // sanitizeDocumentForSave strips blob:/data: prefixes before any save, so the
  // persisted document never embeds the binary — only the assetId reference does.
  const asset = useAssetsStore.getState().addAsset({
    name: parsed.name,
    src: parsed.src,
    mimeType: parsed.mimeType,
    width: parsed.width,
    height: parsed.height,
    sizeBytes: parsed.sizeBytes,
    source: 'upload',
    tags: ['upload'],
  });

  return {
    assetId: asset.id,
    src: parsed.src,
    alt: parsed.name,
    name: parsed.name,
  };
}
