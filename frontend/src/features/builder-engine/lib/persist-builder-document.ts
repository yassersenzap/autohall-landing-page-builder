import {
  createEditorBlock,
  deleteEditorBlock,
  updateEditorBlock,
} from '@/features/editor/api/editorApi';
import type {
  EditorBlockType,
  EditorPageBlock,
} from '@/features/editor/types/editor.types';
import { EDITOR_BLOCK_TYPES } from '@/features/landing/landing-block-catalog';
import type { BuilderDocumentBlock } from '../types';

const VALID_BLOCK_TYPES = new Set<string>(EDITOR_BLOCK_TYPES);

function assertBlockType(type: string): EditorBlockType {
  if (!VALID_BLOCK_TYPES.has(type)) {
    throw new Error(`Type de bloc non supporté : ${type}`);
  }
  return type as EditorBlockType;
}

/**
 * Synchronise le document Zustand vers l'API (créations, mises à jour, suppressions, ordre).
 */
export async function persistBuilderDocument(
  pageVersionId: string,
  documentBlocks: BuilderDocumentBlock[],
  baseline: EditorPageBlock[],
): Promise<void> {
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
        propsJson: block.propsJson,
        sortOrder,
      });
    } else {
      await createEditorBlock(pageVersionId, {
        blockType,
        propsJson: block.propsJson,
        sortOrder,
      });
    }
  }
}
