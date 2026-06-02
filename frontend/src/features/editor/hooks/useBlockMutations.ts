import { useState, type Dispatch, type SetStateAction } from 'react';
import { ApiError } from '../../../lib/api';
import {
  createEditorBlock,
  deleteEditorBlock,
  updateEditorBlock,
} from '../api/editorApi';
import type {
  EditorBlockType,
  EditorCreateBlockPayload,
  EditorPageBlock,
} from '../types/editor.types';

type MutationState = {
  busy: boolean;
  error: string | null;
};

type UseBlockMutationsInput = {
  pageVersionId: string;
  canWrite: boolean;
  setBlocks: Dispatch<SetStateAction<EditorPageBlock[]>>;
  onSelectBlock: (blockId: string | null) => void;
};

function normalizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

export function useBlockMutations({
  pageVersionId,
  canWrite,
  setBlocks,
  onSelectBlock,
}: UseBlockMutationsInput) {
  const [state, setState] = useState<MutationState>({ busy: false, error: null });

  function guardWrite(): boolean {
    if (canWrite) return true;
    setState({ busy: false, error: 'Votre rôle ne permet pas de modifier les blocs.' });
    return false;
  }

  async function createBlock(payload: EditorCreateBlockPayload) {
    if (!guardWrite()) return;
    setState({ busy: true, error: null });
    try {
      const created = await createEditorBlock(pageVersionId, payload);
      setBlocks((previous) =>
        [...previous, created.data].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      onSelectBlock(created.data.id);
      setState({ busy: false, error: null });
    } catch (error) {
      setState({
        busy: false,
        error: normalizeError(error, 'Impossible de créer le bloc.'),
      });
    }
  }

  async function updateBlock(
    blockId: string,
    input: { blockType?: EditorBlockType; propsJson?: Record<string, unknown> },
  ) {
    if (!guardWrite()) return;
    setState({ busy: true, error: null });
    try {
      const updated = await updateEditorBlock(pageVersionId, blockId, input);
      setBlocks((previous) =>
        previous
          .map((block) => (block.id === blockId ? updated.data : block))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setState({ busy: false, error: null });
    } catch (error) {
      setState({
        busy: false,
        error: normalizeError(error, 'Impossible de mettre à jour le bloc.'),
      });
    }
  }

  async function deleteBlock(blockId: string) {
    if (!guardWrite()) return;
    setState({ busy: true, error: null });
    try {
      await deleteEditorBlock(pageVersionId, blockId);
      setBlocks((previous) => {
        const next = previous.filter((block) => block.id !== blockId);
        if (next.length === 0) {
          onSelectBlock(null);
        } else if (!next.some((block) => block.id === blockId)) {
          onSelectBlock(next[0].id);
        }
        return next;
      });
      setState({ busy: false, error: null });
    } catch (error) {
      setState({
        busy: false,
        error: normalizeError(error, 'Impossible de supprimer le bloc.'),
      });
    }
  }

  async function moveBlock(blockId: string, toIndex: number) {
    if (!guardWrite()) return;
    setState({ busy: true, error: null });

    let snapshot: EditorPageBlock[] = [];
    setBlocks((previous) => {
      snapshot = previous;
      const currentIndex = previous.findIndex((block) => block.id === blockId);
      if (currentIndex < 0 || toIndex < 0 || toIndex >= previous.length) {
        return previous;
      }
      const reordered = [...previous];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered.map((block, index) => ({ ...block, sortOrder: index + 1 }));
    });

    try {
      const current = snapshot.find((block) => block.id === blockId);
      if (!current) {
        setState({ busy: false, error: null });
        return;
      }
      await updateEditorBlock(pageVersionId, blockId, { sortOrder: toIndex + 1 });
      setState({ busy: false, error: null });
    } catch (error) {
      setBlocks(snapshot);
      setState({
        busy: false,
        error: normalizeError(error, 'Impossible de réordonner le bloc.'),
      });
    }
  }

  return {
    mutationBusy: state.busy,
    mutationError: state.error,
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    clearMutationError: () => setState((previous) => ({ ...previous, error: null })),
  };
}
