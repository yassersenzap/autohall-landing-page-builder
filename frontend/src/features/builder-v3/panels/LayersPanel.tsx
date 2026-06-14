import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { ScrollArea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { SortableLayerItem } from './SortableLayerItem';

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
  const reorderBlocks = useBuilderDocumentStore((s) => s.reorderBlocks);
  const toggleBlockHidden = useBuilderDocumentStore((s) => s.toggleBlockHidden);

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks],
  );
  const blockIds = useMemo(() => sorted.map((b) => b.id), [sorted]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderBlocks(String(active.id), String(over.id));
  }

  if (blocks.length === 0) {
    return (
      <ScrollArea className={cn('h-full min-h-0', className)} data-testid="studio-layers-panel">
        <div className="px-4 py-6" data-testid="studio-layers-empty">
          <p className="text-sm font-medium text-neutral-300">Aucun calque</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Ajoutez un bloc depuis l’onglet Blocks ou un modèle de page pour commencer.
          </p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className={cn('h-full min-h-0', className)} data-testid="studio-layers-panel">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <ol className="space-y-1 px-2 py-2 pb-6" data-testid="studio-layers-sortable">
            {sorted.map((block, index) => (
              <SortableLayerItem
                key={block.id}
                block={block}
                index={index}
                isSelected={block.id === selectedBlockId}
                onSelect={selectBlock}
                onRemove={removeBlock}
                onMoveUp={moveBlockUp}
                onMoveDown={moveBlockDown}
                onToggleHidden={toggleBlockHidden}
                canMoveUp={index > 0}
                canMoveDown={index < sorted.length - 1}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </ScrollArea>
  );
}
