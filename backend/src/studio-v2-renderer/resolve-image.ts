import { containsForbiddenAssetUrl } from './extract-puck-assets';
import { escapeHtml } from './escape-html';
import type { StudioV2RenderContext } from './types';

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

  return `<img class="${className}" src="${escapeHtml(src)}" alt="${alt}" style="object-fit:${fit};object-position:${escapeHtml(position)}" loading="lazy" />`;
}
