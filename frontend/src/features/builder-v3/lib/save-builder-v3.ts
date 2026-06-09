import { ApiError } from '@/lib/api';
import { fetchEditorBlocks } from '@/features/editor/api/editorApi';
import { updatePageVersionById } from '@/lib/page-versions';
import { writeLocalDraft } from '@/features/builder-engine/lib/builder-local-draft';
import { persistBuilderDocument } from '@/features/builder-engine/lib/persist-builder-document';
import { assertNoBlobUrlsInDocument } from '@/features/builder-engine/lib/blob-url-guard';
import {
  forcePersistBuilderDocument,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';

export class BuilderSaveError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'BuilderSaveError';
  }
}

function formatSaveError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Session expirée. Reconnectez-vous pour sauvegarder.';
    }
    if (err.status === 403) {
      return 'Vous n’avez pas les droits pour modifier cette page.';
    }
    return err.message;
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return 'Échec de la sauvegarde. Réessayez.';
}

async function persistPageVersionTheme(pageVersionId: string): Promise<void> {
  const state = useBuilderDocumentStore.getState();
  await updatePageVersionById(pageVersionId, {
    themeJson: state.buildThemeJsonPayload(),
  });
}

/** Persiste le document V3 vers l'API PageBlock + themeJson PageVersion. */
export async function saveBuilderDocumentDesign(pageVersionId: string): Promise<void> {
  const state = useBuilderDocumentStore.getState();

  try {
    assertNoBlobUrlsInDocument({
      blocks: state.blocks,
      pageSettings: state.pageSettings,
    });

    const baselineResponse = await fetchEditorBlocks(pageVersionId);
    const syncedBlocks = await persistBuilderDocument(
      pageVersionId,
      state.blocks,
      baselineResponse.data,
    );

    await persistPageVersionTheme(pageVersionId);

    useBuilderDocumentStore.getState().applyServerSnapshot({
      blocks: syncedBlocks,
      pageTheme: state.pageTheme,
      pageSettings: state.pageSettings,
    });

    forcePersistBuilderDocument();

    writeLocalDraft({
      version: 1,
      pageVersionId,
      updatedAt: Date.now(),
      blocks: syncedBlocks,
      pageTheme: state.pageTheme,
      pageSettings: state.pageSettings,
      themeDirty: false,
      selectedBlockId: state.selectedBlockId,
    });
  } catch (err) {
    throw new BuilderSaveError(formatSaveError(err), { cause: err });
  }
}
