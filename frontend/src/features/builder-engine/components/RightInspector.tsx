import { useState } from 'react';
import { Palette, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore, selectActiveBlock } from '../store/builder-document.store';
import { BlockInspectorForm } from './inspector/BlockInspectorForm';
import { PageSettingsPanel } from './inspector/PageSettingsPanel';

type InspectorMode = 'block' | 'page';

export function RightInspector() {
  const [mode, setMode] = useState<InspectorMode>('block');
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const activeBlock = useBuilderDocumentStore(selectActiveBlock);

  return (
    <aside className="builder-panel builder-panel--right flex h-full min-h-0 w-full flex-col border-t border-border bg-builder lg:max-h-none lg:border-l lg:border-t-0">
      <header className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-0.5 rounded-md border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 rounded px-2 py-1 text-[0.65rem] font-medium',
                mode === 'block' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
              onClick={() => setMode('block')}
            >
              <Settings2 className="h-3 w-3" aria-hidden />
              Bloc
            </button>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 rounded px-2 py-1 text-[0.65rem] font-medium',
                mode === 'page' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
              onClick={() => setMode('page')}
            >
              <Palette className="h-3 w-3" aria-hidden />
              Page
            </button>
          </div>
        </div>
        {mode === 'block' && activeBlock ? (
          <>
            <p className="mt-2 truncate text-sm font-semibold leading-tight">
              {activeBlock.label}
            </p>
            <p className="font-mono text-[0.6rem] text-muted-foreground">{activeBlock.type}</p>
          </>
        ) : mode === 'page' ? (
          <p className="mt-2 text-sm font-semibold">Réglages de la page</p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2.5">
        {mode === 'page' ? (
          <PageSettingsPanel />
        ) : activeBlock ? (
          <BlockInspectorForm block={activeBlock} />
        ) : (
          <div
            className={cn(
              'flex min-h-[10rem] flex-col items-center justify-center rounded-lg',
              'border border-dashed border-border bg-muted/20 px-3 text-center',
            )}
          >
            <p className="text-sm font-medium text-foreground">Aucune section sélectionnée</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Cliquez une section du canvas ou utilisez l’onglet Plan.
            </p>
            {selectedBlockId ? (
              <p className="mt-2 font-mono text-[0.65rem] text-destructive">
                Référence invalide
              </p>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
