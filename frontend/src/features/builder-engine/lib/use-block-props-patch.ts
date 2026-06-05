import { useCallback } from 'react';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { extractDesignRaw } from './block-style';
import { sanitizePropsPatch } from './sanitize-props-patch';

/** Patch typé pour l'inspecteur. */
export function useBlockPropsPatch(blockId: string) {
  const { canWrite } = useBuilderEditorContext();
  const updateBlockProps = useBuilderDocumentStore((s) => s.updateBlockProps);

  const applyPatch = useCallback(
    (patch: Record<string, unknown>) => {
      if (!canWrite) return;
      const safe = sanitizePropsPatch(patch);
      if (Object.keys(safe).length === 0) return;

      const exists = useBuilderDocumentStore.getState().blocks.some((b) => b.id === blockId);
      if (!exists) return;
      updateBlockProps(blockId, safe);
    },
    [blockId, canWrite, updateBlockProps],
  );

  const patchString = useCallback(
    (key: string, value: string) => applyPatch({ [key]: value }),
    [applyPatch],
  );

  const patchList = useCallback(
    (key: string, items: Record<string, unknown>[]) => applyPatch({ [key]: items }),
    [applyPatch],
  );

  const patchProps = useCallback(
    (patch: Record<string, unknown>) => applyPatch(patch),
    [applyPatch],
  );

  const patchDesign = useCallback(
    (partial: Record<string, unknown>) => {
      const block = useBuilderDocumentStore.getState().blocks.find((b) => b.id === blockId);
      const propsSource = (block?.propsJson ?? {}) as Record<string, unknown>;
      const current = extractDesignRaw(propsSource);
      patchProps({ design: { ...current, ...partial } });
    },
    [blockId, patchProps],
  );

  return { patchString, patchList, patchProps, patchDesign, readOnly: !canWrite };
}
