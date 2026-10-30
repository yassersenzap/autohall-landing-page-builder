/**
 * Backend view-model helpers for core_campaign_form_landing.
 *
 * Mirrors frontend packages/blocks/core-campaign-form-landing/image-geometry.ts
 * (framework-agnostic pure functions for HTML export parity).
 *
 * Canonical source: frontend/src/packages/blocks/core-campaign-form-landing/image-geometry.ts
 * Keep in sync when image geometry logic changes.
 */

const CORE_IMAGE_ZOOM_MIN = 100;
const CORE_IMAGE_ZOOM_MAX = 200;
const CORE_IMAGE_ZOOM_DEFAULT = 100;
const CORE_IMAGE_POSITION_DEFAULT = 50;

function clampPercent(value: unknown, fallback = CORE_IMAGE_POSITION_DEFAULT): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function resolveCoreVisualType(value: unknown): 'campaign_image' | 'vehicle_image' {
  return value === 'vehicle_image' ? 'vehicle_image' : 'campaign_image';
}

function resolveCoreImageFit(value: unknown, visualType?: unknown): 'cover' | 'contain' {
  if (value === 'cover' || value === 'contain') return value;
  return resolveCoreVisualType(visualType) === 'campaign_image' ? 'contain' : 'cover';
}

type CoreImageObjectFit = 'cover' | 'contain' | 'fill' | 'none';

function resolveCoreObjectFit(imageFit: unknown, visualType?: unknown): CoreImageObjectFit {
  const fit = typeof imageFit === 'string' ? imageFit : '';
  if (fit === 'cover') return 'cover';
  if (fit === 'contain') return 'contain';
  if (fit === 'fill') return 'fill';
  if (fit === 'original' || fit === 'fit-width' || fit === 'fit-height') return 'none';
  return resolveCoreImageFit(imageFit, visualType) === 'cover' ? 'cover' : 'contain';
}

function resolveCoreImageZoom(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return CORE_IMAGE_ZOOM_DEFAULT;
  return Math.min(CORE_IMAGE_ZOOM_MAX, Math.max(CORE_IMAGE_ZOOM_MIN, Math.round(parsed)));
}

function resolveCoreImagePositionX(value: unknown): number {
  return clampPercent(value, CORE_IMAGE_POSITION_DEFAULT);
}

function resolveCoreImagePositionY(value: unknown): number {
  return clampPercent(value, CORE_IMAGE_POSITION_DEFAULT);
}

function resolveCoreImageFocalPoint(propsJson: Record<string, unknown>): {
  posX: number;
  posY: number;
} {
  const hasExplicitCoords =
    propsJson.imagePositionX !== undefined ||
    propsJson.imagePositionY !== undefined ||
    propsJson.focalPointX !== undefined ||
    propsJson.focalPointY !== undefined ||
    propsJson.positionX !== undefined ||
    propsJson.positionY !== undefined;

  if (hasExplicitCoords) {
    return {
      posX: resolveCoreImagePositionX(
        propsJson.imagePositionX ?? propsJson.positionX ?? propsJson.focalPointX,
      ),
      posY: resolveCoreImagePositionY(
        propsJson.imagePositionY ?? propsJson.positionY ?? propsJson.focalPointY,
      ),
    };
  }

  const imagePosition =
    typeof propsJson.imagePosition === 'string' ? propsJson.imagePosition : 'center';

  if (imagePosition === 'top') return { posX: 50, posY: 0 };
  if (imagePosition === 'bottom') return { posX: 50, posY: 100 };
  if (imagePosition === 'left') return { posX: 0, posY: 50 };
  if (imagePosition === 'right') return { posX: 100, posY: 50 };
  return { posX: 50, posY: 50 };
}

/** Inline CSS string for static HTML export. */
export function buildCoreCampaignImageInlineStyle(propsJson: Record<string, unknown>): string {
  const { posX, posY } = resolveCoreImageFocalPoint(propsJson);
  const zoom = resolveCoreImageZoom(propsJson.imageZoom);
  const scale = zoom / 100;
  const objectFit = resolveCoreObjectFit(
    propsJson.imageFit ?? propsJson.imageMode,
    propsJson.visualType,
  );

  const transform =
    scale > 1 ? `transform:scale(${scale});transform-origin:${posX}% ${posY}%` : '';

  return [
    `object-fit:${objectFit}`,
    'width:100%',
    'height:100%',
    `object-position:${posX}% ${posY}%`,
    transform,
  ]
    .filter(Boolean)
    .join(';');
}
