import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';

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
          className="absolute -top-0.5 left-3 right-3 h-0.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60"
          aria-hidden
        />
      ) : null}
      <div
        role="button"
        tabIndex={0}
        onClick={() => selectBlock(block.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectBlock(block.id);
          }
        }}
        className={cn(
          'flex items-stretch overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          selected && 'border-primary/50 ring-2 ring-primary/20',
          hovered && !selected && 'border-border/80 bg-accent/30',
          isDragging && 'opacity-90 shadow-lg',
        )}
      >
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-grab items-center justify-center border-r border-border bg-muted/40 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Glisser pour réordonner"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 px-4 py-3">
          <p className="text-sm font-semibold tracking-tight">{block.label}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">{block.type}</p>
        </div>
        <div className="flex items-center border-l border-border px-1">
          <ShadButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Supprimer"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ShadButton>
        </div>
      </div>
    </li>
  );
}
