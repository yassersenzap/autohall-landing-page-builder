import {
  BUILDER_PROPS_HISTORY_DEBOUNCE_MS,
  type HistoryCheckpointReason,
} from './builder-document-history';

/** Module-scoped flags — Studio-only, never exported or persisted. */
let isApplyingHistory = false;
let propsEditSessionActive = false;
let propsEditSessionTimer: ReturnType<typeof setTimeout> | null = null;

export function getIsApplyingHistory(): boolean {
  return isApplyingHistory;
}

export function runWithHistoryApply<T>(fn: () => T): T {
  isApplyingHistory = true;
  try {
    return fn();
  } finally {
    isApplyingHistory = false;
  }
}

export function shouldSkipHistoryPush(): boolean {
  return isApplyingHistory;
}

export function beginPropsEditSession(onBegin: (reason: HistoryCheckpointReason) => void): void {
  if (shouldSkipHistoryPush()) return;
  if (!propsEditSessionActive) {
    onBegin('edit_block_props');
    propsEditSessionActive = true;
  }
  if (propsEditSessionTimer) {
    clearTimeout(propsEditSessionTimer);
  }
  propsEditSessionTimer = setTimeout(() => {
    propsEditSessionActive = false;
    propsEditSessionTimer = null;
  }, BUILDER_PROPS_HISTORY_DEBOUNCE_MS);
}

export function resetPropsEditSession(): void {
  propsEditSessionActive = false;
  if (propsEditSessionTimer) {
    clearTimeout(propsEditSessionTimer);
    propsEditSessionTimer = null;
  }
}
