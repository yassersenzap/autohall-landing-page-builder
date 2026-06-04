/** Largeur max du document desktop dans le canvas (px) — occupe la colonne centrale. */
export const CANVAS_DESKTOP_MAX_WIDTH = 1200;

/** Largeur fixe du document en mode mobile (px). */
export const CANVAS_MOBILE_WIDTH = 390;

export const CANVAS_ZOOM_STEPS = [0.8, 0.9, 1] as const;
export type CanvasZoomLevel = (typeof CANVAS_ZOOM_STEPS)[number];

export function nextCanvasZoom(current: CanvasZoomLevel, direction: 'in' | 'out'): CanvasZoomLevel {
  const index = CANVAS_ZOOM_STEPS.indexOf(current);
  if (direction === 'in') {
    return CANVAS_ZOOM_STEPS[Math.min(index + 1, CANVAS_ZOOM_STEPS.length - 1)] ?? current;
  }
  return CANVAS_ZOOM_STEPS[Math.max(index - 1, 0)] ?? current;
}

/** @deprecated Conservé pour tests — le canvas n’utilise plus le fit scale automatique. */
export function computeFitScale(viewportWidth: number, logicalWidth: number): number {
  if (viewportWidth <= 0 || logicalWidth <= 0) return 1;
  const available = Math.max(0, viewportWidth - 48);
  return Math.min(1, available / logicalWidth);
}
