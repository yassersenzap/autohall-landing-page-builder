import { useCallback } from 'react';
import { HERO_TEXT_DRAG_MIME } from '../lib/geometry/hero-overlay-text';
import { useBuilderV4Store } from '../store/document.store';

function hasHeroTextPayload(event: React.DragEvent): boolean {
  return event.dataTransfer.types.includes(HERO_TEXT_DRAG_MIME);
}

export function useHeroTextDrop(heroImageId: string, enabled: boolean) {
  const addHeroOverlayText = useBuilderV4Store((s) => s.addHeroOverlayText);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!enabled || !hasHeroTextPayload(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [enabled],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!enabled || !hasHeroTextPayload(event)) return;
      event.preventDefault();
      event.stopPropagation();

      const shell = event.currentTarget as HTMLElement;
      const rect = shell.getBoundingClientRect();
      const left = Math.round(event.clientX - rect.left);
      const top = Math.round(event.clientY - rect.top);

      addHeroOverlayText({ heroImageId, left, top });
    },
    [addHeroOverlayText, enabled, heroImageId],
  );

  return { onDragOver, onDrop, acceptsHeroTextDrop: hasHeroTextPayload };
}
