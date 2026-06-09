import { escapeHtml, safeHref } from '../escape-html';
import { renderImageTag } from '../resolve-image';
import type { StudioV2RenderContext } from '../types';

export function renderHeroAutoHall(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string {
  const layout =
    typeof props.layout === 'string' ? props.layout : 'split_right';
  const tone = typeof props.tone === 'string' ? props.tone : 'brand';
  const align = props.alignment === 'center' ? 'center' : 'left';

  const eyebrow =
    typeof props.eyebrow === 'string' && props.eyebrow.trim()
      ? `<p class="vs2-hero__eyebrow">${escapeHtml(props.eyebrow.trim())}</p>`
      : '';
  const promoBadge =
    typeof props.promoBadge === 'string' && props.promoBadge.trim()
      ? `<span class="vs2-hero__badge">${escapeHtml(props.promoBadge.trim())}</span>`
      : '';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h1 class="vs2-hero__title">${escapeHtml(props.title.trim())}</h1>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-hero__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';

  const ctaPrimary =
    typeof props.ctaPrimaryLabel === 'string' && props.ctaPrimaryLabel.trim()
      ? `<a class="vs2-hero__cta vs2-hero__cta--primary" href="${safeHref(String(props.ctaPrimaryHref ?? '#lead-form'))}">${escapeHtml(props.ctaPrimaryLabel.trim())}</a>`
      : typeof props.ctaLabel === 'string' && props.ctaLabel.trim()
        ? `<a class="vs2-hero__cta vs2-hero__cta--primary" href="${safeHref(String(props.ctaHref ?? '#lead-form'))}">${escapeHtml(props.ctaLabel.trim())}</a>`
        : '';

  const ctaSecondary =
    typeof props.ctaSecondaryLabel === 'string' &&
    props.ctaSecondaryLabel.trim()
      ? `<a class="vs2-hero__cta vs2-hero__cta--secondary" href="${safeHref(String(props.ctaSecondaryHref ?? '#'))}">${escapeHtml(props.ctaSecondaryLabel.trim())}</a>`
      : '';

  const badges =
    props.showBadges && Array.isArray(props.badges)
      ? `<div class="vs2-hero__badges">${props.badges
          .filter(
            (b): b is string => typeof b === 'string' && b.trim().length > 0,
          )
          .map(
            (b) =>
              `<span class="vs2-hero__badge-item">${escapeHtml(b.trim())}</span>`,
          )
          .join('')}</div>`
      : '';

  const media = renderImageTag(props, ctx, 'vs2-hero__img');

  return `<div class="vs2-hero vs2-hero--${escapeHtml(layout)} vs2-tone-${escapeHtml(tone)} vs2-align-${align}"><div class="vs2-hero__content">${promoBadge}${eyebrow}${title}${subtitle}<div class="vs2-hero__ctas">${ctaPrimary}${ctaSecondary}</div>${badges}</div><div class="vs2-hero__media">${media}</div></div>`;
}
