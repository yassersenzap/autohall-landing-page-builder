import { containsForbiddenAssetUrl } from './extract-puck-assets';
import { escapeHtml } from './escape-html';
import type { StudioV2RenderContext } from './types';

const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

const SHADOW_MAP: Record<string, string> = {
  none: '',
  soft: '0 8px 24px rgba(15, 23, 42, 0.1)',
  medium: '0 16px 40px rgba(15, 23, 42, 0.14)',
  strong: '0 24px 56px rgba(15, 23, 42, 0.2)',
};

const ASPECT_RATIO_MAP: Record<string, string> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  portrait: '3 / 4',
};

export function resolveImageSrc(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string | null {
  const assetId =
    typeof props.imageAssetId === 'string' ? props.imageAssetId.trim() : '';
  if (assetId && ctx.assetMap[assetId]) {
    return ctx.mode === 'export'
      ? ctx.assetMap[assetId].exportPath
      : ctx.assetMap[assetId].previewUrl;
  }

  const imageUrl = typeof props.imageUrl === 'string' ? props.imageUrl.trim() : '';
  if (imageUrl && !containsForbiddenAssetUrl(imageUrl) && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return null;
}

function buildMediaWrapperStyle(props: Record<string, unknown>): string {
  const parts: string[] = [];
  const aspectRatio =
    typeof props.aspectRatio === 'string' ? props.aspectRatio : 'auto';
  if (aspectRatio !== 'auto' && ASPECT_RATIO_MAP[aspectRatio]) {
    parts.push(`aspect-ratio:${ASPECT_RATIO_MAP[aspectRatio]}`);
  }

  const radius =
    typeof props.imageRadius === 'string' ? props.imageRadius : 'md';
  if (RADIUS_MAP[radius]) {
    parts.push(`border-radius:${RADIUS_MAP[radius]}`);
  }

  const shadow =
    typeof props.imageShadow === 'string' ? props.imageShadow : 'none';
  if (shadow !== 'none' && SHADOW_MAP[shadow]) {
    parts.push(`box-shadow:${SHADOW_MAP[shadow]}`);
  }

  return parts.join(';');
}

export function renderImageTag(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
  className = 'vs2-img',
): string {
  const src = resolveImageSrc(props, ctx);
  if (!src) return '';

  const alt =
    typeof props.imageAlt === 'string' && props.imageAlt.trim()
      ? escapeHtml(props.imageAlt.trim())
      : '';
  const fit = props.imageFit === 'contain' ? 'contain' : 'cover';
  const position =
    typeof props.imagePosition === 'string' ? props.imagePosition : 'center';

  const wrapperStyle = buildMediaWrapperStyle(props);
  const img = `<img class="${className}" src="${escapeHtml(src)}" alt="${alt}" style="object-fit:${fit};object-position:${escapeHtml(position)};width:100%;height:100%;display:block" loading="lazy" />`;

  if (wrapperStyle) {
    return `<div style="${wrapperStyle};overflow:hidden">${img}</div>`;
  }

  return img;
}
