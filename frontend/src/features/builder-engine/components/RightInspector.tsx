import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore, selectActiveBlock } from '../store/builder-document.store';
import { BlockInspectorForm } from './inspector/BlockInspectorForm';

export function RightInspector() {
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const activeBlock = useBuilderDocumentStore(selectActiveBlock);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <header className="shrink-0 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
            Propriétés
          </p>
        </div>
        {activeBlock ? (
          <>
            <p className="mt-1.5 truncate text-sm font-semibold leading-tight tracking-tight">
              {activeBlock.label}
            </p>
            <p className="font-mono text-[0.6rem] text-muted-foreground">{activeBlock.type}</p>
          </>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {activeBlock ? (
          <BlockInspectorForm block={activeBlock} />
        ) : (
          <div
            className={cn(
              'flex min-h-[12rem] flex-col items-center justify-center rounded-lg',
              'border border-dashed border-border bg-muted/20 px-4 text-center',
            )}
          >
            <p className="text-sm font-medium text-foreground">Aucune sélection</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Sélectionnez une section du canvas pour modifier ses propriétés en direct.
            </p>
            {selectedBlockId ? (
              <p className="mt-2 font-mono text-[0.65rem] text-destructive">
                Réf. invalide : {selectedBlockId}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
