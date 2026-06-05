import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRegistryEntry } from '../../registry/block-registry';
import { useBuilderDocumentStore } from '../../store/builder-document.store';

export function NavigatorTab() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-medium text-foreground">Page vide</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ajoutez une section ou un bloc depuis les onglets Blocs ou Sections.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-1 overflow-y-auto p-2" aria-label="Plan de la page">
      {blocks.map((block, index) => {
        const entry = getRegistryEntry(block.type);
        const selected = block.id === selectedBlockId;
        return (
          <li key={block.id}>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors',
                selected
                  ? 'border-primary/50 bg-primary/5 text-foreground'
                  : 'border-transparent bg-card hover:border-border hover:bg-accent/30',
              )}
              onClick={() => selectBlock(block.id)}
            >
              <GripVertical
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
              <span className="font-mono text-[0.6rem] text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {entry?.label ?? block.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
