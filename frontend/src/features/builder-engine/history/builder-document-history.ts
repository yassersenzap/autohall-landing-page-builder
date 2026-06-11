import type { BuilderDocumentBlock } from '../types';

export const BUILDER_HISTORY_MAX_SIZE = 50;

/** Debounce window for coalescing inspector prop edits into one undo step. */
export const BUILDER_PROPS_HISTORY_DEBOUNCE_MS = 400;

// TODO(history-v2): optional per-field debounce or explicit commit on inspector blur.

export type HistoryCheckpointReason =
  | 'add_block'
  | 'insert_block'
  | 'delete_block'
  | 'duplicate_block'
  | 'reorder_blocks'
  | 'move_block'
  | 'edit_block_props'
  | 'apply_block_variant'
  | 'apply_campaign_template'
  | 'apply_page_starter'
  | 'edit_page_theme'
  | 'edit_page_settings'
  | 'manual';

export type PageThemeSnapshot = {
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

export type PageSettingsSnapshot = {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  ogImageAssetId?: string;
  faviconUrl: string;
  faviconAssetId?: string;
};

export type BuilderDocumentCheckpoint = {
  blocks: BuilderDocumentBlock[];
  selectedBlockId: string | null;
  pageTheme: PageThemeSnapshot;
  pageSettings: PageSettingsSnapshot;
  themeDirty: boolean;
  reason?: HistoryCheckpointReason;
};

export type BuilderHistoryStacks = {
  past: BuilderDocumentCheckpoint[];
  future: BuilderDocumentCheckpoint[];
};

function isUnsafePersistedUrl(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return lower.startsWith('blob:') || lower.startsWith('data:');
}

/** Strip blob/data URLs from checkpoint payloads — history must not retain ephemeral media. */
export function sanitizeHistoryValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return isUnsafePersistedUrl(value) ? '' : value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeHistoryValue);
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = sanitizeHistoryValue(entry);
    }
    return out;
  }
  return value;
}

export function cloneBlocksForHistory(blocks: BuilderDocumentBlock[]): BuilderDocumentBlock[] {
  return blocks.map((block) => ({
    ...block,
    propsJson: sanitizeHistoryValue(
      JSON.parse(JSON.stringify(block.propsJson)) as Record<string, unknown>,
    ) as Record<string, unknown>,
  }));
}

export function createBuilderDocumentCheckpoint(input: {
  blocks: BuilderDocumentBlock[];
  selectedBlockId: string | null;
  pageTheme: PageThemeSnapshot;
  pageSettings: PageSettingsSnapshot;
  themeDirty: boolean;
  reason?: HistoryCheckpointReason;
}): BuilderDocumentCheckpoint {
  return {
    blocks: cloneBlocksForHistory(input.blocks),
    selectedBlockId: input.selectedBlockId,
    pageTheme: { ...input.pageTheme },
    pageSettings: { ...input.pageSettings },
    themeDirty: input.themeDirty,
    reason: input.reason,
  };
}

export function appendHistoryCheckpoint(
  past: BuilderDocumentCheckpoint[],
  checkpoint: BuilderDocumentCheckpoint,
  maxSize = BUILDER_HISTORY_MAX_SIZE,
): BuilderDocumentCheckpoint[] {
  const next = [...past, checkpoint];
  if (next.length <= maxSize) return next;
  return next.slice(next.length - maxSize);
}

export function canUndoHistory(stacks: BuilderHistoryStacks): boolean {
  return stacks.past.length > 0;
}

export function canRedoHistory(stacks: BuilderHistoryStacks): boolean {
  return stacks.future.length > 0;
}

export function clearHistoryStacks(): BuilderHistoryStacks {
  return { past: [], future: [] };
}

export function emptyDocumentHistoryState(): {
  historyPast: BuilderDocumentCheckpoint[];
  historyFuture: BuilderDocumentCheckpoint[];
} {
  return { historyPast: [], historyFuture: [] };
}

export type UndoRedoResult = {
  snapshot: BuilderDocumentCheckpoint;
  past: BuilderDocumentCheckpoint[];
  future: BuilderDocumentCheckpoint[];
} | null;

export function computeUndo(
  stacks: BuilderHistoryStacks,
  current: BuilderDocumentCheckpoint,
): UndoRedoResult {
  if (stacks.past.length === 0) return null;
  const previous = stacks.past[stacks.past.length - 1];
  return {
    snapshot: previous,
    past: stacks.past.slice(0, -1),
    future: appendHistoryCheckpoint(stacks.future, current),
  };
}

export function computeRedo(
  stacks: BuilderHistoryStacks,
  current: BuilderDocumentCheckpoint,
): UndoRedoResult {
  if (stacks.future.length === 0) return null;
  const next = stacks.future[0];
  return {
    snapshot: next,
    past: appendHistoryCheckpoint(stacks.past, current),
    future: stacks.future.slice(1),
  };
}
