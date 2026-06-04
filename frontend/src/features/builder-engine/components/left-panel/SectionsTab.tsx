import { LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ShadButton } from '@/components/ui/primitives';
import { apiBlocksToBuilderBlocks } from '../../lib/api-block-mapper';
import { useApplyLandingTemplate } from '@/features/landing/useApplyLandingTemplate';
import {
  LANDING_TEMPLATES,
  type LandingTemplateId,
} from '@/features/landing/landing-templates';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import { MARKETING_SECTIONS } from '../../registry/marketing-sections';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

export function SectionsTab() {
  const { canWrite, pageVersionId } = useBuilderEditorContext();
  const addSection = useBuilderDocumentStore((s) => s.addSection);
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const setInitialBlocks = useBuilderDocumentStore((s) => s.setInitialBlocks);
  const setPageTheme = useBuilderDocumentStore((s) => s.setPageTheme);
  const [confirmTemplate, setConfirmTemplate] = useState<LandingTemplateId | null>(null);

  const { applying, applyTemplate } = useApplyLandingTemplate(
    pageVersionId ?? '',
    canWrite,
  );

  async function handleApplyTemplate(templateId: LandingTemplateId) {
    if (!pageVersionId) return;
    const existing = blocks.map((b) => ({
      id: b.id,
      pageVersionId: pageVersionId ?? '',
      blockKey: b.id,
      blockType: b.type,
      sortOrder: b.sortOrder,
      propsJson: b.propsJson as Record<string, unknown>,
      createdAt: '',
      updatedAt: '',
    }));
    const created = await applyTemplate(templateId, {
      mode: 'replace',
      existingBlocks: existing,
    });
    if (created?.length) {
      setInitialBlocks(apiBlocksToBuilderBlocks(created));
      const template = LANDING_TEMPLATES.find((t) => t.id === templateId);
      if (template?.themeDefaults) {
        setPageTheme(template.themeDefaults);
      }
    }
    setConfirmTemplate(null);
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <section className="mb-4">
        <p className="mb-2 flex items-center gap-1.5 px-0.5 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          Modèles de page V1
        </p>
        <p className="mb-2 px-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
          Applique une structure complète prête pour la démo. Remplace les sections existantes.
        </p>
        <ul className="space-y-2">
          {LANDING_TEMPLATES.map((template) => (
            <li
              key={template.id}
              className="rounded-lg border border-primary/20 bg-primary/5 p-2.5"
            >
              <p className="text-xs font-semibold">{template.name}</p>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                {template.description}
              </p>
              <p className="mt-1 text-[0.55rem] text-muted-foreground">
                {template.blocks.length} sections · {template.audience}
              </p>
              {confirmTemplate === template.id ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[0.65rem] text-amber-700">
                    Remplacer toutes les sections actuelles ?
                  </p>
                  <div className="flex gap-1">
                    <ShadButton
                      type="button"
                      size="sm"
                      className="flex-1 text-xs"
                      disabled={!canWrite || applying}
                      onClick={() => void handleApplyTemplate(template.id)}
                    >
                      Confirmer
                    </ShadButton>
                    <ShadButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setConfirmTemplate(null)}
                    >
                      Annuler
                    </ShadButton>
                  </div>
                </div>
              ) : (
                <ShadButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  disabled={!canWrite || applying || !pageVersionId}
                  onClick={() => setConfirmTemplate(template.id)}
                >
                  Appliquer le modèle
                </ShadButton>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="mb-2 px-0.5 text-xs font-semibold text-foreground">
          Sections rapides
        </p>
        <p className="mb-2 px-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
          Ajoute une composition en bas de page sans remplacer l’existant.
        </p>
        <ul className="space-y-2">
          {MARKETING_SECTIONS.map((section) => (
            <li
              key={section.id}
              className="rounded-lg border border-border bg-card p-2.5"
            >
              <div className="flex gap-2">
                <LayoutTemplate
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {section.label}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
              <ShadButton
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 w-full text-xs"
                disabled={!canWrite}
                onClick={() => addSection(section.blockTypes)}
              >
                <Plus className="mr-1 h-3 w-3" aria-hidden />
                Ajouter la section
              </ShadButton>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
