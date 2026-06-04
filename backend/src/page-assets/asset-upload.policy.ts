import { BadRequestException } from '@nestjs/common';

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'svg',
]);

export const BLOCKED_EXTENSIONS = new Set([
  'php',
  'js',
  'html',
  'htm',
  'exe',
  'sh',
  'bat',
  'cmd',
  'env',
  'sql',
  'json',
  'xml',
  'yaml',
  'yml',
  'ts',
  'tsx',
  'jsx',
  'mjs',
  'cjs',
]);

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;

export type UploadFileLike = {
  originalname: string;
  mimetype: string;
  size: number;
};

export function extractExtension(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const lastDot = base.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === base.length - 1) {
    return '';
  }
  return base.slice(lastDot + 1).toLowerCase();
}

export function validateUploadFile(
  file: UploadFileLike,
  maxBytes: number,
): void {
  if (!file?.originalname?.trim()) {
    throw new BadRequestException({
      success: false,
      message: 'File is required',
      code: 'ASSET_FILE_REQUIRED',
    });
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new BadRequestException({
      success: false,
      message: 'File is empty',
      code: 'ASSET_FILE_EMPTY',
    });
  }

  if (file.size > maxBytes) {
    throw new BadRequestException({
      success: false,
      message: `File exceeds maximum size of ${maxBytes} bytes`,
      code: 'ASSET_FILE_TOO_LARGE',
    });
  }

  const extension = extractExtension(file.originalname);

  if (!extension || BLOCKED_EXTENSIONS.has(extension)) {
    throw new BadRequestException({
      success: false,
      message: 'File type is not allowed',
      code: 'ASSET_FILE_TYPE_FORBIDDEN',
    });
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    throw new BadRequestException({
      success: false,
      message: 'Only image files (jpg, jpeg, png, webp, svg) are allowed',
      code: 'ASSET_FILE_TYPE_NOT_ALLOWED',
    });
  }

  const mime = file.mimetype?.toLowerCase() ?? '';
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new BadRequestException({
      success: false,
      message: 'MIME type is not allowed',
      code: 'ASSET_MIME_NOT_ALLOWED',
    });
  }

  if (extension === 'svg' && file.size > 512_000) {
    throw new BadRequestException({
      success: false,
      message: 'SVG files must be 512 KB or smaller',
      code: 'ASSET_SVG_TOO_LARGE',
    });
  }
}

export function validatePublicAssetMime(mimeType: string): void {
  const mime = mimeType?.toLowerCase() ?? '';
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
    throw new BadRequestException({
      success: false,
      message: 'Asset MIME type is not allowed for public serving',
      code: 'ASSET_MIME_NOT_ALLOWED',
    });
  }
}

export function buildStoredFilename(extension: string, id: string): string {
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(extension) ? extension : 'bin';
  return `${id}.${safeExt}`;
}
