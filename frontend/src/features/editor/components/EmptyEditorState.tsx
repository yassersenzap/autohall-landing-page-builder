import { EmptyState } from '../../../components/ui/EmptyState';
import type { EditorBlockType } from '../types/editor.types';

type EmptyEditorStateProps = {
  canWrite: boolean;
  onQuickAdd?: (type: EditorBlockType) => void;
};

export function EmptyEditorState({ canWrite, onQuickAdd }: EmptyEditorStateProps) {
  return (
    <EmptyState
      title="Votre canvas est vide"
      description="Ajoutez un premier bloc pour démarrer la composition de la landing."
      action={
        canWrite && onQuickAdd ? (
          <button
            type="button"
            className="ui-btn ui-btn--primary ui-btn--md"
            onClick={() => onQuickAdd('hero')}
          >
            Ajouter un Hero
          </button>
        ) : undefined
      }
    />
  );
}
