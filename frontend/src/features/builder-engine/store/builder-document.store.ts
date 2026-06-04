import { create } from 'zustand';
import { getDefaultBlockProps } from '../constants/default-block-props';
import { getRegistryEntry } from '../registry/block-registry';
import { getActivePaletteBlocks } from '../registry/block-registry';
import type { BuilderDeviceMode } from '../lib/block-design-props';
import { sanitizePropsPatch } from '../lib/sanitize-props-patch';
import type { BuilderDocumentBlock } from '../types';

function createBlockFromType(type: string, sortOrder: number): BuilderDocumentBlock {
  const item = getRegistryEntry(type);
  return {
    id: crypto.randomUUID(),
    type,
    label: item?.label ?? `[Bloc ${type}]`,
    sortOrder,
    propsJson: getDefaultBlockProps(type),
  };
}

function normalizeSortOrder(blocks: BuilderDocumentBlock[]): BuilderDocumentBlock[] {
  return blocks.map((block, index) => ({ ...block, sortOrder: index }));
}

export type PageThemeDraft = {
  primaryColor: string;
  secondaryColor: string;
  mode: 'light' | 'dark';
  fontFamily: string;
  headingScale: 'compact' | 'normal' | 'large';
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  buttonStyle: 'rounded' | 'pill' | 'square';
  seoTitle: string;
  seoDescription: string;
};

const DEFAULT_PAGE_THEME: PageThemeDraft = {
  primaryColor: '#b91c1c',
  secondaryColor: '#18181b',
  mode: 'dark',
  fontFamily: 'Inter',
  headingScale: 'normal',
  sectionSpacing: 'normal',
  buttonStyle: 'pill',
  seoTitle: '',
  seoDescription: '',
};

type BuilderDocumentState = {
  blocks: BuilderDocumentBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  deviceMode: BuilderDeviceMode;
  pageTheme: PageThemeDraft;
  themeDirty: boolean;

  addBlock: (type: string, index?: number) => void;
  addSection: (blockTypes: string[]) => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlockToIndex: (blockId: string, newIndex: number) => void;
  updateBlockProps: (blockId: string, patch: Record<string, unknown>) => void;
  setInitialBlocks: (blocks: BuilderDocumentBlock[]) => void;
  setDeviceMode: (mode: BuilderDeviceMode) => void;
  setPageTheme: (patch: Partial<PageThemeDraft>) => void;
  setInitialPageTheme: (theme: PageThemeDraft) => void;
  buildThemeJsonPayload: () => Record<string, unknown>;
  resetDocument: () => void;
};

export const useBuilderDocumentStore = create<BuilderDocumentState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  hoveredBlockId: null,
  deviceMode: 'desktop',
  pageTheme: { ...DEFAULT_PAGE_THEME },
  themeDirty: false,

  addBlock: (type, index) => {
    const activeTypes = new Set(getActivePaletteBlocks().map((b) => b.type));
    if (!activeTypes.has(type)) return;

    const blocks = [...get().blocks];
    const insertAt =
      index === undefined || index < 0 || index > blocks.length ? blocks.length : index;
    const newBlock = createBlockFromType(type, insertAt);
    const next = [...blocks];
    next.splice(insertAt, 0, newBlock);
    set({
      blocks: normalizeSortOrder(next),
      selectedBlockId: newBlock.id,
    });
  },

  addSection: (blockTypes) => {
    const activeTypes = new Set(getActivePaletteBlocks().map((b) => b.type));
    const blocks = [...get().blocks];
    let insertAt = blocks.length;
    let firstId: string | null = null;

    for (const type of blockTypes) {
      if (!activeTypes.has(type)) continue;
      const newBlock = createBlockFromType(type, insertAt);
      blocks.splice(insertAt, 0, newBlock);
      if (!firstId) firstId = newBlock.id;
      insertAt += 1;
    }

    set({
      blocks: normalizeSortOrder(blocks),
      selectedBlockId: firstId,
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

  duplicateBlock: (blockId) => {
    const blocks = get().blocks;
    const sourceIndex = blocks.findIndex((b) => b.id === blockId);
    if (sourceIndex < 0) return;

    const source = blocks[sourceIndex];
    const copy: BuilderDocumentBlock = {
      ...source,
      id: crypto.randomUUID(),
      propsJson: JSON.parse(JSON.stringify(source.propsJson)) as Record<string, unknown>,
    };

    const next = [...blocks];
    next.splice(sourceIndex + 1, 0, copy);
    set({
      blocks: normalizeSortOrder(next),
      selectedBlockId: copy.id,
      hoveredBlockId: copy.id,
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

  updateBlockProps: (blockId, patch) => {
    const safe = sanitizePropsPatch(patch);
    if (Object.keys(safe).length === 0) return;

    set({
      blocks: get().blocks.map((block) => {
        if (block.id !== blockId) return block;
        const merged = { ...block.propsJson, ...safe };
        if (safe.design && typeof safe.design === 'object' && !Array.isArray(safe.design)) {
          const prev =
            block.propsJson.design &&
            typeof block.propsJson.design === 'object' &&
            !Array.isArray(block.propsJson.design)
              ? (block.propsJson.design as Record<string, unknown>)
              : {};
          merged.design = { ...prev, ...(safe.design as Record<string, unknown>) };
        }
        return { ...block, propsJson: merged };
      }),
    });
  },

  setInitialBlocks: (blocks) => {
    const ordered = normalizeSortOrder([...blocks]);
    set({
      blocks: ordered,
      selectedBlockId: ordered[0]?.id ?? null,
      hoveredBlockId: null,
    });
  },

  setDeviceMode: (mode) => set({ deviceMode: mode }),

  setPageTheme: (patch) =>
    set((state) => ({
      pageTheme: { ...state.pageTheme, ...patch },
      themeDirty: true,
    })),

  setInitialPageTheme: (theme) =>
    set({ pageTheme: theme, themeDirty: false }),

  buildThemeJsonPayload: () => {
    const { pageTheme } = get();
    return {
      page: {
        theme: {
          primaryColor: pageTheme.primaryColor,
          secondaryColor: pageTheme.secondaryColor,
          mode: pageTheme.mode,
          fontFamily: pageTheme.fontFamily,
          headingScale: pageTheme.headingScale,
          sectionSpacing: pageTheme.sectionSpacing,
          buttonStyle: pageTheme.buttonStyle,
        },
        seo: {
          title: pageTheme.seoTitle,
          description: pageTheme.seoDescription,
        },
      },
    };
  },

  resetDocument: () =>
    set({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      deviceMode: 'desktop',
      pageTheme: { ...DEFAULT_PAGE_THEME },
      themeDirty: false,
    }),
}));

export function selectActiveBlock(state: BuilderDocumentState) {
  if (!state.selectedBlockId) return null;
  return state.blocks.find((b) => b.id === state.selectedBlockId) ?? null;
}
