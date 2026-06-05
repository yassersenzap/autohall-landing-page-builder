import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import type { PageThemeDraft } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { isBuilderDocumentDirty } from './compare-builder-document';

const STORAGE_PREFIX = 'autohall-builder-draft:';

export type BuilderLocalDraft = {
  version: 1;
  pageVersionId: string;
  updatedAt: number;
  blocks: BuilderDocumentBlock[];
  pageTheme: PageThemeDraft;
  themeDirty: boolean;
  selectedBlockId: string | null;
};

function storageKey(pageVersionId: string): string {
  return `${STORAGE_PREFIX}${pageVersionId}`;
}

export function readLocalDraft(pageVersionId: string): BuilderLocalDraft | null {
  try {
    const raw = localStorage.getItem(storageKey(pageVersionId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BuilderLocalDraft;
    if (parsed.version !== 1 || parsed.pageVersionId !== pageVersionId) {
      return null;
    }
    if (!Array.isArray(parsed.blocks)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalDraft(draft: BuilderLocalDraft): void {
  try {
    localStorage.setItem(storageKey(draft.pageVersionId), JSON.stringify(draft));
  } catch {
    // Quota ou mode privé — ne bloque pas l’éditeur
  }
}

export function clearLocalDraft(pageVersionId: string): void {
  try {
    localStorage.removeItem(storageKey(pageVersionId));
  } catch {
    // Ignore
  }
}

/**
 * Propose la restauration si le draft local diffère de l’état serveur chargé.
 */
export function shouldOfferLocalDraftRestore(
  draft: BuilderLocalDraft,
  serverBlocks: EditorPageBlock[],
): boolean {
  return isBuilderDocumentDirty(draft.blocks, serverBlocks, draft.themeDirty);
}
