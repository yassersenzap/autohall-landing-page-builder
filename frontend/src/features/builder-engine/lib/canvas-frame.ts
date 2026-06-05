/** Largeur document desktop dans le canvas — alignée sur une landing standard. */
export const CANVAS_DESKTOP_MAX_WIDTH = 960;

/** Largeur fixe du document en mode mobile (px). */
export const CANVAS_MOBILE_WIDTH = 390;

export const CANVAS_ZOOM_STEPS = [0.8, 0.9, 1] as const;
export type CanvasZoomLevel = (typeof CANVAS_ZOOM_STEPS)[number];

/** Zoom Fit minimum — évite une page illisible tout en privilégiant le vrai ajustement. */
export const CANVAS_FIT_MIN_SCALE = 0.72;

export function nextCanvasZoom(current: CanvasZoomLevel, direction: 'in' | 'out'): CanvasZoomLevel {
  const index = CANVAS_ZOOM_STEPS.indexOf(current);
  if (direction === 'in') {
    return CANVAS_ZOOM_STEPS[Math.min(index + 1, CANVAS_ZOOM_STEPS.length - 1)] ?? current;
  }
  return CANVAS_ZOOM_STEPS[Math.max(index - 1, 0)] ?? current;
}

/**
 * Zoom Fit : remplit la largeur disponible sans plancher artificiel à 80 % (évite page minuscule + scroll).
 */
export function computeFitScale(
  viewportWidth: number,
  logicalWidth: number,
  paddingX = 48,
): number {
  if (viewportWidth <= 0 || logicalWidth <= 0) return 1;
  const available = Math.max(0, viewportWidth - paddingX);
  const raw = available / logicalWidth;
  if (raw >= 1) return 1;
  return Math.max(CANVAS_FIT_MIN_SCALE, raw);
}

export function resolveEffectiveZoom(
  mode: 'fit' | 'manual',
  fitScale: number,
  manualZoom: CanvasZoomLevel,
): number {
  return mode === 'fit' ? fitScale : manualZoom;
}

export function canvasNeedsHorizontalScroll(
  viewportWidth: number,
  logicalWidth: number,
  effectiveZoom: number,
  paddingX = 48,
): boolean {
  const scaled = logicalWidth * effectiveZoom;
  return scaled + paddingX > viewportWidth;
}
