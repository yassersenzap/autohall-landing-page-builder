import { getBlockLabel } from '@/features/landing/landing-block-catalog';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { BUILDER_PALETTE } from '../constants/palette';
import type { BuilderDocumentBlock } from '../types';

export function apiBlockToBuilderBlock(block: EditorPageBlock): BuilderDocumentBlock {
  const type = block.blockType.toLowerCase();
  const paletteItem = BUILDER_PALETTE.find((p) => p.type === type);

  return {
    id: block.id,
    type,
    label: paletteItem?.label ?? getBlockLabel(block.blockType),
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
