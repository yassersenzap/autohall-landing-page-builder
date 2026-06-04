import { useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { LayoutTemplate, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CANVAS_DESKTOP_MAX_WIDTH,
  CANVAS_MOBILE_WIDTH,
  CANVAS_ZOOM_STEPS,
  nextCanvasZoom,
  type CanvasZoomLevel,
} from '../lib/canvas-frame';
import { useScrollToSelectedBlock } from '../lib/use-scroll-to-selected-block';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { LandingPreviewScope } from './LandingPreviewScope';
import { SortableBlockItem } from './SortableBlockItem';
import '../styles/builder-canvas.css';

export function CanvasArea() {
  const blocks = useBuilderDocumentStore((s) => s.blocks);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderDocumentStore((s) => s.selectBlock);

  const [zoom, setZoom] = useState<CanvasZoomLevel>(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollToSelectedBlock(scrollRef);

  const isMobile = deviceMode === 'mobile';
  const widthLabel = isMobile ? String(CANVAS_MOBILE_WIDTH) : String(CANVAS_DESKTOP_MAX_WIDTH);

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  return (
    <main
      className="builder-canvas-area relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas"
      aria-label="Canvas de la landing"
    >
      <div className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-builder/90 px-4 py-2 backdrop-blur-sm">
        <p className="text-[0.65rem] font-medium text-muted-foreground">
          Page · {widthLabel}px · {blocks.length} section{blocks.length === 1 ? '' : 's'}
          {selectedBlockId ? ' · sélection active' : ''}
        </p>
        <div
          className="flex items-center gap-1 rounded-lg border border-border bg-card/80 p-0.5 shadow-sm"
          data-testid="canvas-zoom-controls"
        >
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
            aria-label="Zoom arrière"
            disabled={zoom <= CANVAS_ZOOM_STEPS[0]}
            onClick={() => setZoom((z) => nextCanvasZoom(z, 'out'))}
          >
            <ZoomOut className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span
            className="min-w-[2.75rem] text-center font-mono text-[0.65rem] font-medium text-foreground/80"
            data-testid="canvas-zoom-label"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
            aria-label="Zoom avant"
            disabled={zoom >= CANVAS_ZOOM_STEPS[CANVAS_ZOOM_STEPS.length - 1]}
            onClick={() => setZoom((z) => nextCanvasZoom(z, 'in'))}
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={(node) => {
          setNodeRef(node);
          scrollRef.current = node;
        }}
        data-testid="canvas-scroll-surface"
        className={cn(
          'builder-canvas-viewport min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain',
          'transition-colors duration-200',
          isOver && 'ring-2 ring-inset ring-primary/25',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) selectBlock(null);
        }}
      >
        <div
          data-testid="canvas-document-stage"
          className="builder-canvas-stage mx-auto w-full max-w-none px-4 py-6 sm:px-8 sm:py-8"
        >
          <div
            className={cn(
              'builder-canvas-frame w-full',
              isMobile ? 'mx-auto max-w-[24.375rem]' : 'max-w-[75rem]',
            )}
          >
            <div className="mb-2 flex items-center justify-between rounded-lg border border-border/70 bg-builder/80 px-3 py-1.5 text-[0.65rem] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
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
              className="builder-canvas-zoom-host mx-auto w-full"
              style={{ zoom: zoom !== 1 ? zoom : undefined }}
            >
              <div
                data-testid="canvas-document"
                data-device-mode={deviceMode}
                className={cn(
                  'builder-canvas-device-document overflow-hidden rounded-2xl border border-border/80 bg-canvas-paper shadow-2xl shadow-black/10',
                  isMobile ? 'w-full' : 'w-full',
                )}
                style={
                  isMobile
                    ? { width: CANVAS_MOBILE_WIDTH, maxWidth: '100%' }
                    : { maxWidth: CANVAS_DESKTOP_MAX_WIDTH }
                }
                onClick={(e) => e.stopPropagation()}
              >
                {blocks.length === 0 ? (
                  <div className="flex min-h-[32rem] flex-col items-center justify-center px-8 text-center">
                    <LayoutTemplate className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">Canvas vide</p>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Glissez un composant depuis le panneau gauche ou cliquez sur + pour
                      commencer votre landing.
                    </p>
                  </div>
                ) : (
                  <LandingPreviewScope className="is-canvas-edit rounded-none">
                    <SortableContext
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
    </main>
  );
}
