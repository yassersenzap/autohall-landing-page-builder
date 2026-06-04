import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { CanvasBlockRenderer } from './CanvasBlockRenderer';

type SortableBlockItemProps = {
  block: BuilderDocumentBlock;
};

export function SortableBlockItem({ block }: SortableBlockItemProps) {
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const hoveredBlockId = useBuilderDocumentStore((s) => s.hoveredBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const hoverBlock = useBuilderDocumentStore((s) => s.hoverBlock);
  const removeBlock = useBuilderDocumentStore((s) => s.removeBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: block.id });

  const selected = selectedBlockId === block.id;
  const hovered = hoveredBlockId === block.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn('relative list-none', isDragging && 'z-20')}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {isOver && !isDragging ? (
        <div
          className="absolute -top-0.5 left-0 right-0 z-10 h-0.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'overflow-hidden rounded-lg border bg-card shadow-sm transition-all',
          selected && 'border-primary ring-2 ring-primary/25',
          hovered && !selected && 'border-muted-foreground/30',
          isDragging && 'opacity-95 shadow-lg',
        )}
      >
        <div className="flex items-center border-b border-border bg-muted/30">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center text-muted-foreground hover:bg-muted active:cursor-grabbing"
            aria-label="Glisser pour réordonner"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="min-w-0 flex-1 px-2 py-2 text-left"
            onClick={() => selectBlock(block.id)}
          >
            <p className="truncate text-xs font-semibold text-foreground">{block.label}</p>
          </button>
          <ShadButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mr-1 text-muted-foreground hover:text-destructive"
            aria-label="Supprimer"
            onClick={() => removeBlock(block.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ShadButton>
        </div>

        <div
          role="button"
          tabIndex={0}
          className="w-full min-w-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={() => selectBlock(block.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectBlock(block.id);
            }
          }}
        >
          <CanvasBlockRenderer block={block} />
        </div>
      </div>
    </li>
  );
}
