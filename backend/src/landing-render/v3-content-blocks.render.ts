import type { LandingRenderContext } from './render-asset.types';
import { resolveHeroImageSrc } from './render-asset.resolve';
import { sanitizeExportHref } from './safe-export-link';
import {
  buildBlockCtaClass,
  buildBlockDesignClasses,
  normalizeSectionDesign,
} from './block-design-system';
import { appendSectionStyleToClass } from './section-style/section-style.classes';
import { appendBlockVisualToClass } from './block-visual/block-visual.classes';
import { appendBlockTypographyToClass } from './block-typography/block-typography.classes';

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
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function parseObjectList(props: Record<string, unknown>, key: string): Record<string, unknown>[] {
  if (!Array.isArray(props[key])) return [];
  return props[key].filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}

function renderSectionHeading(heading: string | null, subtitle: string | null): string {
  return `
    ${heading ? `<h2 class="lp-section-title">${escapeHtml(heading)}</h2>` : ''}
    ${subtitle ? `<p class="lp-section-subtitle">${escapeHtml(subtitle)}</p>` : ''}`;
}

function renderTextParagraphs(content: string): string {
  const parts = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return '';
  return parts.map((part) => `<p class="lp-text__p">${escapeHtml(part)}</p>`).join('');
}

export function renderCtaBandHtml(props: Record<string, unknown>): string {
  const design = normalizeSectionDesign('cta_band', props);
  const sectionClass = appendSectionStyleToClass(
    appendBlockTypographyToClass(
      appendBlockVisualToClass(
        'cta_band',
        `lp-block ${buildBlockDesignClasses('lp-cta-band', design)}`,
        props,
      ),
      'cta_band',
      props,
    ),
    props,
  );
  const btnClass = buildBlockCtaClass(design, 'lp-btn lp-btn--md');

  const title = propString(props, 'title', 'heading');
  const buttonText = propString(props, 'buttonText', 'label');
  const buttonHref = sanitizeExportHref(
    propString(props, 'buttonHref', 'buttonTarget', 'target'),
  );

  if (!title && !buttonText) return '';

  return `
    <section class="${sectionClass}">
      <div class="lp-section lp-cta-band__inner">
        ${title ? `<p class="lp-cta-band__text">${escapeHtml(title)}</p>` : ''}
        ${buttonText ? `<a class="${btnClass}" href="${escapeHtml(buttonHref)}">${escapeHtml(buttonText)}</a>` : ''}
      </div>
    </section>`;
}

export function renderRichTextHtml(props: Record<string, unknown>): string {
  const design = normalizeSectionDesign('rich_text', props);
  const sectionClass = buildBlockDesignClasses('lp-rich-text', design);
  const titre = propString(props, 'titre', 'title', 'heading');
  const contenu = propString(props, 'contenu', 'content', 'body');
  if (!titre && !contenu) return '';

  const alignClass =
    design.alignment === 'left'
      ? 'lp-rich-text__inner--left'
      : design.alignment === 'center'
        ? 'lp-rich-text__inner--center'
        : 'lp-rich-text__inner--center';

  return `
    <section class="lp-block ${sectionClass}">
      <div class="lp-section">
        <div class="lp-rich-text__inner ${alignClass}">
          ${titre ? `<h2 class="lp-rich-text__title">${escapeHtml(titre)}</h2>` : ''}
          ${contenu ? `<div class="lp-rich-text__body">${renderTextParagraphs(contenu)}</div>` : ''}
        </div>
      </div>
    </section>`;
}

export function renderMediaOnlyHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const design = normalizeSectionDesign('media_only', props);
  const sectionClass = buildBlockDesignClasses('lp-media-only', design);
  const imageSrc = resolveHeroImageSrc(props, context);
  if (!imageSrc) return '';

  const alt = propString(props, 'alt', 'imageAlt') ?? 'Visuel campagne Auto Hall';
  const aspect = propString(props, 'aspectRatio') ?? '16:9';
  const aspectClass =
    aspect === '4:3' ? 'lp-media-only--4-3' : aspect === '21:9' ? 'lp-media-only--21-9' : 'lp-media-only--16-9';

  return `
    <section class="lp-block ${sectionClass} ${aspectClass}">
      <div class="lp-section">
        <figure class="lp-media-only__figure">
          <img class="lp-media-only__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>`;
}

export function renderGalleryHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const design = normalizeSectionDesign('gallery', props);
  const sectionClass = buildBlockDesignClasses('lp-gallery', design);
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const images = parseObjectList(props, 'images');

  const cells = images
    .map((img) => {
      const src = resolveHeroImageSrc(img, context);
      if (!src) return '';
      const alt = propString(img, 'alt') ?? 'Photo véhicule Auto Hall';
      return `<figure class="lp-gallery__cell"><img class="lp-gallery__img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" /></figure>`;
    })
    .filter(Boolean)
    .join('');

  if (!heading && !cells) return '';

  return `
    <section class="lp-block ${sectionClass}">
      <div class="lp-section">
        ${heading || subtitle ? `<div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>` : ''}
        ${cells ? `<div class="lp-gallery__grid">${cells}</div>` : ''}
      </div>
    </section>`;
}

export function renderSpacerDividerHtml(props: Record<string, unknown>): string {
  const design = normalizeSectionDesign('spacer_divider', props);
  const type = propString(props, 'type') ?? 'solid';
  const hauteur = propString(props, 'hauteur') ?? 'M';
  const heightMap: Record<string, string> = { S: '2rem', M: '4rem', L: '6rem', XL: '8rem' };
  const densityScale =
    design.density === 'compact' ? 0.75 : design.density === 'immersive' ? 1.25 : 1;

  if (type === 'divider') {
    return `<div class="lp-spacer lp-spacer--divider lp-spacer--density-${design.density}" role="presentation"></div>`;
  }

  return `<div class="lp-spacer lp-spacer--space lp-spacer--${hauteur.toLowerCase()} lp-spacer--density-${design.density}" style="--lp-spacer-size:${heightMap[hauteur] ?? '4rem'};--lp-spacer-scale:${densityScale}" role="presentation"></div>`;
}

export function renderVideoEmbedHtml(props: Record<string, unknown>): string {
  const design = normalizeSectionDesign('video_embed', props);
  const sectionClass = buildBlockDesignClasses('lp-video-embed', design);
  const videoUrl = propString(props, 'videoUrl', 'url');
  if (!videoUrl) return '';

  const title = propString(props, 'title');
  const embed =
    videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
      ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
      : videoUrl;

  return `
    <section class="lp-block ${sectionClass}">
      <div class="lp-section">
        ${title ? `<h2 class="lp-video-embed__title">${escapeHtml(title)}</h2>` : ''}
        <div class="lp-video-embed__frame">
          <iframe src="${escapeHtml(embed)}" title="${escapeHtml(title ?? 'Vidéo campagne Auto Hall')}" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </section>`;
}

export function renderPricingTrimHtml(props: Record<string, unknown>): string {
  const design = normalizeSectionDesign('pricing_trim', props);
  const sectionClass = buildBlockDesignClasses('lp-pricing-trim', design);
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const trims = parseObjectList(props, 'trims').slice(0, 3);

  const cards = trims
    .map((trim) => {
      const featured = Boolean(trim.featured);
      const name = propString(trim, 'name') ?? '';
      const price = propString(trim, 'price') ?? '';
      const buttonText = propString(trim, 'buttonText') ?? 'Choisir';
      const buttonHref = sanitizeExportHref(
        propString(trim, 'buttonHref', 'buttonTarget'),
      );
      const features = Array.isArray(trim.features)
        ? trim.features.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
        : [];
      const featuresHtml = features
        .map((f) => `<li class="lp-pricing-trim__feature">${escapeHtml(f)}</li>`)
        .join('');
      const cardClass = featured
        ? 'lp-pricing-trim__card lp-pricing-trim__card--featured'
        : 'lp-pricing-trim__card';
      const btnClass = buildBlockCtaClass(
        { ...design, ctaStyle: featured ? 'primary' : 'outline' },
        'lp-btn lp-btn--md lp-pricing-trim__cta',
      );

      if (!name && !price) return '';

      return `
      <article class="${cardClass}">
        ${name ? `<h3 class="lp-pricing-trim__name">${escapeHtml(name)}</h3>` : ''}
        ${price ? `<p class="lp-pricing-trim__price">${escapeHtml(price)}</p>` : ''}
        ${featuresHtml ? `<ul class="lp-pricing-trim__features">${featuresHtml}</ul>` : ''}
        ${buttonText ? `<a class="${btnClass}" href="${escapeHtml(buttonHref)}">${escapeHtml(buttonText)}</a>` : ''}
      </article>`;
    })
    .filter(Boolean)
    .join('');

  if (!heading && !cards) return '';

  return `
    <section class="lp-block ${sectionClass}">
      <div class="lp-section">
        ${heading || subtitle ? `<div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>` : ''}
        ${cards ? `<div class="lp-pricing-trim__grid">${cards}</div>` : ''}
      </div>
    </section>`;
}
