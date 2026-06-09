import { getRegistryEntry } from '../registry/block-registry';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import type { BuilderDocumentBlock } from '../types';

export function apiBlockToBuilderBlock(block: EditorPageBlock): BuilderDocumentBlock {
  const type = block.blockType.toLowerCase();
  const registryEntry = getRegistryEntry(type);

  return {
    id: block.id,
    type,
    label: registryEntry?.label ?? `[Bloc ${type}]`,
    sortOrder: block.sortOrder,
    propsJson:
      block.propsJson && typeof block.propsJson === 'object' && !Array.isArray(block.propsJson)
        ? { ...block.propsJson }
        : {},
  };
}

export function apiBlocksToBuilderBlocks(blocks: EditorPageBlock[]): BuilderDocumentBlock[] {
  return [...blocks]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(apiBlockToBuilderBlock);
}
