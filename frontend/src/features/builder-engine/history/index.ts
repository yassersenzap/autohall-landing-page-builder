export {
  BUILDER_HISTORY_MAX_SIZE,
  BUILDER_PROPS_HISTORY_DEBOUNCE_MS,
  appendHistoryCheckpoint,
  canRedoHistory,
  canUndoHistory,
  clearHistoryStacks,
  emptyDocumentHistoryState,
  cloneBlocksForHistory,
  computeRedo,
  computeUndo,
  createBuilderDocumentCheckpoint,
  sanitizeHistoryValue,
  type BuilderDocumentCheckpoint,
  type BuilderHistoryStacks,
  type HistoryCheckpointReason,
} from './builder-document-history';

export {
  beginPropsEditSession,
  getIsApplyingHistory,
  resetPropsEditSession,
  runWithHistoryApply,
  shouldSkipHistoryPush,
} from './builder-document-history-session';
