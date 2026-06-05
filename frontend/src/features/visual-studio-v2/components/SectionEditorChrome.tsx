import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { useStudioV2Actions } from '../context/StudioV2Context';

type SectionEditorChromeProps = {
  sectionId?: string;
  children: ReactNode;
};

export function SectionEditorChrome({ sectionId, children }: SectionEditorChromeProps) {
  const actions = useStudioV2Actions();

  return (
    <div className="vs2-section-chrome" data-section-id={sectionId}>
      {children}
      {actions?.canWrite ? (
        <div className="vs2-section-chrome__insert">
          <button
            type="button"
            className="vs2-section-chrome__btn"
            onClick={() => actions.onInsertSectionAfter?.(sectionId)}
            title="Ajouter une section après"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Ajouter une section
          </button>
        </div>
      ) : null}
    </div>
  );
}
