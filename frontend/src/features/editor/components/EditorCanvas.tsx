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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Copy, GripVertical, Trash2 } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { getBlockLabel } from '../../landing/landing-block-catalog';
import type { EditorDeviceMode, EditorPageBlock } from '../types/editor.types';
import { BlockTypeIcon } from '../lib/block-icons';
import { EditorCanvasFrame } from './EditorCanvasFrame';
import { EmptyEditorState } from './EmptyEditorState';

type EditorCanvasProps = {
  blocks: EditorPageBlock[];
  selectedBlockId: string | null;
  canWrite: boolean;
  onSelectBlock: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onReorder: (blockId: string, newIndex: number) => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onQuickAddHero: () => void;
  deviceMode: EditorDeviceMode;
};

function blockSummary(block: EditorPageBlock): string {
  const props = block.propsJson;
  if (typeof props.title === 'string' && props.title.trim()) return props.title;
  if (typeof props.heading === 'string' && props.heading.trim()) return props.heading;
  return 'Modifier le contenu dans l’inspecteur →';
}

function BlockCard({
  block,
  index,
  selected,
  canWrite,
  total,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  block: EditorPageBlock;
  index: number;
  selected: boolean;
  canWrite: boolean;
  total: number;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: block.id,
      disabled: !canWrite,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={cn('relative', isDragging && 'z-10')}>
      {isOver && !isDragging ? (
        <div
          className="absolute -top-1 left-2 right-2 z-20 h-0.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/50"
          aria-hidden
        />
      ) : null}
      <article
        className={cn(
          'grid overflow-hidden rounded-lg border bg-white text-zinc-900 shadow-sm transition-all',
          'grid-cols-[minmax(0,1fr)_auto]',
          selected && 'border-primary/50 ring-2 ring-primary/15',
          isDragging && 'opacity-90 shadow-lg',
          isOver && !isDragging && 'border-primary/30',
        )}
      >
        <button type="button" className="px-4 py-3 text-left" onClick={onSelect}>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded text-[0.65rem] font-bold',
                selected ? 'bg-primary/15 text-primary' : 'bg-zinc-100 text-zinc-500',
              )}
            >
              {index + 1}
            </span>
            <BlockTypeIcon type={block.blockType} className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-sm font-semibold">{getBlockLabel(block.blockType)}</span>
          </div>
          <p className="line-clamp-1 text-xs text-zinc-500">{blockSummary(block)}</p>
        </button>
        <div className="flex flex-col border-l border-zinc-100 bg-zinc-50/80">
          <button
            type="button"
            className={cn(
              'flex flex-1 cursor-grab items-center justify-center px-2 text-zinc-400',
              'hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing',
              !canWrite && 'cursor-not-allowed opacity-40',
            )}
            aria-label="Glisser pour réordonner"
            disabled={!canWrite}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex border-t border-zinc-100">
            <ShadButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-zinc-500 hover:text-zinc-900"
              disabled={!canWrite || index === 0}
              onClick={onMoveUp}
              aria-label="Monter"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-zinc-500 hover:text-zinc-900"
              disabled={!canWrite || index === total - 1}
              onClick={onMoveDown}
              aria-label="Descendre"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-zinc-500 hover:text-zinc-900"
              disabled={!canWrite}
              onClick={onDuplicate}
              aria-label="Dupliquer"
            >
              <Copy className="h-3.5 w-3.5" />
            </ShadButton>
            <ShadButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={!canWrite}
              onClick={onDelete}
              aria-label="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ShadButton>
          </div>
        </div>
      </article>
    </li>
  );
}

export function EditorCanvas({
  blocks,
  selectedBlockId,
  canWrite,
  onSelectBlock,
  onMoveUp,
  onMoveDown,
  onReorder,
  onDuplicateBlock,
  onDeleteBlock,
  onQuickAddHero,
  deviceMode,
}: EditorCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (blocks.length === 0) {
    return (
      <EditorCanvasFrame deviceMode={deviceMode} blockCount={0}>
        <EmptyEditorState canWrite={canWrite} onQuickAdd={canWrite ? () => onQuickAddHero() : undefined} />
      </EditorCanvasFrame>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === String(active.id));
    const newIndex = blocks.findIndex((block) => block.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(blocks, oldIndex, newIndex)[newIndex];
    onReorder(moved.id, newIndex);
  }

  return (
    <EditorCanvasFrame deviceMode={deviceMode} blockCount={blocks.length}>
      <div className="p-3 sm:p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {blocks.map((block, index) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  index={index}
                  total={blocks.length}
                  selected={block.id === selectedBlockId}
                  canWrite={canWrite}
                  onSelect={() => onSelectBlock(block.id)}
                  onMoveUp={() => onMoveUp(block.id)}
                  onMoveDown={() => onMoveDown(block.id)}
                  onDuplicate={() => onDuplicateBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </EditorCanvasFrame>
  );
}
