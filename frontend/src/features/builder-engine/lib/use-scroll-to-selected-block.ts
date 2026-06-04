import { useEffect, useRef, type RefObject } from 'react';
import { useBuilderDocumentStore } from '../store/builder-document.store';

/**
 * Fait défiler le canvas vers le bloc sélectionné (scrollIntoView doux).
 */
export function useScrollToSelectedBlock(scrollRootRef: RefObject<HTMLElement | null>) {
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedBlockId || selectedBlockId === prevSelectedRef.current) return;
    prevSelectedRef.current = selectedBlockId;

    const root = scrollRootRef.current;
    if (!root) return;

    const target = root.querySelector<HTMLElement>(
      `[data-builder-block-id="${selectedBlockId}"]`,
    );
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  }, [selectedBlockId, scrollRootRef]);
}
