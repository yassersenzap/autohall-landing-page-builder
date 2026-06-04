import { create } from 'zustand';
import { BUILDER_PALETTE } from '../constants/palette';
import type { BuilderDocumentBlock } from '../types';

function createBlockFromPalette(type: string, sortOrder: number): BuilderDocumentBlock {
  const item = BUILDER_PALETTE.find((p) => p.type === type);
  return {
    id: crypto.randomUUID(),
    type,
    label: item?.label ?? `[Bloc ${type}]`,
    sortOrder,
  };
}

function normalizeSortOrder(blocks: BuilderDocumentBlock[]): BuilderDocumentBlock[] {
  return blocks.map((block, index) => ({ ...block, sortOrder: index }));
}

type BuilderDocumentState = {
  blocks: BuilderDocumentBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;

  addBlock: (type: string, index?: number) => void;
  removeBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlockToIndex: (blockId: string, newIndex: number) => void;
  resetDocument: () => void;
};

export const useBuilderDocumentStore = create<BuilderDocumentState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  hoveredBlockId: null,

  addBlock: (type, index) => {
    const blocks = [...get().blocks];
    const insertAt =
      index === undefined || index < 0 || index > blocks.length ? blocks.length : index;
    const newBlock = createBlockFromPalette(type, insertAt);
    const next = [...blocks];
    next.splice(insertAt, 0, newBlock);
    set({
      blocks: normalizeSortOrder(next),
      selectedBlockId: newBlock.id,
    });
  },

  removeBlock: (blockId) => {
    const blocks = get().blocks.filter((b) => b.id !== blockId);
    const selectedBlockId = get().selectedBlockId;
    set({
      blocks: normalizeSortOrder(blocks),
      selectedBlockId: selectedBlockId === blockId ? null : selectedBlockId,
      hoveredBlockId: get().hoveredBlockId === blockId ? null : get().hoveredBlockId,
    });
  },

  selectBlock: (blockId) => set({ selectedBlockId: blockId }),

  hoverBlock: (blockId) => set({ hoveredBlockId: blockId }),

  reorderBlocks: (activeId, overId) => {
    const blocks = [...get().blocks];
    const oldIndex = blocks.findIndex((b) => b.id === activeId);
    const newIndex = blocks.findIndex((b) => b.id === overId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const [moved] = blocks.splice(oldIndex, 1);
    blocks.splice(newIndex, 0, moved);
    set({ blocks: normalizeSortOrder(blocks) });
  },

  moveBlockToIndex: (blockId, newIndex) => {
    const blocks = [...get().blocks];
    const oldIndex = blocks.findIndex((b) => b.id === blockId);
    if (oldIndex < 0) return;
    const clamped = Math.max(0, Math.min(newIndex, blocks.length - 1));
    const [moved] = blocks.splice(oldIndex, 1);
    blocks.splice(clamped, 0, moved);
    set({ blocks: normalizeSortOrder(blocks) });
  },

  resetDocument: () =>
    set({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
    }),
}));

export function selectActiveBlock(state: BuilderDocumentState) {
  if (!state.selectedBlockId) return null;
  return state.blocks.find((b) => b.id === state.selectedBlockId) ?? null;
}
