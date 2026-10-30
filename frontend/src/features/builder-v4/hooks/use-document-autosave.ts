import { useEffect, useRef } from 'react';
import { useBuilderV4Store } from '../store/document.store';

const AUTOSAVE_MS = 2000;

export function useDocumentAutosave() {
  const documentRevision = useBuilderV4Store((s) => s.documentRevision);
  const hasUnsavedChanges = useBuilderV4Store((s) => s.hasUnsavedChanges);
  const isSaving = useBuilderV4Store((s) => s.isSaving);
  const saveDocument = useBuilderV4Store((s) => s.saveDocument);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRevision = useRef(documentRevision);

  useEffect(() => {
    if (documentRevision === lastRevision.current) return;
    lastRevision.current = documentRevision;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!useBuilderV4Store.getState().hasUnsavedChanges) return;
      void saveDocument();
    }, AUTOSAVE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [documentRevision, saveDocument]);

  return { hasUnsavedChanges, isSaving };
}
