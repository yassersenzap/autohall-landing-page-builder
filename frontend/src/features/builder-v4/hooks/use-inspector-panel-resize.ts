import { useCallback, useEffect, useRef } from 'react';
import { useBuilderV4Store } from '../store/document.store';

const MIN_WIDTH = 360;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 440;

export function useInspectorPanelResize() {
  const width = useBuilderV4Store((s) => s.rightPanelWidth);
  const setRightPanelWidth = useBuilderV4Store((s) => s.setRightPanelWidth);
  const dragging = useRef(false);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - event.clientX));
      setRightPanelWidth(next);
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [setRightPanelWidth]);

  return { width: width ?? DEFAULT_WIDTH, onResizePointerDown: onPointerDown };
}
