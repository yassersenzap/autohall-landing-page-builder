import { useState } from 'react';
import { createEditorBlock, deleteEditorBlock } from '../editor/api/editorApi';
import type { EditorBlockType, EditorPageBlock } from './landing-block-catalog';
import {
  getLandingTemplate,
  type LandingTemplateId,
} from './landing-templates';

export type TemplateApplyMode = 'replace' | 'append';

type ApplyTemplateOptions = {
  mode?: TemplateApplyMode;
  existingBlocks?: EditorPageBlock[];
};

type ApplyTemplateResult = {
  applying: boolean;
  error: string | null;
  applyTemplate: (
    templateId: LandingTemplateId,
    options?: ApplyTemplateOptions,
  ) => Promise<EditorPageBlock[] | null>;
};

async function deleteAllBlocks(blocks: EditorPageBlock[], pageVersionId: string) {
  for (const block of blocks) {
    await deleteEditorBlock(pageVersionId, block.id);
  }
}

export function useApplyLandingTemplate(
  pageVersionId: string,
  canWrite: boolean,
): ApplyTemplateResult {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyTemplate(
    templateId: LandingTemplateId,
    options: ApplyTemplateOptions = {},
  ) {
    if (!canWrite) {
      setError('Votre rôle ne permet pas d’appliquer un modèle.');
      return null;
    }

    const template = getLandingTemplate(templateId);
    if (!template) {
      setError('Modèle introuvable.');
      return null;
    }

    const mode = options.mode ?? 'replace';
    const existing = options.existingBlocks ?? [];

    setApplying(true);
    setError(null);

    const created: EditorPageBlock[] = [];

    try {
      if (mode === 'replace' && existing.length > 0) {
        await deleteAllBlocks(existing, pageVersionId);
      }

      const startIndex = mode === 'append' ? existing.length : 0;

      for (let index = 0; index < template.blocks.length; index += 1) {
        const spec = template.blocks[index];
        const response = await createEditorBlock(pageVersionId, {
          blockType: spec.blockType as EditorBlockType,
          propsJson: spec.propsJson,
          sortOrder: startIndex + index + 1,
        });
        created.push(response.data);
      }
      return created;
    } catch {
      setError(
        created.length > 0
          ? 'Le modèle a été partiellement appliqué. Vérifiez les sections créées.'
          : 'Impossible d’appliquer le modèle. Réessayez.',
      );
      return created.length > 0 ? created : null;
    } finally {
      setApplying(false);
    }
  }

  return { applying, error, applyTemplate };
}
