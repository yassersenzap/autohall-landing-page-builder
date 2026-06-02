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
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyEditorState } from './EmptyEditorState';
import { getBlockLabel } from '../../landing/landing-block-catalog';
import type { EditorDeviceMode, EditorPageBlock } from '../types/editor.types';

type EditorCanvasProps = {
  blocks: EditorPageBlock[];
  selectedBlockId: string | null;
  canWrite: boolean;
  onSelectBlock: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onReorder: (blockId: string, newIndex: number) => void;
  onDeleteBlock: (blockId: string) => void;
  onQuickAddHero: () => void;
  deviceMode: EditorDeviceMode;
};

function BlockCard({
  block,
  index,
  selected,
  canWrite,
  total,
  onSelect,
  onMoveUp,
  onMoveDown,
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
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
    disabled: !canWrite,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <article
        className={[
          'editor-canvas__block',
          selected ? 'is-selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button type="button" className="editor-canvas__main" onClick={onSelect}>
          <div className="editor-canvas__meta">
            <Badge variant="default">#{block.sortOrder}</Badge>
            <span className="editor-canvas__type">{getBlockLabel(block.blockType)}</span>
          </div>
          <p className="editor-canvas__preview-hint">
            {typeof block.propsJson.title === 'string'
              ? block.propsJson.title
              : typeof block.propsJson.heading === 'string'
                ? block.propsJson.heading
                : 'Contenu personnalisable dans le panneau de droite'}
          </p>
        </button>
        <div className="editor-canvas__actions">
          <Button size="sm" variant="ghost" disabled={!canWrite || index === 0} onClick={onMoveUp}>
            ↑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!canWrite || index === total - 1}
            onClick={onMoveDown}
          >
            ↓
          </Button>
          <button
            type="button"
            className="editor-canvas__drag"
            aria-label="Réordonner"
            disabled={!canWrite}
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
          <Button size="sm" variant="danger" disabled={!canWrite} onClick={onDelete}>
            Suppr.
          </Button>
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
  onDeleteBlock,
  onQuickAddHero,
  deviceMode,
}: EditorCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (blocks.length === 0) {
    return (
      <div className="editor-canvas editor-canvas--empty">
        <EmptyEditorState canWrite={canWrite} onQuickAdd={canWrite ? () => onQuickAddHero() : undefined} />
      </div>
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
    <div
      className={[
        'editor-canvas',
        deviceMode === 'mobile' ? 'editor-canvas--mobile' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          <ul className="editor-canvas__list">
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
                onDelete={() => onDeleteBlock(block.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
