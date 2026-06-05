import { escapeHtml, safeHref } from '../escape-html';
import { renderImageTag } from '../resolve-image';
import type { PuckNode, StudioV2RenderContext } from '../types';
import { renderSlotChildren } from './content.render';

function alignClass(alignment: unknown): string {
  return alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';
}

function textClasses(props: Record<string, unknown>, base: string): string {
  const size = typeof props.fontSize === 'string' ? props.fontSize : 'md';
  const weight = typeof props.fontWeight === 'string' ? props.fontWeight : 'normal';
  const align = alignClass(props.alignment);
  const color = typeof props.colorPreset === 'string' ? props.colorPreset : 'default';
  const spacing = typeof props.spacing === 'string' ? props.spacing : 'normal';
  return `${base} vs2-text--${escapeHtml(size)} vs2-weight--${escapeHtml(weight)} vs2-align-${align} vs2-color--${escapeHtml(color)} vs2-block-space--${escapeHtml(spacing)}`;
}

export function renderHeadingBlock(props: Record<string, unknown>): string {
  const text = typeof props.text === 'string' ? escapeHtml(props.text) : '';
  const level = props.level === 'h1' || props.level === 'h3' ? props.level : 'h2';
  const cls = textClasses(props, 'vs2-heading-block');
  return `<${level} class="${cls}">${text}</${level}>`;
}

export function renderParagraphBlock(props: Record<string, unknown>): string {
  const text = typeof props.text === 'string' ? escapeHtml(props.text) : '';
  const cls = textClasses(props, 'vs2-paragraph-block');
  return `<p class="${cls}">${text}</p>`;
}

export function renderButtonBlock(props: Record<string, unknown>): string {
  const label = typeof props.label === 'string' ? escapeHtml(props.label) : '';
  const href = safeHref(String(props.href ?? '#'));
  const variant = typeof props.buttonStyle === 'string' ? props.buttonStyle : 'primary';
  const size = typeof props.buttonSize === 'string' ? props.buttonSize : 'md';
  const align = alignClass(props.alignment);
  return `<div class="vs2-btn-block vs2-btn-block--${escapeHtml(variant)} vs2-btn-block--${escapeHtml(size)} vs2-align-${align}"><a class="vs2-btn-block__link" href="${href}">${label}</a></div>`;
}

export function renderBadgeBlock(props: Record<string, unknown>): string {
  const text = typeof props.text === 'string' ? escapeHtml(props.text) : '';
  const tone = typeof props.tone === 'string' ? props.tone : 'brand';
  const align = alignClass(props.alignment);
  return `<div class="vs2-badge-block vs2-badge-block--${escapeHtml(tone)} vs2-align-${align}"><span class="vs2-badge-block__pill">${text}</span></div>`;
}

export function renderDividerBlock(props: Record<string, unknown>): string {
  const style = typeof props.style === 'string' ? props.style : 'line';
  return `<hr class="vs2-divider vs2-divider--${escapeHtml(style)}" aria-hidden="true" />`;
}

export function renderTextImageBlock(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string {
  const layout = typeof props.layout === 'string' ? props.layout : 'image_right';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h3 class="vs2-text-image__title">${escapeHtml(props.title.trim())}</h3>`
      : '';
  const text =
    typeof props.text === 'string' && props.text.trim()
      ? `<p class="vs2-text-image__text">${escapeHtml(props.text.trim())}</p>`
      : '';
  const align = alignClass(props.alignment);
  const img = renderImageTag(props, ctx, 'vs2-text-image__img');
  return `<div class="vs2-text-image vs2-text-image--${escapeHtml(layout)}"><div class="vs2-text-image__copy vs2-align-${align}">${title}${text}</div><div class="vs2-text-image__media">${img}</div></div>`;
}

export function renderCardBlock(props: Record<string, unknown>): string {
  const radius = typeof props.cardRadius === 'string' ? props.cardRadius : 'soft';
  const shadow = typeof props.cardShadow === 'string' ? props.cardShadow : 'soft';
  const align = alignClass(props.alignment);
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h3 class="vs2-card-block__title">${escapeHtml(props.title.trim())}</h3>`
      : '';
  const text =
    typeof props.text === 'string' && props.text.trim()
      ? `<p class="vs2-card-block__text">${escapeHtml(props.text.trim())}</p>`
      : '';
  return `<article class="vs2-card-block vs2-card-block--radius-${escapeHtml(radius)} vs2-card-block--shadow-${escapeHtml(shadow)} vs2-align-${align}">${title}${text}</article>`;
}

export function renderQuoteBlock(props: Record<string, unknown>): string {
  const quote = typeof props.quote === 'string' ? escapeHtml(props.quote) : '';
  const author = typeof props.author === 'string' ? escapeHtml(props.author) : '';
  const role = typeof props.role === 'string' && props.role.trim() ? escapeHtml(props.role.trim()) : '';
  const align = alignClass(props.alignment);
  const footer = author
    ? `<footer class="vs2-quote__author">${author}${role ? `<span class="vs2-quote__role"> — ${role}</span>` : ''}</footer>`
    : '';
  return `<blockquote class="vs2-quote vs2-align-${align}"><p class="vs2-quote__text">« ${quote} »</p>${footer}</blockquote>`;
}

export function renderStatsBlock(props: Record<string, unknown>): string {
  const tone = typeof props.tone === 'string' ? props.tone : 'brand';
  const items = Array.isArray(props.items) ? props.items : [];
  const cards = items
    .filter((i): i is Record<string, unknown> => i !== null && typeof i === 'object')
    .map((item) => {
      const value = typeof item.value === 'string' ? escapeHtml(item.value) : '';
      const label = typeof item.label === 'string' ? escapeHtml(item.label) : '';
      return `<div class="vs2-stats__item"><span class="vs2-stats__value">${value}</span><span class="vs2-stats__label">${label}</span></div>`;
    })
    .join('');
  return `<div class="vs2-stats vs2-stats--${escapeHtml(tone)}"><div class="vs2-stats__grid">${cards}</div></div>`;
}

export function renderTestimonialsBlock(props: Record<string, unknown>): string {
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-testimonials__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const items = Array.isArray(props.items) ? props.items : [];
  const cards = items
    .filter((i): i is Record<string, unknown> => i !== null && typeof i === 'object')
    .map((item) => {
      const quote = typeof item.quote === 'string' ? escapeHtml(item.quote) : '';
      const author = typeof item.author === 'string' ? escapeHtml(item.author) : '';
      return `<article class="vs2-testimonials__card"><p class="vs2-testimonials__quote">${quote}</p><footer class="vs2-testimonials__author">${author}</footer></article>`;
    })
    .join('');
  return `<section class="vs2-testimonials">${title}<div class="vs2-testimonials__grid">${cards}</div></section>`;
}

export function renderEventScheduleBlock(props: Record<string, unknown>): string {
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-event-schedule__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-event-schedule__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';
  const events = Array.isArray(props.events) ? props.events : [];
  const rows = events
    .filter((e): e is Record<string, unknown> => e !== null && typeof e === 'object')
    .map((ev) => {
      const time = typeof ev.time === 'string' ? escapeHtml(ev.time) : '';
      const evTitle = typeof ev.title === 'string' ? escapeHtml(ev.title) : '';
      const desc =
        typeof ev.description === 'string' && ev.description.trim()
          ? `<p class="vs2-event-schedule__desc">${escapeHtml(ev.description.trim())}</p>`
          : '';
      return `<li class="vs2-event-schedule__item"><time class="vs2-event-schedule__time">${time}</time><div><p class="vs2-event-schedule__event-title">${evTitle}</p>${desc}</div></li>`;
    })
    .join('');
  return `<section class="vs2-event-schedule">${title}${subtitle}<ol class="vs2-event-schedule__list">${rows}</ol></section>`;
}

export function renderFinancingHighlightBlock(props: Record<string, unknown>): string {
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-financing__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-financing__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';
  const rate =
    typeof props.rateText === 'string' && props.rateText.trim()
      ? `<p class="vs2-financing__rate">${escapeHtml(props.rateText.trim())}</p>`
      : '';
  const conditions = Array.isArray(props.conditions) ? props.conditions : [];
  const list = conditions
    .filter((c): c is Record<string, unknown> => c !== null && typeof c === 'object')
    .map((c) => `<li>${typeof c.text === 'string' ? escapeHtml(c.text) : ''}</li>`)
    .join('');
  const cta =
    typeof props.ctaLabel === 'string' && props.ctaLabel.trim()
      ? `<a class="vs2-financing__cta" href="${safeHref(String(props.ctaHref ?? '#lead-form'))}">${escapeHtml(props.ctaLabel.trim())}</a>`
      : '';
  return `<section class="vs2-financing">${title}${subtitle}${rate}<ul class="vs2-financing__conditions">${list}</ul>${cta}</section>`;
}

export function renderStackBlock(
  props: Record<string, unknown>,
  renderNode: (node: PuckNode) => string,
): string {
  const gap = typeof props.gap === 'string' ? props.gap : 'normal';
  const align = alignClass(props.alignment);
  const maxWidth = typeof props.maxWidth === 'string' ? props.maxWidth : 'standard';
  const inner = renderSlotChildren(props, 'items', renderNode);
  return `<div class="vs2-stack vs2-stack--gap-${escapeHtml(gap)} vs2-align-${align} vs2-stack--max-${escapeHtml(maxWidth)}">${inner}</div>`;
}
