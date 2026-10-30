import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Redo2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useBuilderV4Store } from '../store/document.store';
import { LayerRowOverlay, SortableLayerBranch } from './layers/SortableLayerRow';
import { cn } from '@/lib/utils';

/** Minimal history bar — Undo/Redo only. All other actions are on the canvas toolbar. */
function LayerHistoryBar() {
  const undoDocument = useBuilderV4Store((s) => s.undoDocument);
  const redoDocument = useBuilderV4Store((s) => s.redoDocument);
  const canUndo = useBuilderV4Store((s) => s.historyPast.length > 0);
  const canRedo = useBuilderV4Store((s) => s.historyFuture.length > 0);

  return (
    <div className="v4-layers-historybar" data-testid="layers-toolbar">
      <span className="v4-layers-historybar__label">Layers</span>
      <div className="v4-layers-historybar__actions">
        <button
          type="button"
          className={cn('v4-layers-historybar__btn', !canUndo && 'v4-layers-historybar__btn--disabled')}
          disabled={!canUndo}
          onClick={undoDocument}
          title="Annuler (Ctrl+Z)"
          data-testid="layers-undo"
        >
          <Undo2 size={13} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className={cn('v4-layers-historybar__btn', !canRedo && 'v4-layers-historybar__btn--disabled')}
          disabled={!canRedo}
          onClick={redoDocument}
          title="Rétablir (Ctrl+Y)"
          data-testid="layers-redo"
        >
          <Redo2 size={13} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export function V4LayersPanel() {
  const rootId = useBuilderV4Store((s) => s.document.rootId);
  const getNode = useBuilderV4Store((s) => s.getNode);
  const handleLayerDrop = useBuilderV4Store((s) => s.handleLayerDrop);
  const root = getNode(rootId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNode = activeId ? getNode(activeId) : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    handleLayerDrop(String(active.id), String(over.id));
  }

  return (
    <div className="v4-panel v4-layers-panel" data-testid="layers-panel">
      <LayerHistoryBar />
      <div className="v4-panel__scroll">
        {root ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <ul className="v4-layers-tree" role="tree" aria-label="Calques de la page">
              <SortableContext items={root.children} strategy={verticalListSortingStrategy}>
                {root.children.map((childId) => (
                  <SortableLayerBranch key={childId} nodeId={childId} depth={0} />
                ))}
              </SortableContext>
            </ul>
            <DragOverlay dropAnimation={null}>
              {activeNode ? <LayerRowOverlay node={activeNode} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <p className="px-3 py-4 text-xs text-zinc-600">Aucun calque.</p>
        )}
      </div>
    </div>
  );
}
