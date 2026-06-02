import { useState } from 'react';
import { createEditorBlock } from '../editor/api/editorApi';
import type { EditorPageBlock } from './landing-block-catalog';
import {
  getLandingTemplate,
  type LandingTemplateId,
} from './landing-templates';

type ApplyTemplateResult = {
  applying: boolean;
  error: string | null;
  applyTemplate: (templateId: LandingTemplateId) => Promise<EditorPageBlock[] | null>;
};

export function useApplyLandingTemplate(
  pageVersionId: string,
  canWrite: boolean,
): ApplyTemplateResult {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyTemplate(templateId: LandingTemplateId) {
    if (!canWrite) {
      setError('Votre rôle ne permet pas d’appliquer un modèle.');
      return null;
    }

    const template = getLandingTemplate(templateId);
    if (!template) {
      setError('Modèle introuvable.');
      return null;
    }

    setApplying(true);
    setError(null);

    const created: EditorPageBlock[] = [];

    try {
      for (let index = 0; index < template.blocks.length; index += 1) {
        const spec = template.blocks[index];
        const response = await createEditorBlock(pageVersionId, {
          blockType: spec.blockType,
          propsJson: spec.propsJson,
          sortOrder: index,
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
