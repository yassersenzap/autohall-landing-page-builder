import { LayoutTemplate, Plus } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import { MARKETING_SECTIONS } from '../../registry/marketing-sections';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

export function SectionsTab() {
  const { canWrite } = useBuilderEditorContext();
  const addSection = useBuilderDocumentStore((s) => s.addSection);

  return (
    <div className="h-full overflow-y-auto p-2">
      <p className="mb-2 px-0.5 text-xs leading-relaxed text-muted-foreground">
        Ajoutez une composition marketing complète en un clic. Chaque section crée
        des blocs réels, compatibles aperçu et export.
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
                <p className="mt-1 font-mono text-[0.55rem] text-muted-foreground/80">
                  {section.blockTypes.join(' · ')}
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
    </div>
  );
}
