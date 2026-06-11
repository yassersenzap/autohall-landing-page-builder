import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { cn } from '@/lib/utils';
import { CanvasBlockToolbar } from './CanvasBlockToolbar';

type SortableCanvasBlockProps = {
  block: BuilderDocumentBlock;
  blockIndex: number;
  blockCount: number;
  selected: boolean;
  onSelect: (blockId: string) => void;
  children: ReactNode;
};

export function SortableCanvasBlock({
  block,
  blockIndex,
  blockCount,
  selected,
  onSelect,
  children,
}: SortableCanvasBlockProps) {
  const hoverBlock = useBuilderDocumentStore((s) => s.hoverBlock);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'v3-block-shell group relative',
        isDragging && 'z-20 opacity-95 shadow-lg',
        isOver && !isDragging && 'v3-block-shell--over',
      )}
      data-selected={selected ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
      data-canvas-block-id={block.id}
      data-canvas-block-selected={selected ? 'true' : 'false'}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(block.id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Sélectionner ${block.label}`}
    >
      {isOver && !isDragging ? (
        <div className="v3-block-drop-indicator" aria-hidden />
      ) : null}

      <button
        type="button"
        className="v3-block-grip"
        aria-label={`Déplacer ${block.label}`}
        {...listeners}
        {...attributes}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>

      {selected ? (
        <CanvasBlockToolbar
          block={block}
          blockIndex={blockIndex}
          blockCount={blockCount}
        />
      ) : null}

      <div className="v3-block-content">{children}</div>
    </div>
  );
}
