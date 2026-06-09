import { fetchEditorBlocks } from '@/features/editor/api/editorApi';
import { fetchPageVersionById } from '@/lib/page-versions';
import { apiBlocksToBuilderBlocks } from './api-block-mapper';
import { readLocalDraft } from './builder-local-draft';
import { parsePageSettingsFromJson, parsePageThemeFromJson } from './page-theme';
import type { PageSettingsDraft, PageThemeDraft } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';

export type BuilderDocumentLoadSource = 'server' | 'localDraft' | 'localStorage';

export type LoadedBuilderDocument = {
  blocks: BuilderDocumentBlock[];
  pageTheme: PageThemeDraft;
  pageSettings: PageSettingsDraft;
  landingPageId: string | null;
  source: BuilderDocumentLoadSource;
};

/**
 * Conflict strategy:
 * - Server blocks are the source of truth when at least one block exists.
 * - Local draft (autohall-builder-draft) is used only when the server has zero blocks.
 * - Zustand localStorage rehydrate is the last fallback (handled by hydrateBuilderDocumentStore).
 *
 * Theme/pageSettings load from GET /api/page-versions/:id — not the preview API.
 */
export async function loadBuilderDocumentFromApi(
  pageVersionId: string,
): Promise<LoadedBuilderDocument> {
  const [blocksResponse, versionResponse] = await Promise.all([
    fetchEditorBlocks(pageVersionId),
    fetchPageVersionById(pageVersionId).catch(() => null),
  ]);

  const serverBlocks = apiBlocksToBuilderBlocks(blocksResponse.data);
  const version = versionResponse?.data ?? null;
  const landingPageId = version?.landingPageId ?? null;
  const pageTheme = parsePageThemeFromJson(version?.themeJson ?? null);
  const pageSettings = parsePageSettingsFromJson(version?.themeJson ?? null);

  if (serverBlocks.length > 0) {
    return {
      blocks: serverBlocks,
      pageTheme,
      pageSettings,
      landingPageId,
      source: 'server',
    };
  }

  const localDraft = readLocalDraft(pageVersionId);
  if (localDraft && localDraft.blocks.length > 0) {
    return {
      blocks: localDraft.blocks,
      pageTheme: localDraft.pageTheme,
      pageSettings: localDraft.pageSettings ?? parsePageSettingsFromJson(null),
      landingPageId,
      source: 'localDraft',
    };
  }

  return {
    blocks: [],
    pageTheme,
    pageSettings,
    landingPageId,
    source: 'localStorage',
  };
}
