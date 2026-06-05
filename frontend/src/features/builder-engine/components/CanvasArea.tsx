import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { LayoutTemplate, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShadButton } from '@/components/ui/primitives';
import { useBuilderEditorContext } from '../context/BuilderEditorContext';
import { useWorkspaceUi } from '../context/WorkspaceUiContext';
import {
  CANVAS_DESKTOP_MAX_WIDTH,
  CANVAS_MOBILE_WIDTH,
  type CanvasZoomLevel,
  canvasNeedsHorizontalScroll,
  resolveEffectiveZoom,
} from '../lib/canvas-frame';
import { useCanvasFitScale } from '../lib/use-canvas-fit-scale';
import { useScrollToSelectedBlock } from '../lib/use-scroll-to-selected-block';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { LandingPreviewScope } from './LandingPreviewScope';
import { SortableBlockItem } from './SortableBlockItem';
import '../styles/builder-canvas.css';

const ZOOM_PRESETS: { id: CanvasZoomLevel | 'fit'; label: string }[] = [
  { id: 'fit', label: 'Ajuster' },
  { id: 0.8, label: '80%' },
  { id: 0.9, label: '90%' },
  { id: 1, label: '100%' },
];

export function CanvasArea() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const addBlock = useBuilderDocumentStore((s) => s.addBlock);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);
  const { canWrite, openSectionsTab } = useBuilderEditorContext();

  const {
    zoomMode,
    manualZoom,
    setEffectiveZoom,
    setZoomFit,
    setZoomManual,
    focusMode,
  } = useWorkspaceUi();

  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollToSelectedBlock(scrollRef);

  const isMobile = deviceMode === 'mobile';
  const logicalWidth = isMobile ? CANVAS_MOBILE_WIDTH : CANVAS_DESKTOP_MAX_WIDTH;
  const widthLabel = String(logicalWidth);

  const fitScale = useCanvasFitScale(viewportRef, logicalWidth);
  const effectiveZoom = resolveEffectiveZoom(zoomMode, fitScale, manualZoom);

  useEffect(() => {
    setEffectiveZoom(effectiveZoom);
  }, [effectiveZoom, setEffectiveZoom]);

  useEffect(() => {
    if (isMobile && zoomMode === 'manual' && manualZoom === 1) {
      setZoomFit();
    }
  }, [isMobile, manualZoom, setZoomFit, zoomMode]);

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  const [needsHScroll, setNeedsHScroll] = useState(false);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const update = () => {
      setNeedsHScroll(
        canvasNeedsHorizontalScroll(node.clientWidth, logicalWidth, effectiveZoom),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [effectiveZoom, logicalWidth]);

  return (
    <main
      className="builder-canvas-area relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas"
      aria-label="Canvas de la landing"
      data-focus-mode={focusMode ? 'true' : 'false'}
    >
      <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-builder/90 px-3 py-2 backdrop-blur-sm sm:px-4">
        <p className="text-[0.65rem] font-medium text-muted-foreground">
          {isMobile ? 'Mobile' : 'Desktop'} · {widthLabel}px · {blocks.length} section
          {blocks.length === 1 ? '' : 's'}
          {selectedBlockId ? ' · sélection' : ''}
        </p>
        <div
          className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-card/80 p-0.5 shadow-sm"
          data-testid="canvas-zoom-controls"
        >
          {ZOOM_PRESETS.map((preset) => {
            const active =
              preset.id === 'fit'
                ? zoomMode === 'fit'
                : zoomMode === 'manual' && manualZoom === preset.id;
            return (
              <button
                key={String(preset.id)}
                type="button"
                className={cn(
                  'rounded-md px-2 py-1 text-[0.65rem] font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                data-testid={
                  preset.id === 'fit' ? 'canvas-zoom-fit' : `canvas-zoom-${preset.id}`
                }
                onClick={() =>
                  preset.id === 'fit' ? setZoomFit() : setZoomManual(preset.id)
                }
              >
                {preset.label}
              </button>
            );
          })}
          <span
            className="min-w-[3.25rem] border-l border-border/60 px-2 text-center font-mono text-[0.65rem] font-medium text-foreground/80"
            data-testid="canvas-zoom-label"
          >
            {Math.round(effectiveZoom * 100)}%
          </span>
        </div>
      </div>

      <div
        ref={(node) => {
          setNodeRef(node);
          viewportRef.current = node;
          scrollRef.current = node;
        }}
        data-testid="canvas-scroll-surface"
        className={cn(
          'builder-canvas-viewport min-h-0 flex-1 overscroll-y-contain',
          needsHScroll ? 'overflow-x-auto' : 'overflow-x-hidden',
          'overflow-y-auto',
          'transition-colors duration-200',
          isOver && 'ring-2 ring-inset ring-primary/25',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) selectBlock(null);
        }}
      >
        <div
          data-testid="canvas-document-stage"
          className="builder-canvas-stage mx-auto flex min-h-full w-full max-w-full justify-center px-3 py-6 pb-12 sm:px-6 sm:py-8"
        >
          <div
            className="builder-canvas-scaler shrink-0"
            style={{
              width: Math.ceil(logicalWidth * effectiveZoom),
            }}
          >
            <div
              className="builder-canvas-frame"
              style={{ width: logicalWidth }}
            >
              <div className="mb-3 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-builder/90 px-3 py-1.5 text-[0.65rem] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                  <span className="inline-flex gap-1" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                    <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                    <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="text-foreground/80">
                    {isMobile ? 'Mobile' : 'Desktop'} · {widthLabel}px
                  </span>
                </div>
              </div>

              <div
                className="builder-canvas-zoom-host mx-auto"
                style={{
                  width: logicalWidth,
                  zoom: effectiveZoom,
                }}
              >
                <div
                  data-testid="canvas-document"
                  data-device-mode={deviceMode}
                  className={cn(
                    'builder-canvas-device-document overflow-hidden rounded-2xl border border-border/80 bg-canvas-paper shadow-2xl shadow-black/10',
                  )}
                  style={{ width: logicalWidth }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {blocks.length === 0 ? (
                    <div
                      className="flex min-h-[28rem] flex-col items-center justify-center px-8 text-center"
                      data-testid="canvas-empty-state"
                    >
                      <LayoutTemplate className="mb-4 h-12 w-12 text-primary/40" aria-hidden />
                      <p className="text-base font-semibold text-foreground">
                        Commencez avec un modèle Auto Hall ou ajoutez un bloc
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Choisissez une structure prête à l’emploi ou démarrez par une bannière Hero.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <ShadButton
                          type="button"
                          size="sm"
                          onClick={() => openSectionsTab()}
                        >
                          <LayoutTemplate className="h-4 w-4" />
                          Choisir un modèle
                        </ShadButton>
                        <ShadButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!canWrite}
                          onClick={() => addBlock('hero_campaign')}
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un Hero
                        </ShadButton>
                      </div>
                    </div>
                  ) : (
                    <LandingPreviewScope className="is-canvas-edit rounded-none">
                      <SortableContext
                        key={blocks.map((b) => b.id).join('|')}
                        items={blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <ul className="m-0 block w-full min-w-0 list-none p-0">
                          {blocks.map((block) => (
                            <SortableBlockItem key={block.id} blockId={block.id} />
                          ))}
                        </ul>
                      </SortableContext>
                    </LandingPreviewScope>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
