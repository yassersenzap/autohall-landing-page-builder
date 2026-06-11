import { Trash2 } from 'lucide-react';
import { getCatalogItem } from '@/features/builder-engine/foundation/builder-catalog';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ShadButton, ScrollArea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

type LayersPanelProps = {
  className?: string;
};

export function LayersPanel({ className }: LayersPanelProps) {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const removeBlock = useBuilderDocumentStore((s) => s.removeBlock);
  const moveBlockUp = useBuilderDocumentStore((s) => s.moveBlockUp);
  const moveBlockDown = useBuilderDocumentStore((s) => s.moveBlockDown);

  if (blocks.length === 0) {
    return (
      <div className={cn('px-4 py-6', className)} data-testid="studio-layers-empty">
        <p className="text-sm font-medium text-neutral-300">Aucun calque</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Ajoutez un bloc depuis l’onglet Blocks ou un modèle de page pour commencer.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('min-h-0 flex-1', className)} data-testid="studio-layers-panel">
      <ol className="space-y-1 px-2 py-2">
        {blocks.map((block, index) => {
          const catalog = getCatalogItem(block.type);
          const registry = getRegistryEntry(block.type);
          const isSelected = block.id === selectedBlockId;
          const displayLabel = catalog?.sidebarLabel ?? block.label;
          const typeLabel = registry?.label ?? block.type;

          return (
            <li key={block.id}>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-lg border px-2 py-2 text-left transition-colors',
                  isSelected
                    ? 'border-blue-500/50 bg-blue-500/10 text-neutral-100 shadow-sm shadow-blue-500/10'
                    : 'border-transparent bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900',
                )}
                data-testid={`studio-layer-item-${block.id}`}
                data-selected={isSelected ? 'true' : 'false'}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => selectBlock(block.id)}
                  data-testid={`studio-layer-select-${block.id}`}
                >
                  <span className="mr-1.5 font-mono text-[0.625rem] text-neutral-600">
                    {index + 1}
                  </span>
                  <span className="block truncate text-xs font-medium text-neutral-200">
                    {displayLabel}
                  </span>
                  <span className="block truncate text-[0.625rem] text-neutral-500">{typeLabel}</span>
                </button>
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-6 px-1.5 text-[0.625rem] border-neutral-700"
                  disabled={index === 0}
                  onClick={() => moveBlockUp(block.id)}
                  aria-label="Monter"
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
                  aria-label="Descendre"
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
