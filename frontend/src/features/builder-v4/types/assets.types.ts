export type AssetSource = 'builtin' | 'upload' | 'url';

export type MediaAsset = {
  id: string;
  name: string;
  src: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  source: AssetSource;
  tags: string[];
  createdAt: string;
};

export const ASSET_DRAG_MIME = 'application/x-autohall-asset-id';
