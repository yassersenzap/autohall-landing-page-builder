import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { SortableBlockItem } from './SortableBlockItem';

export function CanvasArea() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <main
      className={cn(
        'relative flex min-h-0 min-w-0 flex-1 flex-col',
        'bg-neutral-100 dark:bg-neutral-950',
      )}
    >
      <div className="shrink-0 border-b border-border/50 bg-neutral-200/50 px-4 py-2 dark:bg-neutral-900/80">
        <p className="text-center text-[0.65rem] font-medium text-muted-foreground">
          Canvas · {blocks.length} section{blocks.length === 1 ? '' : 's'}
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-6',
          'bg-[radial-gradient(circle_at_1px_1px,rgba(128,128,128,0.12)_1px,transparent_0)]',
          '[background-size:20px_20px]',
          isOver && 'ring-2 ring-inset ring-primary/25',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) selectBlock(null);
        }}
      >
        <div
          className={cn(
            'w-full max-w-[72rem] rounded-xl border border-border/60 bg-background shadow-xl',
            'min-h-[min(70vh,40rem)]',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-border px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Page · 1152px (72rem)
            </span>
          </div>

          <div className="min-w-0 overflow-hidden p-0">
            {blocks.length === 0 ? (
              <div className="p-4">
                <div className="flex min-h-[16rem] flex-col items-center justify-center border border-dashed border-border bg-muted/20 px-6 text-center">
                  <LayoutTemplate className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">Canvas vide</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Glissez un composant depuis le panneau gauche ou cliquez sur + pour
                    commencer.
                  </p>
                </div>
              </div>
            ) : (
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-2 p-2">
                  {blocks.map((block) => (
                    <SortableBlockItem key={block.id} block={block} />
                  ))}
                </ul>
              </SortableContext>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
