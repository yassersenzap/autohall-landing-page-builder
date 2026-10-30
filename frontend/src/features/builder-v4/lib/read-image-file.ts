const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type ParsedImageFile = {
  /** Temporary ObjectURL for canvas preview — NOT a base64 data URI. */
  src: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  name: string;
};

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Image invalide'));
    img.src = src;
  });
}

/**
 * Reads an image file for canvas preview using a temporary ObjectURL.
 * No base64 data URI is ever produced — the document stays lightweight.
 * Callers that need persistence must upload via FormData (see upload-image-asset.ts).
 */
export async function readImageFile(file: File): Promise<ParsedImageFile> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Seules les images sont acceptées');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image trop volumineuse (max 4 Mo)');
  }

  const src = URL.createObjectURL(file);
  const { width, height } = await loadImageDimensions(src);

  return {
    src,
    width,
    height,
    sizeBytes: file.size,
    mimeType: file.type,
    name: file.name.replace(/\.[^.]+$/, ''),
  };
}
