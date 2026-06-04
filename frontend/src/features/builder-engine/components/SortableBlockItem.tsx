import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { CanvasBlockRenderer } from './CanvasBlockRenderer';

type SortableBlockItemProps = {
  block: BuilderDocumentBlock;
};

export function SortableBlockItem({ block }: SortableBlockItemProps) {
  const { canWrite } = useBuilderEditorContext();
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const hoveredBlockId = useBuilderDocumentStore((s) => s.hoveredBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const hoverBlock = useBuilderDocumentStore((s) => s.hoverBlock);
  const removeBlock = useBuilderDocumentStore((s) => s.removeBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: block.id, disabled: !canWrite });

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
      className={cn('group relative list-none', isDragging && 'z-30')}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {isOver && !isDragging ? (
        <div
          className="absolute inset-x-0 top-0 z-20 h-0.5 bg-primary shadow-[0_0_12px] shadow-primary/70"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'relative',
          selected && 'ring-2 ring-inset ring-primary/80',
          hovered && !selected && 'ring-1 ring-inset ring-primary/30',
          isDragging && 'opacity-90 shadow-2xl',
        )}
      >
        <div
          className={cn(
            'absolute left-3 top-3 z-20 flex items-center gap-0.5 rounded-lg border border-black/10 bg-white/95 p-0.5 shadow-lg backdrop-blur-md',
            'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
            (selected || isDragging) && 'opacity-100',
          )}
        >
          <button
            type="button"
            className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 active:cursor-grabbing"
            aria-label="Glisser pour réordonner"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="max-w-[8rem] truncate px-1 text-[0.6rem] font-semibold text-neutral-600">
            {block.label}
          </span>
          <ShadButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-neutral-400 hover:text-red-600"
            aria-label="Supprimer"
            disabled={!canWrite}
            onClick={() => removeBlock(block.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ShadButton>
        </div>

        <div
          role="button"
          tabIndex={0}
          className="w-full min-w-0 cursor-pointer outline-none"
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
