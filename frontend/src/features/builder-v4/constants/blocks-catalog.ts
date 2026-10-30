import {
  BLOCK_REGISTRY,
  getBlocksByCategory,
  type V4BlockDefinition,
} from '@/packages/blocks/registry';

export type BlockCatalogEntry = {
  id: string;
  label: string;
  description?: string;
  blockId: string;
  available: true;
  badge?: string;
};

export type BlockCategory = {
  id: string;
  label: string;
  blocks: BlockCatalogEntry[];
};

const CATEGORY_LABELS: Record<string, string> = {
  hero: 'Hero',
  content: 'Contenu',
  media: 'Média',
  conversion: 'Conversion',
  business: 'Business',
};

function toCatalogEntry(def: V4BlockDefinition): BlockCatalogEntry {
  return {
    id: def.type,
    label: def.label,
    description: def.description,
    blockId: def.type,
    available: true,
  };
}

const CATEGORIES = ['hero', 'content', 'media', 'conversion', 'business'] as const;

/** Full product catalog — every block insertable. */
export const BLOCKS_CATALOG: BlockCategory[] = CATEGORIES.map((categoryId) => ({
  id: categoryId,
  label: CATEGORY_LABELS[categoryId] ?? categoryId,
  blocks: getBlocksByCategory(categoryId).map(toCatalogEntry),
})).filter((cat) => cat.blocks.length > 0);

export const POPULAR_BLOCKS: BlockCatalogEntry[] = BLOCK_REGISTRY.slice(0, 1).map(toCatalogEntry);
