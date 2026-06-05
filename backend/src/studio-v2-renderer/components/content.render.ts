import { escapeHtml, safeHref } from '../escape-html';
import { renderImageTag } from '../resolve-image';
import type { PuckNode, StudioV2RenderContext } from '../types';

const BENEFIT_ICONS = new Set([
  'shield',
  'car',
  'phone',
  'clock',
  'map',
  'star',
  'check',
  'wrench',
  'battery',
  'fuel',
]);

export function renderVehicleOffer(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string {
  const layout = typeof props.layout === 'string' ? props.layout : 'card';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-offer__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-offer__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';
  const model =
    typeof props.modelName === 'string' && props.modelName.trim()
      ? `<p class="vs2-offer__model">${escapeHtml(props.modelName.trim())}</p>`
      : '';
  const offer =
    typeof props.offerLabel === 'string' && props.offerLabel.trim()
      ? `<span class="vs2-offer__label">${escapeHtml(props.offerLabel.trim())}</span>`
      : '';
  const price =
    typeof props.priceText === 'string' && props.priceText.trim()
      ? `<p class="vs2-offer__price">${escapeHtml(props.priceText.trim())}</p>`
      : '';
  const highlights = Array.isArray(props.highlights)
    ? `<ul class="vs2-offer__highlights">${props.highlights
        .filter((h): h is string => typeof h === 'string' && h.trim().length > 0)
        .map((h) => `<li>${escapeHtml(h.trim())}</li>`)
        .join('')}</ul>`
    : '';
  const cta =
    typeof props.ctaLabel === 'string' && props.ctaLabel.trim()
      ? `<a class="vs2-offer__cta" href="${safeHref(String(props.ctaHref ?? '#lead-form'))}">${escapeHtml(props.ctaLabel.trim())}</a>`
      : '';
  const media = renderImageTag(props, ctx, 'vs2-offer__img');

  return `<section class="vs2-offer vs2-offer--${escapeHtml(layout)}"><div class="vs2-offer__content">${offer}${title}${subtitle}${model}${price}${highlights}${cta}</div><div class="vs2-offer__media">${media}</div></section>`;
}

export function renderVehicleRange(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string {
  const columns = props.columns === 2 || props.columns === 4 ? props.columns : 3;
  const cardStyle = typeof props.cardStyle === 'string' ? props.cardStyle : 'clean';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-range__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-range__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';

  const vehicles = Array.isArray(props.vehicles) ? props.vehicles : [];
  const cards = vehicles
    .filter((v): v is Record<string, unknown> => v !== null && typeof v === 'object')
    .map((vehicle) => {
      const name =
        typeof vehicle.name === 'string' && vehicle.name.trim()
          ? `<h3 class="vs2-range-card__name">${escapeHtml(vehicle.name.trim())}</h3>`
          : '';
      const category =
        typeof vehicle.category === 'string' && vehicle.category.trim()
          ? `<span class="vs2-range-card__category">${escapeHtml(vehicle.category.trim())}</span>`
          : '';
      const energy =
        typeof vehicle.energy === 'string' && vehicle.energy.trim()
          ? `<span class="vs2-range-card__energy">${escapeHtml(vehicle.energy.trim())}</span>`
          : '';
      const price =
        typeof vehicle.priceText === 'string' && vehicle.priceText.trim()
          ? `<p class="vs2-range-card__price">${escapeHtml(vehicle.priceText.trim())}</p>`
          : '';
      const cta =
        typeof vehicle.ctaLabel === 'string' && vehicle.ctaLabel.trim()
          ? `<a class="vs2-range-card__cta" href="${safeHref(String(vehicle.ctaHref ?? '#lead-form'))}">${escapeHtml(vehicle.ctaLabel.trim())}</a>`
          : '';
      const img = renderImageTag(vehicle, ctx, 'vs2-range-card__img');
      return `<article class="vs2-range-card">${img}${category}${energy}${name}${price}${cta}</article>`;
    })
    .join('');

  return `<section class="vs2-range vs2-range--cols-${columns} vs2-range--${escapeHtml(cardStyle)}">${title}${subtitle}<div class="vs2-range__grid">${cards}</div></section>`;
}

export function renderBenefits(props: Record<string, unknown>): string {
  const layout = typeof props.layout === 'string' ? props.layout : 'cards';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-benefits__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-benefits__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';

  const items = Array.isArray(props.items) ? props.items : [];
  const cards = items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => {
      const iconRaw = typeof item.icon === 'string' ? item.icon : 'check';
      const icon = BENEFIT_ICONS.has(iconRaw) ? iconRaw : 'check';
      const itemTitle =
        typeof item.title === 'string' && item.title.trim()
          ? `<h3 class="vs2-benefit__title">${escapeHtml(item.title.trim())}</h3>`
          : '';
      const desc =
        typeof item.description === 'string' && item.description.trim()
          ? `<p class="vs2-benefit__desc">${escapeHtml(item.description.trim())}</p>`
          : '';
      return `<article class="vs2-benefit vs2-benefit--${icon}">${itemTitle}${desc}</article>`;
    })
    .join('');

  return `<section class="vs2-benefits vs2-benefits--${escapeHtml(layout)}">${title}${subtitle}<div class="vs2-benefits__grid">${cards}</div></section>`;
}

export function renderFaq(props: Record<string, unknown>): string {
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-faq__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const items = Array.isArray(props.items) ? props.items : [];
  const openFirst = props.defaultOpenFirst === true;

  const entries = items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item, index) => {
      const question =
        typeof item.question === 'string' && item.question.trim()
          ? escapeHtml(item.question.trim())
          : '';
      const answer =
        typeof item.answer === 'string' && item.answer.trim()
          ? escapeHtml(item.answer.trim())
          : '';
      if (!question || !answer) return '';
      const open = openFirst && index === 0 ? ' open' : '';
      return `<details class="vs2-faq__item"${open}><summary class="vs2-faq__question">${question}</summary><p class="vs2-faq__answer">${answer}</p></details>`;
    })
    .join('');

  return `<section class="vs2-faq">${title}<div class="vs2-faq__list">${entries}</div></section>`;
}

export function renderCtaSection(props: Record<string, unknown>): string {
  const layout = typeof props.layout === 'string' ? props.layout : 'band';
  const tone = typeof props.tone === 'string' ? props.tone : 'brand';
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-cta__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-cta__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';
  const button =
    typeof props.buttonLabel === 'string' && props.buttonLabel.trim()
      ? `<a class="vs2-cta__button" href="${safeHref(String(props.buttonHref ?? '#lead-form'))}">${escapeHtml(props.buttonLabel.trim())}</a>`
      : '';

  return `<section class="vs2-cta vs2-cta--${escapeHtml(layout)} vs2-tone-${escapeHtml(tone)}">${title}${subtitle}${button}</section>`;
}

export function renderFooterLegal(props: Record<string, unknown>): string {
  const brand =
    typeof props.brandName === 'string' && props.brandName.trim()
      ? `<span class="vs2-footer__brand">${escapeHtml(props.brandName.trim())}</span>`
      : '';
  const legal =
    typeof props.legalText === 'string' && props.legalText.trim()
      ? `<p class="vs2-footer__legal">${escapeHtml(props.legalText.trim())}</p>`
      : '';
  const links = Array.isArray(props.links)
    ? `<nav class="vs2-footer__links">${props.links
        .filter((l): l is Record<string, unknown> => l !== null && typeof l === 'object')
        .map((link) => {
          const label =
            typeof link.label === 'string' && link.label.trim() ? link.label.trim() : '';
          const href = typeof link.href === 'string' ? link.href : '#';
          if (!label) return '';
          return `<a href="${safeHref(href)}">${escapeHtml(label)}</a>`;
        })
        .join('')}</nav>`
    : '';

  return `<footer class="vs2-footer">${brand}${legal}${links}</footer>`;
}

export function renderSpacer(props: Record<string, unknown>): string {
  const size = typeof props.size === 'string' ? props.size : 'md';
  return `<div class="vs2-spacer vs2-spacer--${escapeHtml(size)}" aria-hidden="true"></div>`;
}

export function renderStepsBlock(props: Record<string, unknown>): string {
  const title =
    typeof props.title === 'string' && props.title.trim()
      ? `<h2 class="vs2-steps__title">${escapeHtml(props.title.trim())}</h2>`
      : '';
  const subtitle =
    typeof props.subtitle === 'string' && props.subtitle.trim()
      ? `<p class="vs2-steps__subtitle">${escapeHtml(props.subtitle.trim())}</p>`
      : '';

  const steps = Array.isArray(props.steps) ? props.steps : [];
  const items = steps
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((step, index) => {
      const stepTitle =
        typeof step.title === 'string' && step.title.trim()
          ? `<p class="vs2-steps__item-title">${escapeHtml(step.title.trim())}</p>`
          : '';
      const desc =
        typeof step.description === 'string' && step.description.trim()
          ? `<p class="vs2-steps__item-desc">${escapeHtml(step.description.trim())}</p>`
          : '';
      return `<li class="vs2-steps__item"><span class="vs2-steps__number">${index + 1}</span><div>${stepTitle}${desc}</div></li>`;
    })
    .join('');

  return `<section class="vs2-steps">${title}${subtitle}<ol class="vs2-steps__list">${items}</ol></section>`;
}

export function renderMediaImage(
  props: Record<string, unknown>,
  ctx: StudioV2RenderContext,
): string {
  const align = props.alignment === 'center' ? 'center' : 'left';
  const img = renderImageTag(props, ctx, 'vs2-media-image__img');
  const caption =
    typeof props.caption === 'string' && props.caption.trim()
      ? `<figcaption class="vs2-media-image__caption">${escapeHtml(props.caption.trim())}</figcaption>`
      : '';
  if (!img && !caption) return '';
  return `<figure class="vs2-media-image vs2-align-${align}">${img}${caption}</figure>`;
}

export function renderSlotChildren(
  props: Record<string, unknown>,
  slotKey: string,
  renderNode: (node: PuckNode) => string,
): string {
  const slot = props[slotKey];
  if (!Array.isArray(slot)) return '';
  return slot
    .filter(
      (node): node is PuckNode =>
        node !== null && typeof node === 'object' && 'type' in node && 'props' in node,
    )
    .map((node) => renderNode(node))
    .join('');
}
