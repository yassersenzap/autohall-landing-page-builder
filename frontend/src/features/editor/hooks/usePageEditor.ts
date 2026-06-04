import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, logoutClient, meRequest } from '../../../lib/api';
import { fetchEditorBlocks } from '../api/editorApi';
import { useBlockMutations } from './useBlockMutations';
import { useBlockSelection } from './useBlockSelection';
import type {
  EditorBlockType,
  EditorCreateBlockPayload,
  EditorPageBlock,
} from '../types/editor.types';

type UsePageEditorInput = {
  pageVersionId: string;
  navigateToLogin: () => void;
};

function canManagePageBlocks(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}

export function usePageEditor({ pageVersionId, navigateToLogin }: UsePageEditorInput) {
  const [blocks, setBlocks] = useState<EditorPageBlock[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedBlockId,
    selectedBlock,
    selectBlock,
    ensureSelectionAfterLoad,
  } = useBlockSelection(blocks);

  const canWrite = role ? canManagePageBlocks(role) : false;

  const mutations = useBlockMutations({
    pageVersionId,
    canWrite,
    setBlocks,
    onSelectBlock: selectBlock,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profile, blockResponse] = await Promise.all([
        meRequest(),
        fetchEditorBlocks(pageVersionId),
      ]);
      setRole(profile.data.role);
      const ordered = [...blockResponse.data].sort((a, b) => a.sortOrder - b.sortOrder);
      setBlocks(ordered);
      ensureSelectionAfterLoad(ordered);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigateToLogin();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Impossible de charger l’éditeur.');
    } finally {
      setLoading(false);
    }
  }, [ensureSelectionAfterLoad, navigateToLogin, pageVersionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const status = useMemo(
    () => ({
      loading,
      error: error ?? mutations.mutationError,
      role,
      canWrite,
      mutationBusy: mutations.mutationBusy,
    }),
    [canWrite, error, loading, mutations.mutationBusy, mutations.mutationError, role],
  );

  async function createBlock(input: EditorCreateBlockPayload) {
    await mutations.createBlock(input);
  }

  async function updateBlock(
    blockId: string,
    payload: { blockType?: EditorBlockType; propsJson?: Record<string, unknown> },
  ) {
    await mutations.updateBlock(blockId, payload);
  }

  async function deleteBlock(blockId: string) {
    await mutations.deleteBlock(blockId);
  }

  async function moveBlock(blockId: string, toIndex: number) {
    await mutations.moveBlock(blockId, toIndex);
  }

  async function duplicateBlock(blockId: string) {
    await mutations.duplicateBlock(blockId);
  }

  return {
    blocks,
    selectedBlockId,
    selectedBlock,
    selectBlock,
    status,
    load,
    createBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    clearEditorError: mutations.clearMutationError,
  };
}
