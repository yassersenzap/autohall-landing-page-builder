import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { apiRequest, ApiError } from '@/lib/api';
import type {
  BuilderDocument,
  BuilderNode,
  DeviceMode,
  NodeKind,
  NodeLayout,
  NodePropsByKind,
  NodeStyle,
  NodeVisibility,
  NodeAdvanced,
  NodeResponsive,
} from '../types/nodes.types';
import { createCampaignHeroFormDocument } from '../templates/campaign-hero-form';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { insertHeroOverlayText } from '../lib/geometry/hero-overlay-text';
import { findHeroImageNode } from '../lib/hero-block';
import { resolveBusinessLayerSelection } from '../lib/layer-selection';
import { markDocumentStoreRehydrated } from '../lib/rehydrate-coordinator';
import { emptyHeroImageProps, HERO_IMAGE_STYLE_RESET } from '../lib/hero-image-media';
import {
  cloneSubtreeWithNewIds,
  extractSubtree,
  insertSubtree,
  moveNodeInDocument,
  reorderSibling,
  resolveDropTarget,
  type ClipboardPayload,
} from '../lib/node-tree-ops';
import type { CanvasGuide } from '../lib/canvas-geometry';
import { isCanvasDraggable, translateLayout } from '../lib/canvas-geometry';
import { builderToast } from '../lib/builder-toasts';
import {
  applyHeroFormLayout,
  findHeroFormBlock,
  getHeroFormGeometry,
  insertHeroContentBlock,
  type HeroContentBlockKind,
} from '../lib/studio-compat.js';
import type { HeroFormGeometry } from '../types/nodes.types.js';
import {
  canDeleteCampaignNode,
  resolveCampaignDeleteTarget,
} from '../lib/campaign-delete';
import { canDuplicateCampaignNode, duplicateUsesClipboard } from '../lib/campaign-duplicate';
import { isHeroBlockNode } from '../lib/hero-block-lifecycle';
import { isPageEmpty } from '../lib/studio-compat.js';
import { isDocumentEmpty, normalizeDocument, resolveHeroBlockSelectionId } from '../lib/document-lifecycle';
import { patchHeroImageLayerFromResolved } from '../lib/hero-block-layers';
import { isProBlock } from '../lib/pro-blocks';
import type { BusinessInspectorTab } from '../lib/business-inspector-context';
import { deleteCampaignNode } from '../lib/heal-document-legacy-content';
import {
  restoreCampaignForm,
  restoreCampaignHeroImage,
  restoreFullCampaignTemplate,
} from '../lib/campaign-block-restore';
import { insertCanvasBlock } from '../lib/campaign-block-insert';
import type { ElementBlockId } from '../lib/element-drag';
import { isSplitHeroLayout } from '../lib/geometry/hero-layout-context';
import { isCampaignLayoutNode, isCampaignTemplate } from '../lib/campaign-structure';
import { FORM_LAYER_NAME } from '../lib/hero-layers.js';
import type { LeftSidebarTab } from '../lib/sidebar-tabs';
import { normalizeSidebarTab } from '../lib/sidebar-tabs';

import {
  resolveInspectorContextForTab,
  resolveInspectorTabTargetId,
} from '../lib/inspector-tab-focus';
import {
  createPreviewSessionId,
  writePreviewSession,
} from '../lib/preview-session';

const MAX_HISTORY = 50;
const PERSIST_KEY = 'autohall-builder-v4-v1';

export type DocumentHistoryEntry = {
  document: BuilderDocument;
  label: string;
  at: number;
};

export type BuilderV4State = {
  document: BuilderDocument;
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  deviceMode: DeviceMode;
  previewMode: boolean;
  canvasZoom: number;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftSidebarTab: LeftSidebarTab;
  layersCollapsed: Record<string, boolean>;
  renamingNodeId: string | null;
  clipboard: ClipboardPayload | null;
  historyPast: DocumentHistoryEntry[];
  historyFuture: DocumentHistoryEntry[];
  canvasGuides: CanvasGuide[];
  inspectorFocusTab: BusinessInspectorTab | null;
  inspectorActiveTab: BusinessInspectorTab;
  selectedFormFieldId: string | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveState: 'draft' | 'saving' | 'success' | 'error';
  landingPageId: string | null;
  pageVersionId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  campaignBrand: string | null;
  campaignModel: string | null;
  lastSavedAt: number | null;
  saveVersion: number;
  documentRevision: number;
  rightPanelWidth: number;
  previewSessionId: string | null;

  selectNode: (id: string | null, options?: { additive?: boolean }) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  setInspectorFocusTab: (tab: BusinessInspectorTab | null) => void;
  clearInspectorFocusTab: () => void;
  setInspectorActiveTab: (tab: BusinessInspectorTab) => void;
  focusBusinessInspectorTab: (tab: BusinessInspectorTab) => void;
  setSelectedFormFieldId: (fieldId: string | null) => void;
  saveDocument: () => Promise<void>;
  loadDocument: (landingPageId: string, pageVersionId: string, campaignContext?: { campaignId?: string | null; campaignName?: string | null; campaignBrand?: string | null; campaignModel?: string | null }) => Promise<void>;
  openPreview: () => string;
  closePreview: () => void;
  setRightPanelWidth: (width: number) => void;
  hoverNode: (id: string | null) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setPreviewMode: (enabled: boolean) => void;
  setCanvasZoom: (zoom: number) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setLeftSidebarTab: (tab: LeftSidebarTab) => void;
  toggleLayerCollapsed: (id: string) => void;
  setRenamingNodeId: (id: string | null) => void;

  updateNodeLayout: (id: string, layout: Partial<NodeLayout>, options?: { skipHistory?: boolean }) => void;
  updateNodeStyle: (id: string, style: Partial<NodeStyle>, options?: { skipHistory?: boolean }) => void;
  updateNodeProps: <K extends NodeKind>(
    id: string,
    props: Partial<NodePropsByKind[K]>,
    options?: { skipHistory?: boolean },
  ) => void;
  updateBlockProps: (
    id: string,
    newProps: Partial<import('../lib/pro-blocks').ProBlockProps>,
  ) => void;
  updateNodeName: (id: string, name: string) => void;
  updateNodeVisibility: (id: string, visibility: Partial<NodeVisibility>) => void;
  updateNodeAdvanced: (id: string, advanced: Partial<NodeAdvanced>) => void;
  updateNodeResponsive: (id: string, responsive: Partial<NodeResponsive>) => void;
  updateNodesLayout: (
    updates: Record<string, Partial<NodeLayout>>,
    options?: { skipHistory?: boolean },
  ) => void;
  updateNodesStyle: (
    updates: Record<string, Partial<NodeStyle>>,
    options?: { skipHistory?: boolean },
  ) => void;
  nudgeSelectedNodes: (dx: number, dy: number) => void;
  setCanvasGuides: (guides: CanvasGuide[]) => void;
  deleteSelectedNodes: () => void;
  duplicateSelectedNodes: () => void;

  moveNode: (nodeId: string, newParentId: string, index: number) => void;
  moveSection: (nodeId: string, direction: 'up' | 'down') => void;
  reorderNodes: (activeId: string, overId: string) => void;
  handleLayerDrop: (activeId: string, overId: string) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  undoDocument: () => void;
  redoDocument: () => void;
  canUndoDocument: () => boolean;
  canRedoDocument: () => boolean;
  updateDocumentMeta: (meta: Partial<BuilderDocument['meta']>) => void;

  loadTemplate: (templateId: 'campaign-hero-form' | 'blank') => void;
  resetDocument: () => void;
  clearCanvas: () => void;
  restoreCampaignHeroImage: () => void;
  restoreCampaignForm: () => void;
  restoreFullCampaignTemplate: () => void;
  insertCanvasBlock: (blockId: ElementBlockId | string, insertAfterId?: string | null) => void;
  applyHeroImageAsset: (payload: { assetId: string; src: string; alt: string }) => boolean;
  clearHeroImageMedia: (nodeId: string) => void;
  addHeroOverlayText: (options?: {
    heroImageId?: string;
    left?: number;
    top?: number;
    text?: string;
    tag?: 'h1' | 'h2' | 'p' | 'span';
  }) => void;
  applyHeroGeometry: (
    patch: Partial<{
      layoutMode?: 'split' | 'floating';
      leftRatio?: number;
      rightRatio?: number;
      minHeight?: number;
      gap?: number;
      padding?: number;
      formColumnWidth?: number;
      contentVertical?: 'top' | 'center' | 'bottom';
      contentHorizontal?: 'left' | 'center' | 'right';
      contentMaxWidth?: number;
    }>,
    options?: { skipHistory?: boolean },
  ) => void;

  addHeroContentBlock: (kind: import('../lib/studio-compat.js').HeroContentBlockKind) => void;

  getNode: (id: string) => BuilderNode | undefined;
  getChildren: (id: string) => BuilderNode[];
  getBreadcrumbTrail: (id: string) => BuilderNode[];
  isNodeSelected: (id: string) => boolean;
};

/**
 * Strip ephemeral URLs from node props before server save.
 * - 'image' nodes: strips both base64 `data:` URIs and `blob:` object URLs from `src`
 *   (the canvas resolves the real asset via `assetId` instead).
 * - Pro blocks: strip only `blob:` URLs, from ANY string prop. Pro blocks store image
 *   sources directly on named props (promoImageUrl, imageSrc, logoUrl, ...) that never
 *   go through the assetId-based resolution 'image' nodes use, so a still-uploading or
 *   failed-upload blob: URL left in place gets persisted as-is — and turns into a broken
 *   image on the next load, since blob: URLs don't survive across page reloads.
 *   `data:` URIs are intentionally left untouched for pro blocks: some of them (e.g. the
 *   neutral vehicle placeholder) legitimately default to an inline data:image/svg+xml.
 */
function sanitizeDocumentForSave(doc: BuilderDocument): BuilderDocument {
  const nodes = { ...doc.nodes };
  let changed = false;
  for (const [id, node] of Object.entries(nodes)) {
    if (node.kind === 'image') {
      const props = node.props as { src?: string; assetId?: string };
      if (props.src?.startsWith('data:') || props.src?.startsWith('blob:')) {
        nodes[id] = { ...node, props: { ...node.props, src: '' } };
        changed = true;
      }
      continue;
    }
    if (isProBlock(node)) {
      const props = node.props as Record<string, unknown>;
      let nodeChanged = false;
      const nextProps: Record<string, unknown> = { ...props };
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string' && value.startsWith('blob:')) {
          nextProps[key] = '';
          nodeChanged = true;
        }
      }
      if (nodeChanged) {
        nodes[id] = { ...node, props: nextProps };
        changed = true;
      }
    }
  }
  return changed ? { ...doc, nodes } : doc;
}

const INITIAL_DOCUMENT = createBlankCanvasDocument();

function healCampaignSplitLayout(document: BuilderDocument, updates: Record<string, Partial<NodeLayout>>): BuilderDocument {
  if (!isCampaignTemplate(document) || !isSplitHeroLayout(document)) return document;
  const touched = Object.keys(updates).some((id) => {
    const node = document.nodes[id];
    return node && isCampaignLayoutNode(node);
  });
  if (!touched) return document;
  const hero = findHeroFormBlock(document);
  if (!hero) return document;
  return applyHeroFormLayout(document, hero.id);
}

function inferPropsHistoryLabel(props: Record<string, unknown>): string {
  if ('fields' in props) return 'Champs formulaire modifiés';
  if ('steps' in props) return 'Étape formulaire modifiée';
  if ('title' in props || 'subtitle' in props) return 'Titre modifié';
  if ('src' in props || 'assetId' in props) return 'Image changée';
  if ('alt' in props) return 'Image mise à jour';
  return 'Modification';
}

function pushHistory(
  state: BuilderV4State,
  label = 'Modification',
): Pick<BuilderV4State, 'historyPast' | 'historyFuture'> {
  return {
    historyPast: [
      ...state.historyPast.slice(-(MAX_HISTORY - 1)),
      { document: state.document, label, at: Date.now() },
    ],
    historyFuture: [],
  };
}

function applyDocument(
  state: BuilderV4State,
  document: BuilderDocument,
  options?: { skipHistory?: boolean; historyLabel?: string },
): Partial<BuilderV4State> {
  const normalized = normalizeDocument(document);
  const selection = sanitizeSelection(state, normalized);
  const revision = { documentRevision: state.documentRevision + 1 };
  if (options?.skipHistory) {
    return {
      document: normalized,
      ...selection,
      ...revision,
      hasUnsavedChanges: true,
      saveState: 'draft',
    };
  }
  return {
    document: normalized,
    ...selection,
    ...pushHistory(state, options?.historyLabel),
    ...revision,
    hasUnsavedChanges: true,
    saveState: 'draft',
  };
}

function sanitizeSelection(state: BuilderV4State, document: BuilderDocument): Partial<BuilderV4State> {
  const validIds = state.selectedNodeIds.filter((id) => Boolean(document.nodes[id]));
  let selectedNodeId: string | null = validIds[0] ?? null;

  if (selectedNodeId && document.nodes[selectedNodeId]) {
    selectedNodeId = resolveBusinessLayerSelection(document.nodes[selectedNodeId], document.nodes);
  }

  if (selectedNodeId && !document.nodes[selectedNodeId]) {
    selectedNodeId = null;
  }

  const renamingNodeId =
    state.renamingNodeId && document.nodes[state.renamingNodeId] ? state.renamingNodeId : null;

  return {
    selectedNodeIds: selectedNodeId ? [selectedNodeId] : [],
    selectedNodeId,
    renamingNodeId,
  };
}

export const useBuilderV4Store = create<BuilderV4State>()(
  persist(
    (set, get) => ({
      document: INITIAL_DOCUMENT,
      selectedNodeId: null,
      selectedNodeIds: [],
      hoveredNodeId: null,
      deviceMode: 'desktop',
      previewMode: false,
      canvasZoom: 1,
      leftPanelOpen: true,
      rightPanelOpen: false,
      leftSidebarTab: 'sections',
      layersCollapsed: {},
      renamingNodeId: null,
      clipboard: null,
      historyPast: [],
      historyFuture: [],
      canvasGuides: [],
      inspectorFocusTab: null,
      inspectorActiveTab: 'hero',
      selectedFormFieldId: null,
      hasUnsavedChanges: false,
      isSaving: false,
      saveState: 'success',
      landingPageId: null,
      pageVersionId: null,
      campaignId: null,
      campaignName: null,
      campaignBrand: null,
      campaignModel: null,
      lastSavedAt: Date.now(),
      saveVersion: 0,
      documentRevision: 0,
      rightPanelWidth: 440,
      previewSessionId: null,

      selectNode: (id, options) =>
        set((state) => {
          if (!id) {
            return { selectedNodeId: null, selectedNodeIds: [], renamingNodeId: null };
          }
          const node = state.document.nodes[id];
          const resolvedId = node ? resolveBusinessLayerSelection(node, state.document.nodes) : id;
          if (options?.additive) {
            const exists = state.selectedNodeIds.includes(resolvedId);
            const selectedNodeIds = exists
              ? state.selectedNodeIds.filter((nodeId) => nodeId !== resolvedId)
              : [...state.selectedNodeIds, resolvedId];
            return {
              selectedNodeIds,
              selectedNodeId: selectedNodeIds[selectedNodeIds.length - 1] ?? resolvedId,
            };
          }
          return { selectedNodeId: resolvedId, selectedNodeIds: [resolvedId], renamingNodeId: null };
        }),

      selectNodes: (ids) =>
        set(() => ({
          selectedNodeIds: ids,
          selectedNodeId: ids[0] ?? null,
          renamingNodeId: null,
        })),

      clearSelection: () =>
        set({ selectedNodeId: null, selectedNodeIds: [], renamingNodeId: null }),

      setInspectorFocusTab: (inspectorFocusTab) => {
        if (!inspectorFocusTab) {
          set({ inspectorFocusTab: null });
          return;
        }
        get().focusBusinessInspectorTab(inspectorFocusTab);
      },
      clearInspectorFocusTab: () => set({ inspectorFocusTab: null }),
      setInspectorActiveTab: (inspectorActiveTab) => set({ inspectorActiveTab }),
      setSelectedFormFieldId: (selectedFormFieldId) => set({ selectedFormFieldId }),
      focusBusinessInspectorTab: (tab) => {
        const state = get();
        const ctx = resolveInspectorContextForTab(state.document, state.selectedNodeId);
        if (!ctx || !ctx.tabs.includes(tab)) {
          set({ inspectorActiveTab: tab });
          return;
        }
        const targetId = resolveInspectorTabTargetId(tab, ctx, state.document);
        if (targetId && state.document.nodes[targetId]) {
          set({
            selectedNodeId: targetId,
            selectedNodeIds: [targetId],
            inspectorActiveTab: tab,
            inspectorFocusTab: null,
          });
          return;
        }
        set({ inspectorActiveTab: tab, inspectorFocusTab: null });
      },
      saveDocument: async () => {
        const state = get();
        if (state.isSaving) return;
        set({ isSaving: true, saveState: 'saving' });
        
        const { landingPageId, pageVersionId, document } = state;
        const payload = {
          state: {
            document,
            deviceMode: state.deviceMode,
            rightPanelWidth: state.rightPanelWidth,
          },
          version: 0,
        };
        localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));

        if (landingPageId && pageVersionId) {
          try {
            // Strip base64 src from image nodes before sending (payload size guard).
            // The canvas resolves images from the in-memory asset store via assetId.
            const sanitizedDoc = sanitizeDocumentForSave(document);
            await apiRequest<any>(
              `/api/landing-pages/${landingPageId}/versions/${pageVersionId}/studio-document`,
              {
                method: 'PUT',
                body: { documentJson: sanitizedDoc },
              }
            );
            set({
              isSaving: false,
              saveState: 'success',
              hasUnsavedChanges: false,
              lastSavedAt: Date.now(),
              saveVersion: state.saveVersion + 1,
            });
          } catch (error) {
            console.error('Failed to save studio document:', error);
            set({ isSaving: false, saveState: 'error' });
            let saveMsg = 'Erreur lors de la sauvegarde du document.';
            if (error instanceof ApiError) {
              if (error.status === 401) saveMsg = 'Session expirée — reconnectez-vous pour continuer.';
              else if (error.status === 403) saveMsg = 'Permissions insuffisantes — contactez un administrateur.';
              else if (error.body?.message) saveMsg = error.body.message;
            }
            toast.error(saveMsg);
          }
        } else {
          await new Promise((resolve) => window.setTimeout(resolve, 120));
          set({
            isSaving: false,
            saveState: 'success',
            hasUnsavedChanges: false,
            lastSavedAt: Date.now(),
            saveVersion: state.saveVersion + 1,
          });
        }
      },

      loadDocument: async (
        landingPageId: string,
        pageVersionId: string,
        campaignContext?: { campaignId?: string | null; campaignName?: string | null; campaignBrand?: string | null; campaignModel?: string | null },
      ) => {
        set({
          isSaving: true,
          saveState: 'saving',
          landingPageId,
          pageVersionId,
          campaignId: campaignContext?.campaignId ?? null,
          campaignName: campaignContext?.campaignName ?? null,
          campaignBrand: campaignContext?.campaignBrand ?? null,
          campaignModel: campaignContext?.campaignModel ?? null,
        });
        try {
          const res = await apiRequest<any>(
            `/api/landing-pages/${landingPageId}/versions/${pageVersionId}/studio-document`
          );
          if (res && res.success) {
            let doc: BuilderDocument;
            try {
              const raw = res.data;
              // Guard: old Puck or invalid format — treat as blank
              const isV4 = raw && typeof raw === 'object' && 'rootId' in raw && 'nodes' in raw;
              doc = isV4 ? normalizeDocument(raw as BuilderDocument) : createBlankCanvasDocument();
            } catch {
              doc = createBlankCanvasDocument();
            }
            set({
              document: doc,
              hasUnsavedChanges: false,
              saveState: 'success',
              isSaving: false,
              lastSavedAt: Date.now(),
              selectedNodeId: null,
              selectedNodeIds: [],
            });
          } else {
            set({ saveState: 'error', isSaving: false });
          }
        } catch (error) {
          console.error('Failed to load studio document:', error);
          set({ isSaving: false });
          throw error;
        }
      },
      openPreview: () => {
        const state = get();
        const previewId = createPreviewSessionId();
        writePreviewSession(previewId, {
          document: state.document,
          deviceMode: state.deviceMode,
          savedAt: Date.now(),
        });
        set({ previewSessionId: previewId, selectedNodeId: null, selectedNodeIds: [] });
        return previewId;
      },
      closePreview: () => set({ previewSessionId: null }),
      setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),

      setCanvasGuides: (canvasGuides) => set({ canvasGuides }),

      hoverNode: (id) => set({ hoveredNodeId: id }),
      setDeviceMode: (deviceMode) => set({ deviceMode }),
      setPreviewMode: (previewMode) =>
        set((state) => ({
          previewMode,
          selectedNodeId: previewMode ? null : state.selectedNodeId,
          selectedNodeIds: previewMode ? [] : state.selectedNodeIds,
        })),
      setCanvasZoom: (canvasZoom) => set({ canvasZoom }),
      setLeftPanelOpen: (leftPanelOpen) => set({ leftPanelOpen }),
      setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
      setLeftSidebarTab: (leftSidebarTab) =>
        set({ leftSidebarTab: normalizeSidebarTab(leftSidebarTab), leftPanelOpen: true }),
      toggleLayerCollapsed: (id) =>
        set((state) => ({
          layersCollapsed: { ...state.layersCollapsed, [id]: !state.layersCollapsed[id] },
        })),
      setRenamingNodeId: (renamingNodeId) => set({ renamingNodeId }),

      updateNodeLayout: (id, layout, options) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          const nextDocument = {
            ...state.document,
            nodes: {
              ...state.document.nodes,
              [id]: { ...node, layout: { ...node.layout, ...layout } },
            },
          };
          if (options?.skipHistory) return { document: nextDocument };
          return applyDocument(state, nextDocument);
        }),

      updateNodeStyle: (id, style, options) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          const nextDocument = {
            ...state.document,
            nodes: {
              ...state.document.nodes,
              [id]: { ...node, style: { ...node.style, ...style } },
            },
          };
          if (options?.skipHistory) return { document: nextDocument };
          return applyDocument(state, nextDocument);
        }),

      updateNodeProps: (id, props, options) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          const nextDocument = {
            ...state.document,
            nodes: {
              ...state.document.nodes,
              [id]: { ...node, props: { ...node.props, ...props } },
            },
          };
          return applyDocument(state, nextDocument, {
            skipHistory: options?.skipHistory,
            historyLabel: inferPropsHistoryLabel(props as Record<string, unknown>),
          });
        }),

      updateBlockProps: (id, newProps) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          const nextDocument = {
            ...state.document,
            nodes: {
              ...state.document.nodes,
              [id]: { ...node, props: { ...node.props, ...newProps } },
            },
          };
          return {
            document: nextDocument,
            documentRevision: state.documentRevision + 1,
            hasUnsavedChanges: true,
            saveState: 'draft',
          };
        }),

      updateNodeName: (id, name) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          return {
            ...applyDocument(state, {
              ...state.document,
              nodes: { ...state.document.nodes, [id]: { ...node, name } },
            }),
            renamingNodeId: null,
          };
        }),

      updateNodeVisibility: (id, visibility) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          return {
            document: {
              ...state.document,
              nodes: {
                ...state.document.nodes,
                [id]: { ...node, visibility: { ...node.visibility, ...visibility } },
              },
            },
          };
        }),

      updateDocumentMeta: (meta) =>
        set((state) => {
          const nextDocument = {
            ...state.document,
            meta: {
              ...state.document.meta,
              ...meta,
            },
          };
          return applyDocument(state, nextDocument, {
            historyLabel: 'Modification des paramètres de la page',
          });
        }),

      updateNodeAdvanced: (id, advanced) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          return {
            document: {
              ...state.document,
              nodes: {
                ...state.document.nodes,
                [id]: { ...node, advanced: { ...node.advanced, ...advanced } },
              },
            },
          };
        }),

      updateNodeResponsive: (id, responsive) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node) return state;
          return {
            document: {
              ...state.document,
              nodes: {
                ...state.document.nodes,
                [id]: {
                  ...node,
                  responsive: {
                    ...node.responsive,
                    ...responsive,
                  },
                },
              },
            },
          };
        }),

      updateNodesLayout: (updates, options) =>
        set((state) => {
          const nextNodes = { ...state.document.nodes };
          let changed = false;
          for (const [id, layout] of Object.entries(updates)) {
            const node = nextNodes[id];
            if (!node) continue;
            changed = true;
            nextNodes[id] = { ...node, layout: { ...node.layout, ...layout } };
          }
          if (!changed) return state;
          let nextDocument = { ...state.document, nodes: nextNodes };
          nextDocument = healCampaignSplitLayout(nextDocument, updates);
          if (options?.skipHistory) return { document: nextDocument };
          return applyDocument(state, nextDocument);
        }),

      updateNodesStyle: (updates, options) =>
        set((state) => {
          const nextNodes = { ...state.document.nodes };
          let changed = false;
          for (const [id, style] of Object.entries(updates)) {
            const node = nextNodes[id];
            if (!node) continue;
            changed = true;
            nextNodes[id] = { ...node, style: { ...node.style, ...style } };
          }
          if (!changed) return state;
          const nextDocument = { ...state.document, nodes: nextNodes };
          if (options?.skipHistory) return { document: nextDocument };
          return applyDocument(state, nextDocument);
        }),

      nudgeSelectedNodes: (dx, dy) =>
        set((state) => {
          const rootId = state.document.rootId;
          const layoutUpdates: Record<string, Partial<NodeLayout>> = {};
          for (const id of state.selectedNodeIds) {
            const node = state.document.nodes[id];
            if (!node) continue;
            if (!isCanvasDraggable(node, rootId)) continue;
            const element = document.querySelector<HTMLElement>(`[data-v4-node-id="${id}"]`);
            const parentElement =
              element?.parentElement?.closest('[data-v4-node-id]') as HTMLElement | null;
            if (!element) continue;
            const patch = translateLayout(node, dx, dy, element, parentElement, rootId);
            if (Object.keys(patch).length === 0) continue;
            layoutUpdates[id] = patch;
          }
          if (Object.keys(layoutUpdates).length === 0) return state;
          const nextNodes = { ...state.document.nodes };
          for (const [id, layout] of Object.entries(layoutUpdates)) {
            const node = nextNodes[id];
            if (!node) continue;
            nextNodes[id] = { ...node, layout: { ...node.layout, ...layout } };
          }
          return applyDocument(state, { ...state.document, nodes: nextNodes });
        }),

      deleteSelectedNodes: () => {
        const before = get().document;
        const deletableIds = get().selectedNodeIds.filter((id) =>
          canDeleteCampaignNode(get().document, id),
        );
        if (deletableIds.length === 0) return;

        const deletesHeroBlock = deletableIds.some((id) => {
          const targetId = resolveCampaignDeleteTarget(get().document, id) ?? id;
          return isHeroBlockNode(get().document.nodes[targetId]);
        });

        const count = deletableIds.length;
        set((state) => {
          const rootId = state.document.rootId;
          const ids = deletableIds.filter((id) => id !== rootId);
          if (ids.length === 0) return state;
          let nextDocument = state.document;
          for (const id of ids) {
            const targetId = resolveCampaignDeleteTarget(nextDocument, id) ?? id;
            if (targetId === rootId) {
              nextDocument = createBlankCanvasDocument();
              continue;
            }
            nextDocument = deleteCampaignNode(nextDocument, targetId);
          }
          if (nextDocument === state.document) return state;
          const wentBlank = isPageEmpty(nextDocument);
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: null,
            selectedNodeIds: [],
            renamingNodeId: null,
            inspectorFocusTab: null,
            ...(wentBlank ? { leftSidebarTab: 'sections' as const, leftPanelOpen: false } : {}),
          };
        });
        if (get().document !== before) {
          builderToast.deleted(count, deletesHeroBlock ? () => get().undoDocument() : undefined);
        }
      },

      duplicateSelectedNodes: () => {
        const before = get().document;
        set((state) => {
          const rootId = state.document.rootId;
          let nextDocument = state.document;
          const newIds: string[] = [];
          for (const id of state.selectedNodeIds) {
            if (id === rootId) continue;
            if (!canDuplicateCampaignNode(state.document, id)) continue;
            const node = nextDocument.nodes[id];
            if (!node?.parentId) continue;
            const payload = extractSubtree(nextDocument.nodes, id);
            if (!payload) continue;
            const cloned = cloneSubtreeWithNewIds(payload);
            const parent = nextDocument.nodes[node.parentId];
            const index = parent.children.indexOf(id) + 1;
            nextDocument = insertSubtree(nextDocument, cloned, node.parentId, index);
            newIds.push(cloned.rootId);
          }
          if (newIds.length === 0) return state;
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: newIds[0],
            selectedNodeIds: newIds,
          };
        });
        if (get().document !== before) builderToast.duplicated(get().selectedNodeIds.length);
      },

      moveNode: (nodeId, newParentId, index) =>
        set((state) => {
          const nextDocument = moveNodeInDocument(state.document, nodeId, newParentId, index);
          if (nextDocument === state.document) return state;
          return {
            ...applyDocument(state, nextDocument),
            ...sanitizeSelection(state, nextDocument),
          };
        }),

      moveSection: (nodeId, direction) =>
        set((state) => {
          const node = state.document.nodes[nodeId];
          if (!node || !node.parentId) return state;
          const parent = state.document.nodes[node.parentId];
          if (!parent) return state;
          const oldIndex = parent.children.indexOf(nodeId);
          if (oldIndex < 0) return state;
          const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
          if (newIndex < 0 || newIndex >= parent.children.length) return state;
          
          const nextDocument = moveNodeInDocument(
            state.document,
            nodeId,
            node.parentId,
            newIndex
          );
          if (nextDocument === state.document) return state;
          return applyDocument(state, nextDocument, { historyLabel: `Déplacement section ${direction === 'up' ? 'vers le haut' : 'vers le bas'}` });
        }),

      reorderNodes: (activeId, overId) =>
        set((state) => {
          const nextDocument = reorderSibling(state.document, activeId, overId);
          if (nextDocument === state.document) return state;
          return applyDocument(state, nextDocument);
        }),

      handleLayerDrop: (activeId, overId) =>
        set((state) => {
          const activeSectionId = resolveBusinessLayerSelection(state.document.nodes[activeId], state.document.nodes);
          const overSectionId = resolveBusinessLayerSelection(state.document.nodes[overId], state.document.nodes);
          
          if (!activeSectionId || !overSectionId || activeSectionId === overSectionId) return state;

          const target = resolveDropTarget(state.document, activeSectionId, overSectionId);
          if (!target) return state;
          const nextDocument = moveNodeInDocument(
            state.document,
            activeSectionId,
            target.parentId,
            target.index,
          );
          if (nextDocument === state.document) return state;
          return {
            ...applyDocument(state, nextDocument),
            ...sanitizeSelection(state, nextDocument),
          };
        }),

      duplicateNode: (nodeId) => {
        const node = get().document.nodes[nodeId];
        if (duplicateUsesClipboard(node)) {
          const payload = extractSubtree(get().document.nodes, nodeId);
          if (!payload) return;
          set({ clipboard: payload });
          builderToast.copied();
          return;
        }
        if (!canDuplicateCampaignNode(get().document, nodeId)) return;

        const before = get().document;
        set((state) => {
          const current = state.document.nodes[nodeId];
          if (!current?.parentId) return state;
          const payload = extractSubtree(state.document.nodes, nodeId);
          if (!payload) return state;
          const cloned = cloneSubtreeWithNewIds(payload);
          const parent = state.document.nodes[current.parentId];
          const index = parent.children.indexOf(nodeId) + 1;
          const inserted = insertSubtree(state.document, cloned, current.parentId, index);
          const hero = findHeroFormBlock(inserted);
          const nextDocument = hero ? applyHeroFormLayout(inserted, hero.id) : inserted;
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: cloned.rootId,
            selectedNodeIds: [cloned.rootId],
          };
        });
        if (get().document !== before) builderToast.duplicated();
      },

      deleteNode: (nodeId) => {
        const before = get().document;
        const targetId = resolveCampaignDeleteTarget(get().document, nodeId) ?? nodeId;
        const deleteTarget = get().document.nodes[targetId];
        const isHeroDelete = isHeroBlockNode(deleteTarget);

        set((state) => {
          if (nodeId === state.document.rootId) {
            const blank = createBlankCanvasDocument();
            return {
              document: blank,
              selectedNodeId: null,
              selectedNodeIds: [],
              renamingNodeId: null,
              inspectorFocusTab: null,
              leftSidebarTab: 'sections',
              leftPanelOpen: false,
              ...pushHistory(state),
            };
          }

          if (!canDeleteCampaignNode(state.document, nodeId)) return state;

          const resolvedTargetId = resolveCampaignDeleteTarget(state.document, nodeId) ?? nodeId;
          const nextDocument = deleteCampaignNode(state.document, resolvedTargetId);
          if (nextDocument === state.document) return state;

          const wentBlank = isPageEmpty(nextDocument);
          return {
            ...applyDocument(state, nextDocument),
            inspectorFocusTab: null,
            ...(wentBlank ? { leftSidebarTab: 'sections' as const, leftPanelOpen: false } : {}),
          };
        });
        if (get().document !== before) {
          builderToast.deleted(1, isHeroDelete ? () => get().undoDocument() : undefined);
        }
      },

      copySelection: () => {
        let copied = false;
        set((state) => {
          const nodeId = state.selectedNodeId;
          if (!nodeId || nodeId === state.document.rootId) return state;
          const payload = extractSubtree(state.document.nodes, nodeId);
          if (!payload) return state;
          copied = true;
          return { clipboard: payload };
        });
        if (copied) builderToast.copied();
      },

      pasteClipboard: () => {
        const before = get().document;
        set((state) => {
          if (!state.clipboard) return state;
          const targetId = state.selectedNodeId ?? state.document.rootId;
          const target = state.document.nodes[targetId];
          if (!target) return state;

          const cloned = cloneSubtreeWithNewIds(state.clipboard);
          let parentId = target.id;
          let index = target.children.length;

          if (target.kind !== 'frame' && target.kind !== 'stack' && target.kind !== 'card' && target.kind !== 'section') {
            if (!target.parentId) return state;
            parentId = target.parentId;
            index = state.document.nodes[parentId].children.indexOf(targetId) + 1;
          }

          const nextDocument = insertSubtree(state.document, cloned, parentId, index);
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: cloned.rootId,
            selectedNodeIds: [cloned.rootId],
          };
        });
        if (get().document !== before) builderToast.pasted();
      },

      undoDocument: () => {
        const before = get().historyPast.length;
        set((state) => {
          if (state.historyPast.length === 0) return state;
          const previous = state.historyPast[state.historyPast.length - 1];
          return {
            document: previous.document,
            historyPast: state.historyPast.slice(0, -1),
            historyFuture: [
              { document: state.document, label: 'Annulation', at: Date.now() },
              ...state.historyFuture,
            ],
            hasUnsavedChanges: true,
            saveState: 'draft',
            ...sanitizeSelection(state, previous.document),
          };
        });
        if (get().historyPast.length < before) builderToast.undo();
      },

      redoDocument: () => {
        const before = get().historyFuture.length;
        set((state) => {
          if (state.historyFuture.length === 0) return state;
          const next = state.historyFuture[0];
          return {
            document: next.document,
            historyPast: [
              ...state.historyPast,
              { document: state.document, label: 'Rétablissement', at: Date.now() },
            ],
            historyFuture: state.historyFuture.slice(1),
            hasUnsavedChanges: true,
            saveState: 'draft',
            ...sanitizeSelection(state, next.document),
          };
        });
        if (get().historyFuture.length < before) builderToast.redo();
      },

      canUndoDocument: () => get().historyPast.length > 0,
      canRedoDocument: () => get().historyFuture.length > 0,

      loadTemplate: (templateId) => {
        const raw =
          templateId === 'blank' ? createBlankCanvasDocument() : createCampaignHeroFormDocument();
        const document = normalizeDocument(raw);
        const heroId = resolveHeroBlockSelectionId(document);
        set({
          document,
          selectedNodeId: templateId === 'blank' ? null : heroId,
          selectedNodeIds: templateId === 'blank' || !heroId ? [] : [heroId],
          historyPast: [],
          historyFuture: [],
          clipboard: null,
          renamingNodeId: null,
          leftSidebarTab: templateId === 'blank' ? 'templates' : 'layers',
          leftPanelOpen: templateId === 'blank' ? false : true,
          hasUnsavedChanges: true,
          saveState: 'draft',
          isSaving: false,
          lastSavedAt: null,
          saveVersion: 0,
          documentRevision: 0,
        });
      },

      resetDocument: () =>
        set({
          document: createCampaignHeroFormDocument(),
          selectedNodeId: null,
          selectedNodeIds: [],
          historyPast: [],
          historyFuture: [],
          clipboard: null,
          renamingNodeId: null,
        }),

      clearCanvas: () => {
        const document = normalizeDocument(createBlankCanvasDocument());
        set({
          document,
          selectedNodeId: null,
          selectedNodeIds: [],
          historyPast: [],
          historyFuture: [],
          clipboard: null,
          renamingNodeId: null,
          inspectorFocusTab: null,
          leftSidebarTab: 'sections',
          leftPanelOpen: false,
        });
      },

      restoreCampaignHeroImage: () =>
        set((state) => {
          const nextDocument = restoreCampaignHeroImage(state.document);
          if (nextDocument === state.document) return state;
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: state.document.rootId,
            selectedNodeIds: [state.document.rootId],
          };
        }),

      restoreCampaignForm: () =>
        set((state) => {
          const nextDocument = restoreCampaignForm(state.document);
          if (nextDocument === state.document) return state;
          const formLayer = Object.values(nextDocument.nodes).find((node) => node.name === FORM_LAYER_NAME);
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: formLayer?.id ?? state.document.rootId,
            selectedNodeIds: formLayer ? [formLayer.id] : [state.document.rootId],
          };
        }),

      restoreFullCampaignTemplate: () =>
        set((state) => ({
          document: restoreFullCampaignTemplate(state.document),
          selectedNodeId: null,
          selectedNodeIds: [],
          historyPast: [],
          historyFuture: [],
          clipboard: null,
          renamingNodeId: null,
          leftSidebarTab: 'layers',
          leftPanelOpen: true,
        })),

      insertCanvasBlock: (blockId, insertAfterId) =>
        set((state) => {
          const { document: nextDocument, selectedId } = insertCanvasBlock(
            state.document,
            blockId,
            state.selectedNodeId,
            insertAfterId ?? null,
          );
          if (nextDocument === state.document) return state;

          const normalized = normalizeDocument(nextDocument);
          const selectionId = selectedId ?? resolveHeroBlockSelectionId(normalized, normalized.rootId);
          const wentFromEmpty = isDocumentEmpty(state.document);

          return {
            ...applyDocument(state, normalized),
            selectedNodeId: selectionId,
            selectedNodeIds: selectionId ? [selectionId] : [],
            renamingNodeId: null,
            leftSidebarTab: wentFromEmpty ? 'layers' : state.leftSidebarTab,
            leftPanelOpen: true,
          };
        }),

      applyHeroImageAsset: (payload) => {
        let applied = false;
        set((state) => {
          const nextDocument = patchHeroImageLayerFromResolved(state.document, payload);
          if (!nextDocument || nextDocument === state.document) return state;
          applied = true;
          const normalized = normalizeDocument(nextDocument);
          const heroId = resolveHeroBlockSelectionId(normalized);
          return {
            ...applyDocument(state, normalized),
            selectedNodeId: heroId,
            selectedNodeIds: heroId ? [heroId] : [],
            inspectorFocusTab: 'image',
          };
        });
        return applied;
      },

      clearHeroImageMedia: (id) =>
        set((state) => {
          const node = state.document.nodes[id];
          if (!node || node.kind !== 'image') return state;
          const nextDocument = {
            ...state.document,
            nodes: {
              ...state.document.nodes,
              [id]: {
                ...node,
                props: emptyHeroImageProps(node.props as import('../types/nodes.types').ImageNodeProps),
                style: { ...node.style, ...HERO_IMAGE_STYLE_RESET },
              },
            },
          };
          return applyDocument(state, nextDocument);
        }),

      addHeroOverlayText: (options) =>
        set((state) => {
          const heroImage =
            (options?.heroImageId ? state.document.nodes[options.heroImageId] : undefined)
            ?? findHeroImageNode(state.document.nodes, state.document.rootId);
          if (!heroImage) return state;

          const inserted = insertHeroOverlayText(state.document.nodes, heroImage.id, options, state.document.rootId);
          if (!inserted) return state;

          const nextDocument = { ...state.document, nodes: inserted.nodes };
          return {
            ...applyDocument(state, nextDocument),
            selectedNodeId: inserted.textId,
            selectedNodeIds: [inserted.textId],
          };
        }),

      applyHeroGeometry: (patch, options) =>
        set((state) => {
          const hero = findHeroFormBlock(state.document);
          if (!hero) return state;

          const current = getHeroFormGeometry(state.document);
          const nextGeo: HeroFormGeometry = {
            ...current,
            ...(patch.layoutMode === 'floating'
              ? { mode: 'floating-card' as const }
              : patch.layoutMode === 'split'
                ? { mode: 'split' as const }
                : {}),
            ...(patch.leftRatio !== undefined ? { leftRatio: patch.leftRatio } : {}),
            ...(patch.rightRatio !== undefined ? { rightRatio: patch.rightRatio } : {}),
            ...(patch.minHeight !== undefined ? { minHeight: patch.minHeight } : {}),
            ...(patch.gap !== undefined ? { gap: patch.gap } : {}),
            ...(patch.padding !== undefined ? { padding: patch.padding } : {}),
            ...(patch.formColumnWidth !== undefined ? { formColumnWidth: patch.formColumnWidth } : {}),
            ...(patch.contentVertical !== undefined ? { contentVertical: patch.contentVertical } : {}),
            ...(patch.contentHorizontal !== undefined ? { contentHorizontal: patch.contentHorizontal } : {}),
            ...(patch.contentMaxWidth !== undefined ? { contentMaxWidth: patch.contentMaxWidth } : {}),
          };

          const nextDocument = applyHeroFormLayout(state.document, hero.id, nextGeo);
          return {
            ...applyDocument(state, nextDocument, options),
            ...sanitizeSelection(state, nextDocument),
          };
        }),

      addHeroContentBlock: (kind: HeroContentBlockKind) =>
        set((state) => {
          const result = insertHeroContentBlock(state.document, kind);
          if (!result) return state;
          return {
            ...applyDocument(state, result.document),
            selectedNodeId: result.nodeId,
            selectedNodeIds: [result.nodeId],
            inspectorFocusTab: 'image',
          };
        }),

      getNode: (id) => get().document.nodes[id],

      getChildren: (id) => {
        const node = get().document.nodes[id];
        if (!node) return [];
        return node.children
          .map((childId) => get().document.nodes[childId])
          .filter(Boolean) as BuilderNode[];
      },

      getBreadcrumbTrail: (id) => {
        const trail: BuilderNode[] = [];
        let current: BuilderNode | undefined = get().document.nodes[id];
        while (current) {
          trail.unshift(current);
          current = current.parentId ? get().document.nodes[current.parentId] : undefined;
        }
        return trail;
      },

      isNodeSelected: (id) => {
        const state = get();
        return state.selectedNodeIds.includes(id);
      },
    }),
    {
      name: 'autohall-builder-v4-v1',
      partialize: (state) => ({
        document: state.document,
        deviceMode: state.deviceMode,
        rightPanelWidth: state.rightPanelWidth,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<BuilderV4State> | undefined;
        const document = normalizeDocument(
          (saved?.document as BuilderDocument | undefined) ?? current.document,
        );
        return {
          ...current,
          ...saved,
          document,
          selectedNodeId: null,
          selectedNodeIds: [],
        };
      },
      onRehydrateStorage: () => () => {
        markDocumentStoreRehydrated();
      },
    },
  ),
);
