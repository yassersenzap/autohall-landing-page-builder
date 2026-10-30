import type Moveable from 'react-moveable';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { HeroBlockRenderer } from './HeroBlockRenderer';
import { GuidesLayer } from './layers/GuidesLayer';
import { HoverLayer } from './layers/HoverLayer';
import { MoveableLayer } from './layers/MoveableLayer';
import { SelectoLayer } from './layers/SelectoLayer';
import { SelectionLayer } from './layers/SelectionLayer';
import { isDocumentEmpty } from '../lib/document-lifecycle';
import { CanvasSelectionToolbar } from './CanvasSelectionToolbar';
import { CanvasCommandPalette } from './CanvasCommandPalette';
import { SectionInsertLayer } from './SectionInsertLayer';
import { useCanvasComposerDrop } from '../hooks/use-canvas-composer-drop';
import { useBuilderV4Store } from '../store/document.store';

type CanvasLayerProps = {
  editorMode?: boolean;
};

export function CanvasLayer({ editorMode = true }: CanvasLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const document = useBuilderV4Store((s) => s.document);
  const clearSelection = useBuilderV4Store((s) => s.clearSelection);
  const setLeftPanelOpen = useBuilderV4Store((s) => s.setLeftPanelOpen);
  const setLeftSidebarTab = useBuilderV4Store((s) => s.setLeftSidebarTab);
  const isEmpty = isDocumentEmpty(document);

  const showDocument    = !isEmpty;
  // Canevas vierge → bouton d'ajout de section centré, canvas actif dès qu'un bloc existe
  const showBlankSurface = editorMode && isEmpty;
  const showInteraction  = editorMode && !isEmpty;

  const { dropActive, onDragOver, onDragLeave, onDrop } = useCanvasComposerDrop(showBlankSurface);

  const setContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainer(node);
  }, []);

  function handleAddSectionClick() {
    setLeftSidebarTab('sections');
    setLeftPanelOpen(true);
  }

  function handleBackgroundPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!showInteraction) return;
    const target = event.target as HTMLElement;
    if (target.closest('.v4-document-root [data-v4-node-id]')) return;
    if (target.closest('.v4-canvas-blank')) return;
    if (target.closest('.v4-blank')) return;
    if (target.closest('.v4-floating-toolbar')) return;
    if (target.closest('.v4-insert-indicator')) return;
    clearSelection();
  }

  return (
    <div
      ref={setContainerNode}
      className={cn('v4-canvas-layer', dropActive && showBlankSurface && 'v4-canvas-layer--drop-active')}
      data-testid="canvas-layer"
      data-editor={editorMode ? 'true' : 'false'}
      data-blank={showBlankSurface ? 'true' : 'false'}
      data-canva-ui={showInteraction ? 'true' : 'false'}
      onPointerDown={handleBackgroundPointerDown}
      onDragOver={showBlankSurface ? onDragOver : undefined}
      onDragLeave={showBlankSurface ? onDragLeave : undefined}
      onDrop={showBlankSurface ? onDrop : undefined}
    >
      {showDocument ? <HeroBlockRenderer editorMode={editorMode} /> : null}

      {/* Canevas vierge → carte d'ajout de section, centrée dans la grille */}
      {showBlankSurface ? (
        <div
          className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-200"
          style={{ flex: 1, minHeight: 0 }}
          data-blank-cta="true"
        >
          <button
            type="button"
            onClick={handleAddSectionClick}
            data-testid="canvas-add-section-cta"
            className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700/80 rounded-2xl p-12 max-w-sm mx-auto cursor-pointer transition-all duration-200 group shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <span className="text-zinc-400 group-hover:text-zinc-200 text-xs font-semibold tracking-wide transition-colors">
              + Ajouter une section
            </span>
            <span className="text-zinc-600 text-[10px] mt-1.5 text-center">
              Sélectionnez un bloc dans le catalogue de gauche pour commencer
            </span>
          </button>
        </div>
      ) : null}
      {showInteraction ? <CanvasSelectionToolbar /> : null}
      {showInteraction ? (
        <>
          <HoverLayer container={container} />
          <SelectionLayer />
          <GuidesLayer />
          {editorMode ? <SectionInsertLayer container={container} /> : null}
          <SelectoLayer container={container} moveableRef={moveableRef} />
          <MoveableLayer
            container={container}
            onMoveableReady={(instance) => {
              moveableRef.current = instance;
            }}
          />
        </>
      ) : null}
      {/* Command palette — rendered here so it's part of the canvas context */}
      {editorMode ? <CanvasCommandPalette /> : null}
    </div>
  );
}
