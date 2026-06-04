import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { CanvasBlockRenderer } from './CanvasBlockRenderer';

type SortableBlockItemProps = {
  blockId: string;
};

type BlockHoverOverlayProps = {
  canWrite: boolean;
  dragAttributes: ReturnType<typeof useSortable>['attributes'];
  dragListeners: ReturnType<typeof useSortable>['listeners'];
  onDuplicate: () => void;
  onDelete: () => void;
};

function BlockHoverOverlay({
  canWrite,
  dragAttributes,
  dragListeners,
  onDuplicate,
  onDelete,
}: BlockHoverOverlayProps) {
  return (
    <div
      className="absolute right-3 top-3 z-30 flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/75 p-0.5 shadow-xl backdrop-blur-md"
      data-testid="block-hover-toolbar"
    >
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 disabled:opacity-40"
        aria-label="Dupliquer"
        disabled={!canWrite}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 active:cursor-grabbing disabled:opacity-40"
        aria-label="Déplacer"
        disabled={!canWrite}
        onClick={(e) => e.stopPropagation()}
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
        aria-label="Supprimer"
        disabled={!canWrite}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Conteneur DnD transparent — rendu canvas abonné au store via blockId.
 */
export function SortableBlockItem({ blockId }: SortableBlockItemProps) {
  const { canWrite } = useBuilderEditorContext();
  const block = useBuilderDocumentStore((s) => s.blocks.find((b) => b.id === blockId));
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const hoveredBlockId = useBuilderDocumentStore((s) => s.hoveredBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const hoverBlock = useBuilderDocumentStore((s) => s.hoverBlock);
  const removeBlock = useBuilderDocumentStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderDocumentStore((s) => s.duplicateBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: blockId, disabled: !canWrite });

  if (!block) return null;

  const selected = selectedBlockId === blockId;
  const hovered = hoveredBlockId === blockId;
  const showToolbar = (hovered || selected) && !isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid="sortable-block-item"
      data-builder-block-id={blockId}
      data-selected={selected ? 'true' : 'false'}
      className={cn(
        'builder-sortable-block relative m-0 block w-full min-w-full max-w-none list-none p-0',
        isDragging && 'z-30',
      )}
      onMouseEnter={() => hoverBlock(blockId)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {isOver && !isDragging ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 bg-primary shadow-[0_0_12px] shadow-primary/70"
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'builder-block-chrome relative block w-full min-w-full max-w-none transition-shadow duration-150',
          hovered && !selected && 'ring-1 ring-inset ring-blue-400/40',
          isDragging && 'opacity-95 shadow-2xl',
        )}
      >
        <div
          className={cn(
            'builder-block-selection-badge pointer-events-none absolute left-3 top-3 z-30 flex max-w-[calc(100%-6rem)] items-center gap-2',
          )}
          data-testid={selected ? 'block-selected-badge' : 'block-label-badge'}
        >
          <span
            className={cn(
              'truncate rounded-md px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide shadow-lg backdrop-blur-sm',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/70 text-white',
            )}
          >
            {block.label}
          </span>
        </div>

        {showToolbar ? (
          <BlockHoverOverlay
            canWrite={canWrite}
            dragAttributes={attributes}
            dragListeners={listeners}
            onDuplicate={() => duplicateBlock(blockId)}
            onDelete={() => removeBlock(blockId)}
          />
        ) : null}

        <div
          className="block w-full min-w-full max-w-none cursor-pointer"
          onClick={() => selectBlock(blockId)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectBlock(blockId);
            }
          }}
          role="presentation"
        >
          <CanvasBlockRenderer blockId={blockId} />
        </div>
      </div>
    </li>
  );
}
