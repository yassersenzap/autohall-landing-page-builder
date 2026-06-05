import { getActivePaletteBlocks } from '../registry/block-registry';
import type { BuilderPaletteItem } from '../types';

/** @deprecated Préférer BUILDER_BLOCK_REGISTRY — conservé pour compat DnD. */
export const BUILDER_PALETTE: BuilderPaletteItem[] = getActivePaletteBlocks();

export const PALETTE_DRAG_PREFIX = 'palette:';

export function paletteDragId(type: string): string {
  return `${PALETTE_DRAG_PREFIX}${type}`;
}

export function parsePaletteDragId(id: string): string | null {
  if (!id.startsWith(PALETTE_DRAG_PREFIX)) return null;
  return id.slice(PALETTE_DRAG_PREFIX.length);
}
