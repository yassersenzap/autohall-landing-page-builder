import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDndMonitor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { LayoutTemplate } from 'lucide-react';
import { parsePaletteDragId } from '@/features/builder-engine/constants/palette';
import { getRegistryEntry } from '@/features/builder-engine/registry/block-registry';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { CANVAS_DROP_ID } from '../constants/dnd';
import { IframeCanvas } from '../canvas/IframeCanvas';
import { CanvasToolbar } from './CanvasToolbar';
import { useStudioCanvasShortcuts } from '../hooks/useStudioCanvasShortcuts';
import { LeftSidebar } from '../panels/LeftSidebar';
import { RightInspector } from '../panels/RightInspector';

type StudioLayoutProps = {
  header?: ReactNode;
  documentHydrated?: boolean;
  onOpenPageSettings?: () => void;
};

type PaletteDragPreview = {
  type: string;
  label: string;
};

function PaletteDragMonitor({
  onDropActiveChange,
  onPreviewChange,
}: {
  onDropActiveChange: (active: boolean) => void;
  onPreviewChange: (preview: PaletteDragPreview | null) => void;
}) {
  useDndMonitor({
    onDragStart(event) {
      const blockType = parsePaletteDragId(String(event.active.id));
      if (!blockType) {
        onDropActiveChange(false);
        onPreviewChange(null);
        return;
      }
      const entry = getRegistryEntry(blockType);
      onDropActiveChange(true);
      onPreviewChange({
        type: blockType,
        label: entry?.label ?? blockType,
      });
    },
    onDragEnd() {
      onDropActiveChange(false);
      onPreviewChange(null);
    },
    onDragCancel() {
      onDropActiveChange(false);
      onPreviewChange(null);
    },
  });
  return null;
}

export function StudioLayout({
  header,
  documentHydrated = true,
  onOpenPageSettings,
}: StudioLayoutProps) {
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const setDeviceMode = useBuilderDocumentStore((s) => s.setDeviceMode);
  const [paletteDropActive, setPaletteDropActive] = useState(false);
  const [dragPreview, setDragPreview] = useState<PaletteDragPreview | null>(null);

  useStudioCanvasShortcuts(documentHydrated);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setPaletteDropActive(false);
    setDragPreview(null);

    if (!over || over.id !== CANVAS_DROP_ID) return;

    const blockType = parsePaletteDragId(String(active.id));
    if (blockType) {
      addBlock(blockType);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <PaletteDragMonitor
        onDropActiveChange={setPaletteDropActive}
        onPreviewChange={setDragPreview}
      />

      <div
        className="flex h-screen w-full flex-col overflow-hidden bg-neutral-950 text-white"
        data-studio-shell
      >
        {header ?? (
          <header className="flex h-12 shrink-0 items-center border-b border-neutral-800 px-4">
            <p className="text-sm font-semibold tracking-tight">Auto Hall — Landing Studio</p>
          </header>
        )}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <LeftSidebar onOpenPageSettings={onOpenPageSettings} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <CanvasToolbar deviceMode={deviceMode} onDeviceModeChange={setDeviceMode} />
            <IframeCanvas
              paletteDropActive={paletteDropActive}
              documentHydrated={documentHydrated}
            />
          </div>
          <RightInspector />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
        {dragPreview ? (
          <div className="flex min-w-[220px] items-center gap-3 rounded-xl border border-blue-500/60 bg-neutral-900/95 px-4 py-3 text-sm text-white shadow-2xl shadow-blue-500/20 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/25 text-blue-300">
              <LayoutTemplate className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="font-semibold leading-tight">{dragPreview.label}</p>
              <p className="text-[0.625rem] uppercase tracking-wide text-neutral-500">
                Déposer sur le canvas
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
