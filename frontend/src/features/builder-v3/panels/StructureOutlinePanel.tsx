import { Trash2 } from 'lucide-react';
import { getCatalogItem } from '@/features/builder-engine/foundation/builder-catalog';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ShadButton, ScrollArea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type StructureOutlinePanelProps = {
  className?: string;
};

export function StructureOutlinePanel({ className }: StructureOutlinePanelProps) {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const removeBlock = useBuilderDocumentStore((s) => s.removeBlock);
  const moveBlockUp = useBuilderDocumentStore((s) => s.moveBlockUp);
  const moveBlockDown = useBuilderDocumentStore((s) => s.moveBlockDown);

  if (blocks.length === 0) {
    return (
      <p className={cn('px-3 py-4 text-xs text-neutral-500', className)}>
        Aucune section sur la page. Utilisez un gabarit de démarrage ou le catalogue.
      </p>
    );
  }

  return (
    <ScrollArea className={cn('min-h-0 flex-1', className)}>
      <ol className="space-y-1 px-2 py-1">
        {blocks.map((block, index) => {
          const catalog = getCatalogItem(block.type);
          const isSelected = block.id === selectedBlockId;
          return (
            <li key={block.id}>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1.5 text-left text-xs transition-colors',
                  isSelected
                    ? 'border-blue-500/50 bg-blue-500/10 text-neutral-100'
                    : 'border-transparent bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900',
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left"
                  onClick={() => selectBlock(block.id)}
                >
                  <span className="mr-1.5 font-mono text-[0.625rem] text-neutral-600">
                    {index + 1}.
                  </span>
                  {catalog?.sidebarLabel ?? block.label}
                </button>
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 px-1.5 text-[0.625rem] border-neutral-700"
                  disabled={index === 0}
                  onClick={() => moveBlockUp(block.id)}
                >
                  ↑
                </ShadButton>
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 px-1.5 text-[0.625rem] border-neutral-700"
                  disabled={index === blocks.length - 1}
                  onClick={() => moveBlockDown(block.id)}
                >
                  ↓
                </ShadButton>
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0 border-red-900/40 text-red-400"
                  onClick={() => removeBlock(block.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3 w-3" />
                </ShadButton>
              </div>
            </li>
          );
        })}
      </ol>
    </ScrollArea>
  );
}
