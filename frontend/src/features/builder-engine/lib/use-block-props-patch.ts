import { useCallback } from 'react';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { sanitizePropsPatch } from './sanitize-props-patch';

/** Patch typé string pour les champs inspecteur (validation future par schéma). */
export function useBlockPropsPatch(blockId: string) {
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const patchString = useCallback(
    (key: string, value: string) => {
      updateBlockProps(blockId, sanitizePropsPatch({ [key]: value }));
    },
    [blockId, updateBlockProps],
  );

  return { patchString };
}
