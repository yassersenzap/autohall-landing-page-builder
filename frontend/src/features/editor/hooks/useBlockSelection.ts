import { useCallback, useMemo, useState } from 'react';
import type { EditorPageBlock } from '../types/editor.types';

export function useBlockSelection(blocks: EditorPageBlock[]) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const ensureSelectionAfterLoad = useCallback((nextBlocks: EditorPageBlock[]) => {
    if (nextBlocks.length === 0) {
      setSelectedBlockId(null);
      return;
    }

    setSelectedBlockId((current) => {
      if (current && nextBlocks.some((block) => block.id === current)) {
        return current;
      }
      return nextBlocks[0].id;
    });
  }, []);

  const selectBlock = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
  }, []);

  return {
    selectedBlockId,
    selectedBlock,
    selectBlock,
    ensureSelectionAfterLoad,
  };
}
