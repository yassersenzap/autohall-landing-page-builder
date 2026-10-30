import { create } from 'zustand';
import { readTextField, writeTextFieldPatch } from '../lib/editable-text';
import type { EditableFieldKey, EditingSession } from '../types/editable.types';
import { useBuilderV4Store } from './document.store';

export type EditingState = {
  session: EditingSession | null;
  startEditing: (nodeId: string, fieldKey: EditableFieldKey) => boolean;
  commitEditing: (text: string) => void;
  cancelEditing: () => void;
  isEditing: (nodeId: string, fieldKey: EditableFieldKey) => boolean;
  isAnyEditing: () => boolean;
};

export const useEditingStore = create<EditingState>((set, get) => ({
  session: null,

  startEditing: (nodeId, fieldKey) => {
    const node = useBuilderV4Store.getState().getNode(nodeId);
    if (!node) return false;
    const originalText = readTextField(node, fieldKey);
    useBuilderV4Store.getState().selectNode(nodeId);
    set({ session: { nodeId, fieldKey, originalText } });
    return true;
  },

  commitEditing: (text) => {
    const { session } = get();
    if (!session) return;
    const node = useBuilderV4Store.getState().getNode(session.nodeId);
    if (!node) {
      set({ session: null });
      return;
    }
    const patch = writeTextFieldPatch(node, session.fieldKey, text.trim());
    if (patch) {
      useBuilderV4Store.getState().updateNodeProps(session.nodeId, patch);
    }
    set({ session: null });
  },

  cancelEditing: () => {
    set({ session: null });
  },

  isEditing: (nodeId, fieldKey) => {
    const { session } = get();
    return session?.nodeId === nodeId && session.fieldKey === fieldKey;
  },

  isAnyEditing: () => get().session !== null,
}));
