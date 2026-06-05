import type { BuilderDocumentBlock } from '../types';

/**
 * Garantit que selected/hovered ne pointent jamais vers un bloc absent.
 */
export function sanitizeBlockSelection(
  blocks: BuilderDocumentBlock[],
  selectedBlockId: string | null,
  hoveredBlockId: string | null,
): { selectedBlockId: string | null; hoveredBlockId: string | null } {
  const ids = new Set(blocks.map((block) => block.id));

  return {
    selectedBlockId:
      selectedBlockId && ids.has(selectedBlockId) ? selectedBlockId : null,
    hoveredBlockId:
      hoveredBlockId && ids.has(hoveredBlockId) ? hoveredBlockId : null,
  };
}

export function findBlockById(
  blocks: BuilderDocumentBlock[],
  blockId: string,
): BuilderDocumentBlock | undefined {
  return blocks.find((block) => block.id === blockId);
}
