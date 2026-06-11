import { useEffect } from 'react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

/** Studio keyboard shortcuts for canvas block editing and undo/redo. */
export function useStudioCanvasShortcuts(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      const state = useBuilderDocumentStore.getState();
      const inEditable = isEditableTarget(event.target);

      if ((event.metaKey || event.ctrlKey) && !inEditable) {
        const key = event.key.toLowerCase();
        if (key === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            state.redo();
          } else {
            state.undo();
          }
          return;
        }
        if (key === 'y') {
          event.preventDefault();
          state.redo();
          return;
        }
      }

      if (inEditable) return;

      const selectedId = state.selectedBlockId;

      if (event.key === 'Escape') {
        if (selectedId) {
          event.preventDefault();
          state.selectBlock(null);
        }
        return;
      }

      if (!selectedId) return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        state.deleteBlock(selectedId);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        state.duplicateBlock(selectedId);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
