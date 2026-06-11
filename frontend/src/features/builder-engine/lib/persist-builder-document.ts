import {
  createEditorBlock,
  deleteEditorBlock,
  fetchEditorBlocks,
  updateEditorBlock,
} from '@/features/editor/api/editorApi';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { getActivePaletteBlocks } from '../registry/block-registry';
import type { BuilderDocumentBlock } from '../types';
import { apiBlocksToBuilderBlocks } from './api-block-mapper';
import { assertNoBlobUrlsInBlocks } from './blob-url-guard';
import { stripStudioOnlyBlockProps } from '@/features/builder/block-variants/studio-block-metadata';

const VALID_BLOCK_TYPES = new Set(getActivePaletteBlocks().map((entry) => entry.type));

function assertBlockType(type: string): string {
  if (!VALID_BLOCK_TYPES.has(type)) {
    throw new Error(`Type de bloc non supporté : ${type}`);
  }
  return type;
}

function toBlockKey(blockId: string): string {
  return blockId.trim().toLowerCase();
}

/**
 * Synchronise le document Zustand vers l'API (créations, mises à jour, suppressions, ordre).
 * Re-fetch les blocs serveur pour aligner les IDs frontend sur la base.
 */
export async function persistBuilderDocument(
  pageVersionId: string,
  documentBlocks: BuilderDocumentBlock[],
  baseline: EditorPageBlock[],
): Promise<BuilderDocumentBlock[]> {
  assertNoBlobUrlsInBlocks(documentBlocks);

  const baselineIds = new Set(baseline.map((b) => b.id));
  const currentIds = new Set(documentBlocks.map((b) => b.id));

  for (const block of baseline) {
    if (!currentIds.has(block.id)) {
      await deleteEditorBlock(pageVersionId, block.id);
    }
  }

  for (let index = 0; index < documentBlocks.length; index += 1) {
    const block = documentBlocks[index];
    const sortOrder = index + 1;
    const blockType = assertBlockType(block.type);

    if (baselineIds.has(block.id)) {
      await updateEditorBlock(pageVersionId, block.id, {
        blockType,
        propsJson: stripStudioOnlyBlockProps(block.propsJson),
        sortOrder,
      });
    } else {
      await createEditorBlock(pageVersionId, {
        blockType,
        propsJson: stripStudioOnlyBlockProps(block.propsJson),
        sortOrder,
        blockKey: toBlockKey(block.id),
      });
    }
  }

  const refreshed = await fetchEditorBlocks(pageVersionId);
  return apiBlocksToBuilderBlocks(refreshed.data);
}
