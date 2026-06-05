import { useCallback } from 'react';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { extractDesignRaw } from './block-style';
import { sanitizePropsPatch } from './sanitize-props-patch';

/** Patch typé pour l'inspecteur (validation future par schéma). */
export function useBlockPropsPatch(blockId: string) {
  const { canWrite } = useBuilderEditorContext();
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const patchString = useCallback(
    (key: string, value: string) => {
      if (!canWrite) return;
      const exists = useBuilderDocumentStore.getState().blocks.some((b) => b.id === blockId);
      if (!exists) return;
      updateBlockProps(blockId, sanitizePropsPatch({ [key]: value }));
    },
    [blockId, canWrite, updateBlockProps],
  );

  const patchList = useCallback(
    (key: string, items: Record<string, unknown>[]) => {
      if (!canWrite) return;
      const exists = useBuilderDocumentStore.getState().blocks.some((b) => b.id === blockId);
      if (!exists) return;
      updateBlockProps(blockId, sanitizePropsPatch({ [key]: items }));
    },
    [blockId, canWrite, updateBlockProps],
  );

  const patchProps = useCallback(
    (patch: Record<string, unknown>) => {
      if (!canWrite) return;
      const exists = useBuilderDocumentStore.getState().blocks.some((b) => b.id === blockId);
      if (!exists) return;
      updateBlockProps(blockId, sanitizePropsPatch(patch));
    },
    [blockId, canWrite, updateBlockProps],
  );

  const patchDesign = useCallback(
    (partial: Record<string, unknown>) => {
      if (!canWrite) return;
      const block = useBuilderDocumentStore.getState().blocks.find((b) => b.id === blockId);
      const current = extractDesignRaw(
        (block?.propsJson ?? {}) as Record<string, unknown>,
      );
      patchProps({ design: { ...current, ...partial } });
    },
    [blockId, canWrite, patchProps],
  );

  return { patchString, patchList, patchProps, patchDesign, readOnly: !canWrite };
}
