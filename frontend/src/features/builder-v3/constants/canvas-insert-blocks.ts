import { getCatalogItem } from '@/features/builder-engine/foundation/builder-catalog';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';

/** Curated blocks for quick insert from the canvas toolbar. */
export const CANVAS_INSERT_BLOCK_TYPES = [
  'core_campaign_form_landing',
  'footer_legal',
  'faq',
] as const;

export type CanvasInsertBlockType = (typeof CANVAS_INSERT_BLOCK_TYPES)[number];

export function getCanvasInsertBlockOptions(): Array<{ type: CanvasInsertBlockType; label: string }> {
  return CANVAS_INSERT_BLOCK_TYPES.map((type) => {
    const catalog = getCatalogItem(type);
    const registry = getRegistryEntry(type);
    return {
      type,
      label: catalog?.sidebarLabel ?? registry?.label ?? type,
    };
  });
}
