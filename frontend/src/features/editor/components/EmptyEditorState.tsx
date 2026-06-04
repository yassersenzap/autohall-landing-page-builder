import { LayoutTemplate, Sparkles } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import type { EditorBlockType } from '../types/editor.types';

type EmptyEditorStateProps = {
  canWrite: boolean;
  onQuickAdd?: (type: EditorBlockType) => void;
};

export function EmptyEditorState({ canWrite, onQuickAdd }: EmptyEditorStateProps) {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50">
        <LayoutTemplate className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Composez votre landing</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Choisissez un modèle dans le panneau de gauche ou insérez votre première section.
      </p>
      {canWrite && onQuickAdd ? (
        <ShadButton type="button" className="mt-6" onClick={() => onQuickAdd('hero')}>
          <Sparkles className="h-4 w-4" />
          Ajouter une bannière
        </ShadButton>
      ) : null}
    </div>
  );
}
