import {
  buildBlockDesignClasses,
  normalizeSectionDesign,
} from './block-design-system';
import { appendBlockMotionToClass, buildMotionDataAttributes } from './block-motion/block-motion.classes';
import { appendSectionStyleToClass } from './section-style/section-style.classes';
import { buildHeroFocalInlineStyle, resolveHeroFocalPoint } from './hero-image-controls';
import { resolveHeroImageSrc } from './render-asset.resolve';
import type { LandingRenderContext } from './render-asset.types';
import { sanitizeExportHref } from './safe-export-link';
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function propString(
  props: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function parseObjectList(
  props: Record<string, unknown>,
  key: string,
): Record<string, unknown>[] {
  if (!Array.isArray(props[key])) return [];
  return props[key].filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}

function buildPremiumSectionClass(
  blockType: string,
  bemRoot: string,
  props: Record<string, unknown>,
): string {
  const design = normalizeSectionDesign(blockType, props);
  let cls = buildBlockDesignClasses(bemRoot, design);
  cls = appendSectionStyleToClass(cls, props);
  cls = appendBlockMotionToClass(cls, props);
  return cls;
}

function renderSectionHeading(
  eyebrow: string | null,
  title: string | null,
  subtitle: string | null,
): string {
  const parts: string[] = [];
  if (eyebrow) {
    parts.push(`<p class="lp-section-eyebrow">${escapeHtml(eyebrow)}</p>`);
  }
  if (title) {
    parts.push(`<h2 class="lp-section-title">${escapeHtml(title)}</h2>`);
  }
  if (subtitle) {
    parts.push(`<p class="lp-section-subtitle">${escapeHtml(subtitle)}</p>`);
  }
  return parts.length ? `<div class="lp-section-head">${parts.join('')}</div>` : '';
}

function parseCountTarget(value: string): { target: number; suffix: string; prefix: string } | null {
  const match = value.trim().match(/^([^0-9]*)([\d.,]+)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2].replace(',', '.'));
  if (Number.isNaN(num)) return null;
  return { prefix: match[1] ?? '', target: num, suffix: match[3] ?? '' };
}

function renderMetricValue(
  value: string,
  countAnimation: string,
): string {
  if (countAnimation === 'count_up') {
    const parsed = parseCountTarget(value);
    if (parsed) {
      return `<span class="lp-stats__value" data-lp-count-up data-lp-count-target="${parsed.target}" data-lp-count-prefix="${escapeHtml(parsed.prefix)}" data-lp-count-suffix="${escapeHtml(parsed.suffix)}">0</span>`;
    }
  }
  return `<span class="lp-stats__value">${escapeHtml(value)}</span>`;
}

export function renderPremiumBentoFeaturesHtml(
  props: Record<string, unknown>,
): string {
  const layout = propString(props, 'layout') ?? '2x2';
  const visualStyle = propString(props, 'visualStyle') ?? 'glass';
  const eyebrow = propString(props, 'eyebrow');
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const cards = parseObjectList(props, 'cards')
    .map((card) => ({
      title: propString(card, 'title') ?? '',
      description: propString(card, 'description') ?? '',
      icon: propString(card, 'icon') ?? 'star',
    }))
    .filter((card) => card.title || card.description);

  const sectionClass = buildPremiumSectionClass(
    'premium_bento_features',
    'lp-premium-bento',
    props,
  );
  const motionAttrs = buildMotionDataAttributes(props);

  const cardsHtml = cards
    .map(
      (card) => `
      <article class="lp-premium-bento__card lp-motion__child">
        <span class="lp-premium-bento__icon" aria-hidden="true"></span>
        <h3 class="lp-premium-bento__card-title">${escapeHtml(card.title)}</h3>
        <p class="lp-premium-bento__card-text">${escapeHtml(card.description)}</p>
      </article>`,
    )
    .join('');

  return `
    <section class="lp-block ${sectionClass} lp-premium-bento--layout-${escapeHtml(layout)} lp-premium-bento--style-${escapeHtml(visualStyle)}"${motionAttrs}>
      <div class="lp-section">
        ${renderSectionHeading(eyebrow, title, subtitle)}
        ${cardsHtml ? `<div class="lp-premium-bento__grid">${cardsHtml}</div>` : ''}
      </div>
    </section>`;
}

export function renderAnimatedStatsStripHtml(props: Record<string, unknown>): string {
  const layout = propString(props, 'layout') ?? 'grid';
  const style = propString(props, 'style') ?? 'premium';
  const countAnimation = propString(props, 'countAnimation') ?? 'none';
  const metrics = parseObjectList(props, 'metrics')
    .map((m) => ({
      value: propString(m, 'value') ?? '',
      label: propString(m, 'label') ?? '',
      helper: propString(m, 'helper') ?? '',
    }))
    .filter((m) => m.value || m.label);

  const sectionClass = buildPremiumSectionClass(
    'animated_stats_strip',
    'lp-stats-strip',
    props,
  );
  const motionAttrs = buildMotionDataAttributes(props);

  const itemsHtml = metrics
    .map(
      (m) => `
      <div class="lp-stats-strip__item lp-motion__child">
        ${renderMetricValue(m.value, countAnimation)}
        <p class="lp-stats-strip__label">${escapeHtml(m.label)}</p>
        ${m.helper ? `<p class="lp-stats-strip__helper">${escapeHtml(m.helper)}</p>` : ''}
      </div>`,
    )
    .join('');

  return `
    <section class="lp-block ${sectionClass} lp-stats-strip--layout-${escapeHtml(layout)} lp-stats-strip--style-${escapeHtml(style)}"${motionAttrs}>
      <div class="lp-section">
        <div class="lp-stats-strip__grid">${itemsHtml}</div>
      </div>
    </section>`;
}

export function renderPremiumTestimonialsHtml(props: Record<string, unknown>): string {
  const style = propString(props, 'style') ?? 'cards';
  const title = propString(props, 'title');
  const testimonials = parseObjectList(props, 'testimonials')
    .map((t) => ({
      quote: propString(t, 'quote', 'text') ?? '',
      author: propString(t, 'author', 'name') ?? '',
      role: propString(t, 'role', 'subtitle') ?? '',
    }))
    .filter((t) => t.quote);

  const sectionClass = buildPremiumSectionClass(
    'premium_testimonials',
    'lp-premium-testimonials',
    props,
  );
  const motionAttrs = buildMotionDataAttributes(props);

  const cardsHtml = testimonials
    .map(
      (t) => `
      <blockquote class="lp-premium-testimonials__card lp-motion__child">
        <p class="lp-premium-testimonials__quote">« ${escapeHtml(t.quote)} »</p>
        <footer class="lp-premium-testimonials__author">
          <cite>${escapeHtml(t.author)}</cite>
          ${t.role ? `<span class="lp-premium-testimonials__role">${escapeHtml(t.role)}</span>` : ''}
        </footer>
      </blockquote>`,
    )
    .join('');

  return `
    <section class="lp-block ${sectionClass} lp-premium-testimonials--style-${escapeHtml(style)}"${motionAttrs}>
      <div class="lp-section">
        ${title ? `<h2 class="lp-section-title">${escapeHtml(title)}</h2>` : ''}
        <div class="lp-premium-testimonials__grid">${cardsHtml}</div>
      </div>
    </section>`;
}

export function renderVehicleShowcaseSplitHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const layout = propString(props, 'layout') ?? 'image_right';
  const visualStyle = propString(props, 'visualStyle') ?? 'dark_card';
  const brand = propString(props, 'brand');
  const model = propString(props, 'model');
  const headline = propString(props, 'headline', 'title');
  const subtitle = propString(props, 'subtitle');
  const price = propString(props, 'price');
  const imageSrc = resolveHeroImageSrc(props, context);
  const imageAlt = propString(props, 'alt') ?? model ?? headline ?? 'Véhicule';
  const focal = resolveHeroFocalPoint(props);
  const focalStyle = buildHeroFocalInlineStyle(focal.x, focal.y);

  const specs = parseObjectList(props, 'specs')
    .map((s) => ({
      label: propString(s, 'label') ?? '',
      value: propString(s, 'value') ?? '',
    }))
    .filter((s) => s.label || s.value);

  const ctas = parseObjectList(props, 'ctas')
    .map((c) => ({
      label: propString(c, 'label') ?? '',
      href: sanitizeExportHref(propString(c, 'href', 'target')),
      variant: propString(c, 'variant') === 'secondary' ? 'secondary' : 'primary',
    }))
    .filter((c) => c.label);

  const sectionClass = buildPremiumSectionClass(
    'vehicle_showcase_split',
    'lp-vehicle-showcase',
    props,
  );
  const motionAttrs = buildMotionDataAttributes(props);

  const specsHtml = specs
    .map(
      (s) =>
        `<li class="lp-vehicle-showcase__spec"><span>${escapeHtml(s.label)}</span><strong>${escapeHtml(s.value)}</strong></li>`,
    )
    .join('');

  const ctasHtml = ctas
    .map(
      (c) =>
        `<a class="lp-btn lp-btn--${c.variant} lp-btn--md" href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>`,
    )
    .join('');

  const mediaHtml = imageSrc
    ? `<div class="lp-vehicle-showcase__media" style="${focalStyle}"><img class="lp-vehicle-showcase__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" /></div>`
    : `<div class="lp-vehicle-showcase__media lp-vehicle-showcase__media--placeholder" aria-hidden="true"></div>`;

  const bodyHtml = `
    <div class="lp-vehicle-showcase__body">
      ${brand ? `<p class="lp-vehicle-showcase__brand">${escapeHtml(brand)}</p>` : ''}
      ${model ? `<p class="lp-vehicle-showcase__model">${escapeHtml(model)}</p>` : ''}
      ${headline ? `<h2 class="lp-vehicle-showcase__headline">${escapeHtml(headline)}</h2>` : ''}
      ${subtitle ? `<p class="lp-vehicle-showcase__subtitle">${escapeHtml(subtitle)}</p>` : ''}
      ${price ? `<p class="lp-vehicle-showcase__price">${escapeHtml(price)}</p>` : ''}
      ${specsHtml ? `<ul class="lp-vehicle-showcase__specs">${specsHtml}</ul>` : ''}
      ${ctasHtml ? `<div class="lp-vehicle-showcase__ctas">${ctasHtml}</div>` : ''}
    </div>`;

  const panelInner =
    layout === 'image_left'
      ? `${mediaHtml}${bodyHtml}`
      : layout === 'background_focus'
        ? `${mediaHtml}<div class="lp-vehicle-showcase__overlay">${bodyHtml}</div>`
        : `${bodyHtml}${mediaHtml}`;

  return `
    <section class="lp-block ${sectionClass} lp-vehicle-showcase--layout-${escapeHtml(layout)} lp-vehicle-showcase--style-${escapeHtml(visualStyle)}"${motionAttrs}>
      <div class="lp-section">
        <div class="lp-vehicle-showcase__panel">${panelInner}</div>
      </div>
    </section>`;
}

export function renderStickyLeadCtaHtml(props: Record<string, unknown>): string {
  const stickyMode = propString(props, 'stickyMode') ?? 'none';
  const style = propString(props, 'style') ?? 'brand';
  const label = propString(props, 'label');
  const title = propString(props, 'title');
  const primaryRaw = props.primaryCta;
  const secondaryRaw = props.secondaryCta;
  const primary =
    primaryRaw && typeof primaryRaw === 'object' && !Array.isArray(primaryRaw)
      ? (primaryRaw as Record<string, unknown>)
      : {};
  const secondary =
    secondaryRaw && typeof secondaryRaw === 'object' && !Array.isArray(secondaryRaw)
      ? (secondaryRaw as Record<string, unknown>)
      : {};

  const primaryLabel =
    propString(props, 'primaryCtaLabel') ?? propString(primary, 'label');
  const primaryHref = sanitizeExportHref(
    propString(props, 'primaryCtaHref') ?? propString(primary, 'href', 'target'),
  );
  const secondaryLabel =
    propString(props, 'secondaryCtaLabel') ?? propString(secondary, 'label');
  const secondaryHref = sanitizeExportHref(
    propString(props, 'secondaryCtaHref') ?? propString(secondary, 'href', 'target'),
    '#offer',
  );

  const sectionClass = buildPremiumSectionClass('sticky_lead_cta', 'lp-sticky-cta', props);
  const motionAttrs = buildMotionDataAttributes(props);

  return `
    <section class="lp-block ${sectionClass} lp-sticky-cta--mode-${escapeHtml(stickyMode)} lp-sticky-cta--style-${escapeHtml(style)}"${motionAttrs}>
      <div class="lp-sticky-cta__inner">
        <div class="lp-sticky-cta__copy">
          ${label ? `<p class="lp-sticky-cta__label">${escapeHtml(label)}</p>` : ''}
          ${title ? `<p class="lp-sticky-cta__title">${escapeHtml(title)}</p>` : ''}
        </div>
        <div class="lp-sticky-cta__actions">
          ${primaryLabel ? `<a class="lp-btn lp-btn--primary lp-btn--md" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>` : ''}
          ${secondaryLabel ? `<a class="lp-btn lp-btn--secondary lp-btn--md" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a>` : ''}
        </div>
      </div>
    </section>`;
}

export function renderCampaignTimelineStepsHtml(props: Record<string, unknown>): string {
  const style = propString(props, 'style') ?? 'cards';
  const title = propString(props, 'title');
  const steps = parseObjectList(props, 'steps')
    .map((s, index) => ({
      index: index + 1,
      title: propString(s, 'title') ?? '',
      description: propString(s, 'description') ?? '',
    }))
    .filter((s) => s.title || s.description);

  const sectionClass = buildPremiumSectionClass(
    'campaign_timeline_steps',
    'lp-campaign-timeline',
    props,
  );
  const motionAttrs = buildMotionDataAttributes(props);

  const stepsHtml = steps
    .map(
      (s) => `
      <li class="lp-campaign-timeline__step lp-motion__child">
        <span class="lp-campaign-timeline__index">${s.index}</span>
        <div class="lp-campaign-timeline__content">
          <h3 class="lp-campaign-timeline__title">${escapeHtml(s.title)}</h3>
          <p class="lp-campaign-timeline__text">${escapeHtml(s.description)}</p>
        </div>
      </li>`,
    )
    .join('');

  return `
    <section class="lp-block ${sectionClass} lp-campaign-timeline--style-${escapeHtml(style)}"${motionAttrs}>
      <div class="lp-section">
        ${title ? `<h2 class="lp-section-title">${escapeHtml(title)}</h2>` : ''}
        <ol class="lp-campaign-timeline__list">${stepsHtml}</ol>
      </div>
    </section>`;
}
