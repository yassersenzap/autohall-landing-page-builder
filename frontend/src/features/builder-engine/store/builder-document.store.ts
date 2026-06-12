import { createSafeRandomId } from '@/lib/create-safe-random-id';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { getDefaultBlockProps } from '../constants/default-block-props';
import { getRegistryEntry } from '../registry/block-registry';
import { getActivePaletteBlocks } from '../registry/block-registry';
import type { BuilderDeviceMode } from '../lib/block-design-props';
import { sanitizePropsPatch } from '../lib/sanitize-props-patch';
import type { BuilderDocumentBlock } from '../types';
import { findBlockById, sanitizeBlockSelection } from './block-selection';
import {
  materializeCampaignTemplate,
  selectFirstMeaningfulBlockId,
} from '../foundation/apply-campaign-template';
import { getCampaignPageTemplateById } from '../foundation/campaign-page-templates';
import { buildPageThemeFromTemplateBrand } from '@/features/builder/brand-presets/brand-theme-presets';
import { withStudioAppliedVariantId } from '@/features/builder/block-variants/studio-block-metadata';
import {
  applyBlockVariantSafely,
  mergeVariantPatchIntoProps,
} from '@/features/builder/block-variants';
import {
  appendHistoryCheckpoint,
  beginPropsEditSession,
  computeRedo,
  computeUndo,
  createBuilderDocumentCheckpoint,
  emptyDocumentHistoryState,
  resetPropsEditSession,
  runWithHistoryApply,
  shouldSkipHistoryPush,
  type BuilderDocumentCheckpoint,
  type HistoryCheckpointReason,
} from '../history';

const PERSIST_STORAGE_PREFIX = 'autohall-builder-storage:';
const LEGACY_STORAGE_PREFIX = 'autohall-builder-v3:';

export const BUILDER_PERSIST_NAME = 'autohall-builder-storage';

let persistPageVersionId = '';

export function setBuilderPersistPageVersionId(pageVersionId: string) {
  persistPageVersionId = pageVersionId;
}

export function getBuilderPersistPageVersionId() {
  return persistPageVersionId;
}

const pageScopedStorage: StateStorage = {
  getItem: () => {
    if (!persistPageVersionId) return null;
    const key = `${PERSIST_STORAGE_PREFIX}${persistPageVersionId}`;
    const legacyKey = `${LEGACY_STORAGE_PREFIX}${persistPageVersionId}`;
    return localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
  },
  setItem: (_name, value) => {
    if (!persistPageVersionId) return;
    localStorage.setItem(`${PERSIST_STORAGE_PREFIX}${persistPageVersionId}`, value);
  },
  removeItem: () => {
    if (!persistPageVersionId) return;
    localStorage.removeItem(`${PERSIST_STORAGE_PREFIX}${persistPageVersionId}`);
  },
};

function createBlockFromType(type: string, sortOrder: number): BuilderDocumentBlock {
  const item = getRegistryEntry(type);
  return {
    id: createSafeRandomId(),
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
  headingFont: string;
  bodyFont: string;
  headingScale: 'compact' | 'normal' | 'large';
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  buttonStyle: 'rounded' | 'pill' | 'square';
  seoTitle: string;
  seoDescription: string;
};

export type PageSettingsDraft = {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  ogImageAssetId?: string;
  faviconUrl: string;
  faviconAssetId?: string;
};

export const DEFAULT_PAGE_SETTINGS: PageSettingsDraft = {
  metaTitle: '',
  metaDescription: '',
  ogImageUrl: '',
  ogImageAssetId: '',
  faviconUrl: '',
  faviconAssetId: '',
};

const DEFAULT_PAGE_THEME: PageThemeDraft = {
  primaryColor: '#b91c1c',
  secondaryColor: '#18181b',
  mode: 'dark',
  fontFamily: 'Inter',
  headingFont: 'Inter',
  bodyFont: 'Roboto',
  headingScale: 'normal',
  sectionSpacing: 'normal',
  buttonStyle: 'pill',
  seoTitle: '',
  seoDescription: '',
};

function resolvePersistedMediaUrl(assetId?: string, url?: string): string {
  const normalizedAssetId = assetId?.trim();
  if (normalizedAssetId) {
    return assetPublicFileUrl(normalizedAssetId);
  }
  return url?.trim() ?? '';
}

type BuilderDocumentState = {
  blocks: BuilderDocumentBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  deviceMode: BuilderDeviceMode;
  pageTheme: PageThemeDraft;
  pageSettings: PageSettingsDraft;
  themeDirty: boolean;
  /** Bumped on successful save — used to sync preview without stale API reads. */
  documentRevision: number;
  lastSavedAt: number;
  /** Studio-only undo stacks — not persisted or exported. */
  historyPast: BuilderDocumentCheckpoint[];
  historyFuture: BuilderDocumentCheckpoint[];

  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistoryCheckpoint: (reason?: HistoryCheckpointReason) => void;
  clearHistory: () => void;
  undo: () => boolean;
  redo: () => boolean;

  addBlock: (type: string, index?: number) => void;
  /** Insert a block at a specific index (alias for addBlock with index). */
  insertBlockAt: (type: string, index: number) => void;
  addSection: (blockTypes: string[]) => void;
  removeBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlockToIndex: (blockId: string, newIndex: number) => void;
  moveBlockUp: (blockId: string) => void;
  moveBlockDown: (blockId: string) => void;
  updateBlockProps: (blockId: string, patch: Record<string, unknown>) => void;
  applyBlockVariant: (blockId: string, variantId: string) => boolean;
  setInitialBlocks: (blocks: BuilderDocumentBlock[]) => void;
  setDeviceMode: (mode: BuilderDeviceMode) => void;
  setPageTheme: (patch: Partial<PageThemeDraft>) => void;
  setPageSettings: (patch: Partial<PageSettingsDraft>) => void;
  setInitialPageTheme: (theme: PageThemeDraft) => void;
  setInitialPageSettings: (settings: PageSettingsDraft) => void;
  restoreLocalDraft: (payload: {
    blocks: BuilderDocumentBlock[];
    pageTheme: PageThemeDraft;
    pageSettings?: PageSettingsDraft;
    themeDirty: boolean;
    selectedBlockId: string | null;
  }) => void;
  applyServerSnapshot: (payload: {
    blocks: BuilderDocumentBlock[];
    pageTheme: PageThemeDraft;
    pageSettings: PageSettingsDraft;
  }) => void;
  markDocumentSaved: () => void;
  buildThemeJsonPayload: () => Record<string, unknown>;
  applyPageStarter: (blockTypes: string[], mode?: 'replace' | 'append') => void;
  applyCampaignTemplate: (templateId: string) => void;
  resetDocument: () => void;
};

function snapshotFromState(state: BuilderDocumentState): BuilderDocumentCheckpoint {
  return createBuilderDocumentCheckpoint({
    blocks: state.blocks,
    selectedBlockId: state.selectedBlockId,
    pageTheme: state.pageTheme,
    pageSettings: state.pageSettings,
    themeDirty: state.themeDirty,
  });
}

function checkpointToDocumentPatch(
  checkpoint: BuilderDocumentCheckpoint,
): Pick<
  BuilderDocumentState,
  'blocks' | 'selectedBlockId' | 'pageTheme' | 'pageSettings' | 'themeDirty'
> {
  return {
    blocks: checkpoint.blocks,
    selectedBlockId: checkpoint.selectedBlockId,
    pageTheme: { ...checkpoint.pageTheme },
    pageSettings: { ...checkpoint.pageSettings },
    themeDirty: checkpoint.themeDirty,
  };
}

function withHistoryBeforeMutation(
  get: () => BuilderDocumentState,
  reason: HistoryCheckpointReason,
): Pick<BuilderDocumentState, 'historyPast' | 'historyFuture'> | null {
  if (shouldSkipHistoryPush()) return null;
  const checkpoint = createBuilderDocumentCheckpoint({
    blocks: get().blocks,
    selectedBlockId: get().selectedBlockId,
    pageTheme: get().pageTheme,
    pageSettings: get().pageSettings,
    themeDirty: get().themeDirty,
    reason,
  });
  return {
    historyPast: appendHistoryCheckpoint(get().historyPast, checkpoint),
    historyFuture: [],
  };
}

export const useBuilderDocumentStore = create<BuilderDocumentState>()(
  persist(
    (set, get) => ({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      deviceMode: 'desktop',
      pageTheme: { ...DEFAULT_PAGE_THEME },
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
      themeDirty: false,
      documentRevision: 0,
      lastSavedAt: 0,
      historyPast: [],
      historyFuture: [],

      canUndo: () => get().historyPast.length > 0,
      canRedo: () => get().historyFuture.length > 0,

      pushHistoryCheckpoint: (reason = 'manual') => {
        if (shouldSkipHistoryPush()) return;
        const checkpoint = createBuilderDocumentCheckpoint({
          blocks: get().blocks,
          selectedBlockId: get().selectedBlockId,
          pageTheme: get().pageTheme,
          pageSettings: get().pageSettings,
          themeDirty: get().themeDirty,
          reason,
        });
        set({
          historyPast: appendHistoryCheckpoint(get().historyPast, checkpoint),
          historyFuture: [],
        });
      },

      clearHistory: () => {
        resetPropsEditSession();
        set(emptyDocumentHistoryState());
      },

      undo: () => {
        const state = get();
        const result = computeUndo(
          { past: state.historyPast, future: state.historyFuture },
          snapshotFromState(state),
        );
        if (!result) return false;

        runWithHistoryApply(() => {
          resetPropsEditSession();
          set({
            ...checkpointToDocumentPatch(result.snapshot),
            historyPast: result.past,
            historyFuture: result.future,
            themeDirty: true,
            documentRevision: state.documentRevision + 1,
          });
        });
        return true;
      },

      redo: () => {
        const state = get();
        const result = computeRedo(
          { past: state.historyPast, future: state.historyFuture },
          snapshotFromState(state),
        );
        if (!result) return false;

        runWithHistoryApply(() => {
          resetPropsEditSession();
          set({
            ...checkpointToDocumentPatch(result.snapshot),
            historyPast: result.past,
            historyFuture: result.future,
            themeDirty: true,
            documentRevision: state.documentRevision + 1,
          });
        });
        return true;
      },

      addBlock: (type, index) => {
        const activeTypes = new Set(getActivePaletteBlocks().map((b) => b.type));
        if (!activeTypes.has(type)) return;

        const blocks = [...get().blocks];
        const insertAt =
          index === undefined || index < 0 || index > blocks.length ? blocks.length : index;
        const newBlock = createBlockFromType(type, insertAt);
        const next = [...blocks];
        next.splice(insertAt, 0, newBlock);
        const history = withHistoryBeforeMutation(get, 'add_block');
        set({
          blocks: normalizeSortOrder(next),
          selectedBlockId: newBlock.id,
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      insertBlockAt: (type, index) => {
        get().addBlock(type, index);
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

        const history = withHistoryBeforeMutation(get, 'add_block');
        set({
          blocks: normalizeSortOrder(blocks),
          selectedBlockId: firstId,
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      removeBlock: (blockId) => {
        const current = get().blocks;
        if (!findBlockById(current, blockId)) return;

        const blocks = normalizeSortOrder(current.filter((b) => b.id !== blockId));
        const selection = sanitizeBlockSelection(
          blocks,
          get().selectedBlockId,
          get().hoveredBlockId,
        );

        const history = withHistoryBeforeMutation(get, 'delete_block');
        set({
          blocks,
          themeDirty: true,
          ...selection,
          ...(history ?? {}),
        });
      },

      deleteBlock: (blockId) => {
        get().removeBlock(blockId);
      },

      duplicateBlock: (blockId) => {
        const blocks = get().blocks;
        const sourceIndex = blocks.findIndex((b) => b.id === blockId);
        if (sourceIndex < 0) return;

        const source = blocks[sourceIndex];
        const copy: BuilderDocumentBlock = {
          ...source,
          id: createSafeRandomId(),
          propsJson: JSON.parse(JSON.stringify(source.propsJson)) as Record<string, unknown>,
        };

        const next = [...blocks];
        next.splice(sourceIndex + 1, 0, copy);
        const history = withHistoryBeforeMutation(get, 'duplicate_block');
        set({
          blocks: normalizeSortOrder(next),
          selectedBlockId: copy.id,
          hoveredBlockId: copy.id,
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      selectBlock: (blockId) => {
        if (blockId === null) {
          set({ selectedBlockId: null });
          return;
        }
        const exists = findBlockById(get().blocks, blockId);
        set({ selectedBlockId: exists ? blockId : null });
      },

      hoverBlock: (blockId) => {
        if (blockId === null) {
          set({ hoveredBlockId: null });
          return;
        }
        const exists = findBlockById(get().blocks, blockId);
        set({ hoveredBlockId: exists ? blockId : null });
      },

      reorderBlocks: (activeId, overId) => {
        const blocks = [...get().blocks];
        const oldIndex = blocks.findIndex((b) => b.id === activeId);
        const newIndex = blocks.findIndex((b) => b.id === overId);
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

        const [moved] = blocks.splice(oldIndex, 1);
        blocks.splice(newIndex, 0, moved);
        const history = withHistoryBeforeMutation(get, 'reorder_blocks');
        set({
          blocks: normalizeSortOrder(blocks),
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      moveBlockToIndex: (blockId, newIndex) => {
        const blocks = [...get().blocks];
        const oldIndex = blocks.findIndex((b) => b.id === blockId);
        if (oldIndex < 0) return;
        const clamped = Math.max(0, Math.min(newIndex, blocks.length - 1));
        if (oldIndex === clamped) return;
        const [moved] = blocks.splice(oldIndex, 1);
        blocks.splice(clamped, 0, moved);
        const history = withHistoryBeforeMutation(get, 'move_block');
        set({
          blocks: normalizeSortOrder(blocks),
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      moveBlockUp: (blockId) => {
        const index = get().blocks.findIndex((b) => b.id === blockId);
        if (index <= 0) return;
        get().moveBlockToIndex(blockId, index - 1);
      },

      moveBlockDown: (blockId) => {
        const blocks = get().blocks;
        const index = blocks.findIndex((b) => b.id === blockId);
        if (index < 0 || index >= blocks.length - 1) return;
        get().moveBlockToIndex(blockId, index + 1);
      },

      updateBlockProps: (blockId, patch) => {
        const block = findBlockById(get().blocks, blockId);
        if (!block) return;

        const safe = sanitizePropsPatch(patch, block.type, block.propsJson);
        if (Object.keys(safe).length === 0) return;

        beginPropsEditSession((reason) => {
          const history = withHistoryBeforeMutation(get, reason);
          if (history) set(history);
        });

        let changed = false;
        const blocks = get().blocks.map((block) => {
          if (block.id !== blockId) return block;
          changed = true;
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
          if (safe.formConfig && typeof safe.formConfig === 'object' && !Array.isArray(safe.formConfig)) {
            const prev =
              block.propsJson.formConfig &&
              typeof block.propsJson.formConfig === 'object' &&
              !Array.isArray(block.propsJson.formConfig)
                ? (block.propsJson.formConfig as Record<string, unknown>)
                : {};
            merged.formConfig = { ...prev, ...(safe.formConfig as Record<string, unknown>) };
          }
          if (safe.sectionStyle && typeof safe.sectionStyle === 'object' && !Array.isArray(safe.sectionStyle)) {
            const prev =
              block.propsJson.sectionStyle &&
              typeof block.propsJson.sectionStyle === 'object' &&
              !Array.isArray(block.propsJson.sectionStyle)
                ? (block.propsJson.sectionStyle as Record<string, unknown>)
                : {};
            merged.sectionStyle = { ...prev, ...(safe.sectionStyle as Record<string, unknown>) };
          }
          if (safe.blockVisual && typeof safe.blockVisual === 'object' && !Array.isArray(safe.blockVisual)) {
            const prev =
              block.propsJson.blockVisual &&
              typeof block.propsJson.blockVisual === 'object' &&
              !Array.isArray(block.propsJson.blockVisual)
                ? (block.propsJson.blockVisual as Record<string, unknown>)
                : {};
            merged.blockVisual = { ...prev, ...(safe.blockVisual as Record<string, unknown>) };
          }
          return { ...block, propsJson: merged };
        });

        if (!changed) return;
        set({ blocks, themeDirty: true, documentRevision: get().documentRevision + 1 });
      },

      applyBlockVariant: (blockId, variantId) => {
        const block = findBlockById(get().blocks, blockId);
        if (!block) return false;

        const patch = applyBlockVariantSafely(block.type, block.propsJson, variantId);
        if (!patch) return false;

        const history = withHistoryBeforeMutation(get, 'apply_block_variant');
        const blocks = get().blocks.map((item) => {
          if (item.id !== blockId) return item;
          return {
            ...item,
            propsJson: withStudioAppliedVariantId(
              mergeVariantPatchIntoProps(item.propsJson, patch),
              variantId,
            ),
          };
        });

        set({
          blocks,
          themeDirty: true,
          documentRevision: get().documentRevision + 1,
          ...(history ?? {}),
        });
        return true;
      },

      setInitialBlocks: (blocks) => {
        const ordered = normalizeSortOrder([...blocks]);
        resetPropsEditSession();
        set({
          blocks: ordered,
          selectedBlockId: ordered[0]?.id ?? null,
          hoveredBlockId: null,
          ...emptyDocumentHistoryState(),
        });
      },

      setDeviceMode: (mode) => set({ deviceMode: mode }),

      setPageTheme: (patch) => {
        const history = withHistoryBeforeMutation(get, 'edit_page_theme');
        set((state) => ({
          pageTheme: { ...state.pageTheme, ...patch },
          themeDirty: true,
          documentRevision: state.documentRevision + 1,
          ...(history ?? {}),
        }));
      },

      setPageSettings: (patch) => {
        const history = withHistoryBeforeMutation(get, 'edit_page_settings');
        set((state) => {
          const pageSettings = { ...state.pageSettings, ...patch };
          return {
            pageSettings,
            pageTheme: {
              ...state.pageTheme,
              seoTitle: pageSettings.metaTitle,
              seoDescription: pageSettings.metaDescription,
            },
            themeDirty: true,
            documentRevision: state.documentRevision + 1,
            ...(history ?? {}),
          };
        });
      },

      setInitialPageTheme: (theme) =>
        set({ pageTheme: theme, themeDirty: false }),

      setInitialPageSettings: (settings) =>
        set((state) => ({
          pageSettings: settings,
          pageTheme: {
            ...state.pageTheme,
            seoTitle: settings.metaTitle,
            seoDescription: settings.metaDescription,
          },
        })),

      restoreLocalDraft: (payload) => {
        const blocks = normalizeSortOrder([...payload.blocks]);
        const selection = sanitizeBlockSelection(
          blocks,
          payload.selectedBlockId,
          null,
        );
        resetPropsEditSession();
        set({
          blocks,
          pageTheme: payload.pageTheme,
          pageSettings: payload.pageSettings ?? {
            metaTitle: payload.pageTheme.seoTitle ?? '',
            metaDescription: payload.pageTheme.seoDescription ?? '',
            ogImageUrl: '',
            faviconUrl: '',
          },
          themeDirty: payload.themeDirty,
          ...selection,
          ...emptyDocumentHistoryState(),
        });
      },

      applyServerSnapshot: (payload) => {
        const blocks = normalizeSortOrder([...payload.blocks]);
        const selection = sanitizeBlockSelection(blocks, get().selectedBlockId, null);
        resetPropsEditSession();
        set({
          blocks,
          pageTheme: payload.pageTheme,
          pageSettings: payload.pageSettings,
          themeDirty: false,
          ...selection,
          ...emptyDocumentHistoryState(),
        });
      },

      markDocumentSaved: () => {
        set((state) => ({
          documentRevision: state.documentRevision + 1,
          lastSavedAt: Date.now(),
        }));
      },

      buildThemeJsonPayload: () => {
        const { pageTheme, pageSettings } = get();
        return {
          page: {
            theme: {
              primaryColor: pageTheme.primaryColor,
              secondaryColor: pageTheme.secondaryColor,
              mode: pageTheme.mode,
              fontFamily: pageTheme.fontFamily,
          headingFont: pageTheme.headingFont ?? pageTheme.fontFamily,
          bodyFont: pageTheme.bodyFont ?? 'Roboto',
              headingScale: pageTheme.headingScale,
              sectionSpacing: pageTheme.sectionSpacing,
              buttonStyle: pageTheme.buttonStyle,
            },
            seo: {
              title: pageSettings.metaTitle || pageTheme.seoTitle,
              description: pageSettings.metaDescription || pageTheme.seoDescription,
              ogImageUrl: resolvePersistedMediaUrl(
                pageSettings.ogImageAssetId,
                pageSettings.ogImageUrl,
              ),
              faviconUrl: resolvePersistedMediaUrl(
                pageSettings.faviconAssetId,
                pageSettings.faviconUrl,
              ),
              ogImageAssetId: pageSettings.ogImageAssetId ?? '',
              faviconAssetId: pageSettings.faviconAssetId ?? '',
            },
          },
        };
      },

      applyPageStarter: (blockTypes, mode = 'append') => {
        const activeTypes = new Set(getActivePaletteBlocks().map((b) => b.type));
        const starterBlocks = blockTypes
          .filter((type) => activeTypes.has(type))
          .map((type, index) => createBlockFromType(type, index));

        if (starterBlocks.length === 0) return;

        if (mode === 'replace') {
          const history = withHistoryBeforeMutation(get, 'apply_page_starter');
          set({
            blocks: normalizeSortOrder(starterBlocks),
            selectedBlockId: starterBlocks[0]?.id ?? null,
            themeDirty: true,
            ...(history ?? {}),
          });
          return;
        }

        const blocks = [...get().blocks];
        let insertAt = blocks.length;
        for (const newBlock of starterBlocks) {
          blocks.splice(insertAt, 0, newBlock);
          insertAt += 1;
        }

        const history = withHistoryBeforeMutation(get, 'apply_page_starter');
        set({
          blocks: normalizeSortOrder(blocks),
          selectedBlockId: starterBlocks[0]?.id ?? null,
          themeDirty: true,
          ...(history ?? {}),
        });
      },

      applyCampaignTemplate: (templateId) => {
        const template = getCampaignPageTemplateById(templateId);
        if (!template) return;

        const blocks = materializeCampaignTemplate(template);
        if (blocks.length === 0) return;

        const history = withHistoryBeforeMutation(get, 'apply_campaign_template');
        const pageTheme = buildPageThemeFromTemplateBrand(template.brandId, get().pageTheme);
        set({
          blocks: normalizeSortOrder(blocks),
          selectedBlockId: selectFirstMeaningfulBlockId(blocks),
          hoveredBlockId: null,
          pageTheme,
          themeDirty: true,
          documentRevision: get().documentRevision + 1,
          ...(history ?? {}),
        });
      },

      resetDocument: () => {
        resetPropsEditSession();
        set({
          blocks: [],
          selectedBlockId: null,
          hoveredBlockId: null,
          deviceMode: 'desktop',
          pageTheme: { ...DEFAULT_PAGE_THEME },
          pageSettings: { ...DEFAULT_PAGE_SETTINGS },
          themeDirty: false,
          documentRevision: 0,
          lastSavedAt: 0,
          ...emptyDocumentHistoryState(),
        });
      },
    }),
    {
      name: BUILDER_PERSIST_NAME,
      storage: createJSONStorage(() => pageScopedStorage),
      partialize: (state) => ({
        blocks: state.blocks,
        pageTheme: state.pageTheme,
        pageSettings: state.pageSettings,
        themeDirty: state.themeDirty,
        selectedBlockId: state.selectedBlockId,
        deviceMode: state.deviceMode,
      }),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = persisted as Partial<BuilderDocumentState> | undefined;
        if (!p) return current;
        const pageTheme = {
          ...current.pageTheme,
          ...(p.pageTheme ?? {}),
        };
        const pageSettings = {
          ...current.pageSettings,
          ...(p.pageSettings ?? {}),
        };
        if (!pageSettings.metaTitle && pageTheme.seoTitle) {
          pageSettings.metaTitle = pageTheme.seoTitle;
        }
        if (!pageSettings.metaDescription && pageTheme.seoDescription) {
          pageSettings.metaDescription = pageTheme.seoDescription;
        }
        if (!pageTheme.headingFont) {
          pageTheme.headingFont = pageTheme.fontFamily ?? 'Inter';
        }
        if (!pageTheme.bodyFont) {
          pageTheme.bodyFont = 'Roboto';
        }
        pageTheme.seoTitle = pageSettings.metaTitle;
        pageTheme.seoDescription = pageSettings.metaDescription;
        return {
          ...current,
          ...p,
          pageTheme,
          pageSettings,
        };
      },
    },
  ),
);

export type HydrateBuilderDocumentOptions = {
  /** Append a cache-busting query when loading blocks from the API (preview refresh). */
  cacheBust?: boolean;
  /**
   * When set, skip the API round-trip if the in-memory store already matches
   * this revision (studio → preview navigation right after save).
   */
  preferMemoryRevision?: number;
};

export type HydrateBuilderDocumentResult =
  | 'memory'
  | 'server'
  | 'localDraft'
  | 'localStorage';

/** Hydratation au montage — serveur prioritaire, draft local en fallback. */
export async function hydrateBuilderDocumentStore(
  pageVersionId: string,
  options: HydrateBuilderDocumentOptions = {},
): Promise<HydrateBuilderDocumentResult> {
  setBuilderPersistPageVersionId(pageVersionId);

  const memoryState = useBuilderDocumentStore.getState();
  if (
    options.preferMemoryRevision !== undefined &&
    persistPageVersionId === pageVersionId &&
    memoryState.documentRevision === options.preferMemoryRevision &&
    memoryState.blocks.length > 0
  ) {
    forcePersistBuilderDocument();
    return 'memory';
  }

  const { loadBuilderDocumentFromApi } = await import('../lib/load-builder-document');
  const loaded = await loadBuilderDocumentFromApi(pageVersionId, {
    cacheBust: options.cacheBust,
  });
  const store = useBuilderDocumentStore.getState();

  if (loaded.source === 'server') {
    store.applyServerSnapshot({
      blocks: loaded.blocks,
      pageTheme: loaded.pageTheme,
      pageSettings: loaded.pageSettings,
    });
  } else if (loaded.source === 'localDraft') {
    store.restoreLocalDraft({
      blocks: loaded.blocks,
      pageTheme: loaded.pageTheme,
      pageSettings: loaded.pageSettings,
      themeDirty: true,
      selectedBlockId: null,
    });
  } else if (loaded.blocks.length > 0) {
    store.setInitialBlocks(loaded.blocks);
    store.setInitialPageTheme(loaded.pageTheme);
    store.setInitialPageSettings(loaded.pageSettings);
  } else {
    await useBuilderDocumentStore.persist.rehydrate();
    store.setInitialPageTheme(loaded.pageTheme);
    store.setInitialPageSettings(loaded.pageSettings);
  }

  forcePersistBuilderDocument();
  return loaded.source;
}

/** Écrit immédiatement l'état courant dans localStorage (double sécurité au clic Sauvegarder). */
export function forcePersistBuilderDocument(): void {
  if (!persistPageVersionId) return;
  const state = useBuilderDocumentStore.getState();
  const payload = JSON.stringify({
    state: {
      blocks: state.blocks,
      pageTheme: state.pageTheme,
      pageSettings: state.pageSettings,
      themeDirty: state.themeDirty,
      selectedBlockId: state.selectedBlockId,
      deviceMode: state.deviceMode,
    },
    version: 0,
  });
  localStorage.setItem(`${PERSIST_STORAGE_PREFIX}${persistPageVersionId}`, payload);
}

export function selectActiveBlock(state: BuilderDocumentState) {
  if (!state.selectedBlockId) return null;
  return state.blocks.find((b) => b.id === state.selectedBlockId) ?? null;
}

export function selectCanUndo(state: BuilderDocumentState): boolean {
  return state.historyPast.length > 0;
}

export function selectCanRedo(state: BuilderDocumentState): boolean {
  return state.historyFuture.length > 0;
}
