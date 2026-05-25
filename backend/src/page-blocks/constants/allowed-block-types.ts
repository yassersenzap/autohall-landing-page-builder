export const ALLOWED_BLOCK_TYPES = [
  'hero',
  'text',
  'image',
  'button',
] as const;

export type AllowedBlockType = (typeof ALLOWED_BLOCK_TYPES)[number];
