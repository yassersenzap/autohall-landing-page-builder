import { writeLocalDraft } from '@/features/builder-engine/lib/builder-local-draft';
import {
  forcePersistBuilderDocument,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';

/** Mock API — remplacer par persistBuilderDocument quand le baseline serveur est branché. */
async function mockSaveToApi(pageVersionId: string): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  void pageVersionId;
}

export async function saveBuilderDocumentDesign(pageVersionId: string): Promise<void> {
  const state = useBuilderDocumentStore.getState();

  forcePersistBuilderDocument();

  writeLocalDraft({
    version: 1,
    pageVersionId,
    updatedAt: Date.now(),
    blocks: state.blocks,
    pageTheme: state.pageTheme,
    pageSettings: state.pageSettings,
    themeDirty: state.themeDirty,
    selectedBlockId: state.selectedBlockId,
  });

  await mockSaveToApi(pageVersionId);
}
