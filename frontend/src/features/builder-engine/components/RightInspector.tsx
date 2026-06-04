import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore, selectActiveBlock } from '../store/builder-document.store';

export function RightInspector() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const activeBlock = useBuilderDocumentStore(selectActiveBlock);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
            Inspecteur
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeBlock ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">{activeBlock.label}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{activeBlock.type}</p>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2 border-b border-border py-2">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="truncate font-mono text-[0.65rem]">{activeBlock.id}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border py-2">
                <dt className="text-muted-foreground">Ordre</dt>
                <dd className="tabular-nums">{activeBlock.sortOrder + 1}</dd>
              </div>
              <div className="flex justify-between gap-2 py-2">
                <dt className="text-muted-foreground">Sections</dt>
                <dd className="tabular-nums">{blocks.length}</dd>
              </div>
            </dl>
            <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-[0.65rem] leading-relaxed text-muted-foreground">
              Propriétés métier à brancher à l’étape suivante. Ce panneau affichera les champs
              du bloc sélectionné.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'flex min-h-[12rem] flex-col items-center justify-center rounded-lg',
              'border border-dashed border-border bg-muted/20 px-4 text-center',
            )}
          >
            <p className="text-sm font-medium text-foreground">Aucune sélection</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Cliquez sur une section du canvas pour inspecter ses propriétés.
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
