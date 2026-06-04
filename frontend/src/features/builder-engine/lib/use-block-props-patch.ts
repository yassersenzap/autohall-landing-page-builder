import { useCallback } from 'react';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { sanitizePropsPatch } from './sanitize-props-patch';

/** Patch typé pour l'inspecteur (validation future par schéma). */
export function useBlockPropsPatch(blockId: string) {
  const { canWrite } = useBuilderEditorContext();
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const patchString = useCallback(
    (key: string, value: string) => {
      if (!canWrite) return;
      updateBlockProps(blockId, sanitizePropsPatch({ [key]: value }));
    },
    [blockId, canWrite, updateBlockProps],
  );

  const patchList = useCallback(
    (key: string, items: Record<string, unknown>[]) => {
      if (!canWrite) return;
      updateBlockProps(blockId, sanitizePropsPatch({ [key]: items }));
    },
    [blockId, canWrite, updateBlockProps],
  );

  return { patchString, patchList, readOnly: !canWrite };
}
