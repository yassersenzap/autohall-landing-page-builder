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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { BUILDER_PALETTE, parsePaletteDragId } from '../constants/palette';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { CanvasArea } from './CanvasArea';
import { BuilderLeftPanel } from './left-panel/BuilderLeftPanel';
import { RightInspector } from './RightInspector';

export function BuilderTriptychLayout() {
  const { canWrite, leftPanelTab, setLeftPanelTab } = useBuilderEditorContext();
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const reorderBlocks = useBuilderDocumentStore((s) => s.reorderBlocks);
  const moveBlockToIndex = useBuilderDocumentStore((s) => s.moveBlockToIndex);

  const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const paletteType = parsePaletteDragId(String(event.active.id));
    if (paletteType) {
      const item = BUILDER_PALETTE.find((p) => p.type === paletteType);
      setActiveDragLabel(item?.label ?? paletteType);
      return;
    }
    const block = blocks.find((b) => b.id === event.active.id);
    setActiveDragLabel(block?.label ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragLabel(null);
    if (!canWrite) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const paletteType = parsePaletteDragId(activeId);
    if (paletteType) {
      if (overId === 'canvas-drop-zone') {
        addBlock(paletteType);
        return;
      }
      const overIndex = blocks.findIndex((b) => b.id === overId);
      if (overIndex >= 0) {
        addBlock(paletteType, overIndex);
      } else {
        addBlock(paletteType);
      }
      return;
    }

    if (activeId !== overId && blocks.some((b) => b.id === activeId)) {
      if (blocks.some((b) => b.id === overId)) {
        reorderBlocks(activeId, overId);
      } else if (overId === 'canvas-drop-zone') {
        const fromIndex = blocks.findIndex((b) => b.id === activeId);
        if (fromIndex >= 0) moveBlockToIndex(activeId, blocks.length - 1);
      }
    }
  }

  function handleDragCancel() {
    setActiveDragLabel(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="builder-workspace__grid grid h-full min-h-0 w-full max-w-none grid-cols-1 overflow-hidden lg:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        <BuilderLeftPanel activeTab={leftPanelTab} onTabChange={setLeftPanelTab} />
        <CanvasArea />
        <RightInspector />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragLabel ? (
          <div className="rounded-lg border border-primary/40 bg-card px-4 py-2 text-sm font-semibold shadow-lg">
            {activeDragLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
