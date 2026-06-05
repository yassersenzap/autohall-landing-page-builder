import { useEffect, useState, type RefObject } from 'react';
import { computeFitScale } from './canvas-frame';

const VIEWPORT_PADDING_X = 48;

export function useCanvasFitScale(
  viewportRef: RefObject<HTMLElement | null>,
  logicalWidth: number,
): number {
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const update = () => {
      setFitScale(computeFitScale(node.clientWidth, logicalWidth, VIEWPORT_PADDING_X));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [logicalWidth, viewportRef]);

  return fitScale;
}
