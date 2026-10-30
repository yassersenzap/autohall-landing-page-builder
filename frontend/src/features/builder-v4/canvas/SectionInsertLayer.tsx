import { useCallback, useEffect, useRef, useState } from 'react';
import { useBuilderV4Store } from '../store/document.store';
import { useBuilderUIStore } from '../store/builder-ui.store';

type InsertZone = {
  top: number;
  insertAfterId: string | null;
};

/**
 * Framer-style insert indicator.
 * Detects mouse position in the gap between sections and shows
 * an animated blue line with a "+" button.
 * Completely independent of the selection system — pure overlay.
 */
export function SectionInsertLayer({ container }: { container: HTMLElement | null }) {
  const document = useBuilderV4Store((s) => s.document);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const { openCommandPalette } = useBuilderUIStore();

  const [zone, setZone] = useState<InsertZone | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearZone = useCallback(() => {
    hideRef.current = setTimeout(() => setZone(null), 200);
  }, []);

  const keepZone = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current);
  }, []);

  useEffect(() => {
    if (!container || previewMode) {
      setZone(null);
      return;
    }

    const root = document.nodes[document.rootId];
    const sectionIds = root?.children ?? [];

    function getSectionRects() {
      return sectionIds
        .map((id) => {
          const el = container!.querySelector<HTMLElement>(`[data-v4-node-id="${id}"]`);
          if (!el) return null;
          return { id, rect: el.getBoundingClientRect() };
        })
        .filter((x): x is { id: string; rect: DOMRect } => x !== null);
    }

    function onMouseMove(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Don't show insert indicator when hovering toolbar or other controls
      if (target.closest('.v4-floating-toolbar') || target.closest('.v4-palette')) return;

      const containerRect = container!.getBoundingClientRect();
      const mouseY = e.clientY;
      const rects = getSectionRects();

      if (rects.length === 0) return;

      for (let i = 0; i < rects.length; i++) {
        const { id, rect } = rects[i];
        const nextRect = rects[i + 1]?.rect;

        const zoneBottom = rect.bottom;
        const zoneTop = rect.top;
        const nextTop = nextRect ? nextRect.top : rect.bottom + 48;

        // Gap between this section and the next (or below last section)
        const gapTop = zoneBottom - 12;
        const gapBottom = nextTop + 12;

        if (mouseY >= gapTop && mouseY <= gapBottom) {
          if (hideRef.current) clearTimeout(hideRef.current);
          setZone({
            top: zoneBottom - containerRect.top + container!.scrollTop,
            insertAfterId: id,
          });
          return;
        }

        // Before first section
        if (i === 0 && mouseY < zoneTop - 12 && mouseY > containerRect.top) {
          if (hideRef.current) clearTimeout(hideRef.current);
          setZone({
            top: zoneTop - containerRect.top + container!.scrollTop,
            insertAfterId: null,
          });
          return;
        }
      }

      clearZone();
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', clearZone);
    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', clearZone);
    };
  }, [container, previewMode, document, clearZone]);

  if (!zone || previewMode) return null;

  return (
    <div
      className="v4-insert-indicator"
      style={{ top: zone.top }}
      onMouseEnter={keepZone}
      onMouseLeave={clearZone}
    >
      <div className="v4-insert-indicator__line" />
      <button
        type="button"
        className="v4-insert-indicator__btn"
        onClick={() => {
          setZone(null);
          openCommandPalette(zone.insertAfterId);
        }}
        title="Insérer une section ici"
        aria-label="Insérer une section"
      >
        +
      </button>
    </div>
  );
}
