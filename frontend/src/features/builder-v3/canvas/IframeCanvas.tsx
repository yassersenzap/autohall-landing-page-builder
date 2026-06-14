import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { cn } from '@/lib/utils';
import { CANVAS_DROP_ID } from '../constants/dnd';
import { STUDIO_VIEWPORT_WIDTHS } from '../constants/studio-viewport';
import { StudioCanvasPlaceholder } from '../layout/StudioCanvasPlaceholder';
import { CanvasDocument } from './CanvasDocument';
import { injectIframeStyles } from './inject-iframe-styles';
import {
  STUDIO_SCROLL_TO_BLOCK_EVENT,
  scrollStudioIframeToBlock,
  type StudioScrollToBlockDetail,
} from './scroll-studio-canvas';

type IframeCanvasProps = {
  /** Overlay transparent au-dessus de l’iframe pendant un drag palette → canvas. */
  paletteDropActive?: boolean;
  /** Attend l’hydratation Zustand avant de monter le document React dans l’iframe. */
  documentHydrated?: boolean;
};

export function IframeCanvas({
  paletteDropActive = false,
  documentHydrated = true,
}: IframeCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [stylesReady, setStylesReady] = useState(false);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const viewportWidth = STUDIO_VIEWPORT_WIDTHS[deviceMode];

  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ID,
    disabled: !paletteDropActive,
  });

  const prepareIframeDocument = useCallback(async (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (!doc.documentElement.querySelector('head')) {
      doc.open();
      doc.write(
        '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" /><title>Canvas</title></head><body></body></html>',
      );
      doc.close();
    }

    await injectIframeStyles(doc);
    setStylesReady(true);
    setMountNode(doc.body);
  }, []);

  const bootIframe = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    await prepareIframeDocument(iframe);
  }, [prepareIframeDocument]);

  const handleLoad = useCallback(() => {
    void bootIframe();
  }, [bootIframe]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (iframe.contentDocument?.readyState === 'complete') {
      void bootIframe();
      return;
    }

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [bootIframe, handleLoad]);

  const scrollToSelectedBlock = useCallback(
    (blockId: string) => {
      if (!stylesReady || !documentHydrated) return;
      scrollStudioIframeToBlock(iframeRef.current, blockId);
    },
    [documentHydrated, stylesReady],
  );

  useEffect(() => {
    if (!selectedBlockId) return;
    scrollToSelectedBlock(selectedBlockId);
  }, [selectedBlockId, scrollToSelectedBlock]);

  useEffect(() => {
    function handleScrollRequest(event: Event) {
      const blockId = (event as CustomEvent<StudioScrollToBlockDetail>).detail?.blockId;
      if (blockId) scrollToSelectedBlock(blockId);
    }
    window.addEventListener(STUDIO_SCROLL_TO_BLOCK_EVENT, handleScrollRequest);
    return () => window.removeEventListener(STUDIO_SCROLL_TO_BLOCK_EVENT, handleScrollRequest);
  }, [scrollToSelectedBlock]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#0c0c0e] p-5"
      data-builder-v3-canvas-host
    >
      <div
        className={cn(
          'relative mx-auto flex min-h-full max-w-full flex-col transition-all duration-300',
          paletteDropActive && isOver && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900',
        )}
        style={{ width: viewportWidth }}
        data-droppable-active={paletteDropActive && isOver ? 'true' : 'false'}
        data-builder-v3-viewport={deviceMode}
        data-studio-viewport-width={viewportWidth}
      >
        <iframe
          ref={iframeRef}
          title="Landing canvas"
          className={cn(
            'h-full min-h-[720px] w-full rounded-xl border border-neutral-700/80 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/5',
            paletteDropActive && 'pointer-events-none select-none',
          )}
          sandbox="allow-same-origin allow-scripts"
          src="about:blank"
          onLoad={handleLoad}
        />

        {paletteDropActive ? (
          <div
            ref={setNodeRef}
            className={cn(
              'absolute inset-0 z-50 rounded-lg',
              isOver ? 'bg-blue-500/10' : 'bg-transparent',
            )}
            aria-label="Zone de dépôt canvas"
          />
        ) : null}

        {(!stylesReady || !documentHydrated) && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-neutral-950/30 p-4">
            <StudioCanvasPlaceholder
              className="h-full min-h-0 border-none bg-neutral-900/70"
              message={
                !documentHydrated ? 'Chargement du document…' : 'Initialisation du canvas…'
              }
              detail={
                !documentHydrated
                  ? 'Récupération des blocs et du thème'
                  : 'Injection des styles dans l’iframe'
              }
            />
          </div>
        )}
        {mountNode && stylesReady && documentHydrated
          ? createPortal(<CanvasDocument />, mountNode)
          : null}
      </div>
    </div>
  );
}
