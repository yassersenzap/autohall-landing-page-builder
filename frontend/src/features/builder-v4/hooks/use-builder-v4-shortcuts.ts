import { useEffect } from 'react';
import { useBuilderV4Store } from '../store/document.store';
import { useEditingStore } from '../store/editing.store';
import { useBuilderUIStore } from '../store/builder-ui.store';
import { canDuplicateCampaignNode, duplicateUsesClipboard } from '../lib/campaign-duplicate';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export function useBuilderV4Shortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const globalMeta = event.ctrlKey || event.metaKey;

      // Cmd/Ctrl+K — command palette, works everywhere (even while typing)
      if (globalMeta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const ui = useBuilderUIStore.getState();
        if (ui.commandPaletteOpen) ui.closeCommandPalette();
        else ui.openCommandPalette();
        return;
      }

      if (isEditableTarget(event.target)) return;

      const store = useBuilderV4Store.getState();
      const editing = useEditingStore.getState();
      const selectedIds = store.selectedNodeIds;
      const selectedId = store.selectedNodeId;
      const rootId = store.document.rootId;
      const meta = globalMeta;

      if (event.key === 'Escape') {
        if (editing.isAnyEditing()) return;
        if (selectedIds.length > 0) {
          event.preventDefault();
          store.clearSelection();
        }
        return;
      }

      if (ARROW_KEYS.has(event.key)) {
        if (selectedIds.length === 0 || editing.isAnyEditing()) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
        store.nudgeSelectedNodes(dx, dy);
        return;
      }

      if (event.key === 'F2') {
        if (editing.isAnyEditing()) return;
        if (!selectedId) return;
        event.preventDefault();
        store.setRenamingNodeId(selectedId);
        store.setLeftSidebarTab('layers');
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedIds.length === 0) return;
        if (selectedIds.length === 1 && selectedId === rootId) return;
        event.preventDefault();
        if (selectedIds.length > 1) {
          store.deleteSelectedNodes();
        } else if (selectedId) {
          store.deleteNode(selectedId);
        }
        return;
      }

      if (meta && event.key.toLowerCase() === 'd') {
        if (selectedIds.length === 0) return;
        event.preventDefault();
        if (selectedIds.length > 1) {
          store.duplicateSelectedNodes();
        } else if (selectedId && selectedId !== rootId) {
          const node = store.document.nodes[selectedId];
          if (canDuplicateCampaignNode(store.document, selectedId) || duplicateUsesClipboard(node)) {
            store.duplicateNode(selectedId);
          }
        }
        return;
      }

      if (meta && event.key.toLowerCase() === 'c') {
        if (!selectedId || selectedId === rootId) return;
        event.preventDefault();
        store.copySelection();
        return;
      }

      if (meta && event.key.toLowerCase() === 'v') {
        if (!store.clipboard) return;
        event.preventDefault();
        store.pasteClipboard();
        return;
      }

      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void store.saveDocument();
        return;
      }

      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        if (!store.canUndoDocument()) return;
        event.preventDefault();
        store.undoDocument();
        return;
      }

      if (meta && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        if (!store.canRedoDocument()) return;
        event.preventDefault();
        store.redoDocument();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
