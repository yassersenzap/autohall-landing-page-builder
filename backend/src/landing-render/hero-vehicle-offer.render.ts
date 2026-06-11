import type { LandingRenderContext } from './render-asset.types';
import { buildBrandInlineStyle, resolveBrandPresetTokens } from './brand-presets';
import {
  buildHeroFocalInlineStyle,
  resolveHeroFocalPoint,
  resolveHeroImageAlt,
} from './hero-image-controls';

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function resolveAssetImage(
  props: Record<string, unknown>,
  assetKey: string,
  urlKey: string,
  context?: LandingRenderContext,
): string | null {
  const assetId = propString(props, assetKey);
  if (assetId && context?.assetMap[assetId]) {
    const entry = context.assetMap[assetId];
    return context.mode === 'export' ? entry.exportPath : entry.previewUrl;
  }

  const imageUrl = propString(props, urlKey);
  if (!imageUrl) return null;

  const lower = imageUrl.toLowerCase();
  if (context?.mode === 'export') {
    if (lower.startsWith('data:')) return null;
    if (lower.includes('/api/assets/')) return null;
  }

  return imageUrl;
}

function readDesign(props: Record<string, unknown>): Record<string, unknown> {
  const raw = props.design;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function buildSectionClasses(props: Record<string, unknown>): string {
  const design = readDesign(props);
  const focal = resolveHeroFocalPoint(props);
  const layoutVariant = pick(props.layoutVariant, [
    'split-media-right',
    'split-media-left',
    'full-bleed-overlay',
    'stacked-mobile',
  ] as const, 'split-media-right');
  const imageFit = pick(props.imageFit, ['cover', 'contain'] as const, 'cover');
  const imagePosition = pick(props.imagePosition, ['left', 'right', 'background'] as const, 'right');
  const overlayIntensity = pick(props.overlayIntensity, ['none', 'light', 'medium', 'heavy'] as const, 'medium');
  const tone = pick(design.tone, ['light', 'dark', 'brand'] as const, 'brand');
  const density = pick(design.density, ['compact', 'comfortable', 'immersive'] as const, 'comfortable');
  const ctaStyle = pick(design.ctaStyle, ['primary', 'outline', 'ghost'] as const, 'primary');
  const alignContent = pick(design.alignContent, ['left', 'center'] as const, 'left');
  const showOfferBadge = design.showOfferBadge !== false;

  return [
    'lp-hero-vehicle-offer',
    `lp-hero-vehicle-offer--layout-${layoutVariant}`,
    `lp-hero-vehicle-offer--fit-${imageFit}`,
    `lp-hero-vehicle-offer--position-${imagePosition}`,
    `lp-hero-vehicle-offer--crop-${focal.cropPreset}`,
    `lp-hero-vehicle-offer--overlay-${overlayIntensity}`,
    `lp-hero-vehicle-offer--tone-${tone}`,
    `lp-hero-vehicle-offer--density-${density}`,
    `lp-hero-vehicle-offer--cta-${ctaStyle}`,
    `lp-hero-vehicle-offer--align-${alignContent}`,
    showOfferBadge ? 'lp-hero-vehicle-offer--has-badge' : 'lp-hero-vehicle-offer--no-badge',
  ].join(' ');
}

function buildSectionInlineStyle(props: Record<string, unknown>, brandId: unknown): string {
  const brand = resolveBrandPresetTokens(brandId);
  const focal = resolveHeroFocalPoint(props);
  return [buildBrandInlineStyle(brand), buildHeroFocalInlineStyle(focal.x, focal.y)].join('; ');
}

function renderPlaceholderHtml(alt: string, wrapperClass?: string): string {
  const placeholder = `<div class="lp-hero-vehicle-offer__media-placeholder" role="img" aria-label="${escapeHtml(alt)}"><span class="lp-hero-vehicle-offer__media-placeholder-icon" aria-hidden="true">◫</span><span class="lp-hero-vehicle-offer__media-placeholder-label">Aperçu véhicule</span></div>`;
  return wrapperClass ? `<div class="${wrapperClass}">${placeholder}</div>` : placeholder;
}

function renderImageHtml(
  props: Record<string, unknown>,
  assetKey: string,
  urlKey: string,
  alt: string,
  context?: LandingRenderContext,
  wrapperClass?: string,
): string {
  const src = resolveAssetImage(props, assetKey, urlKey, context);
  if (!src) {
    return renderPlaceholderHtml(alt, wrapperClass);
  }

  const img = `<img class="lp-hero-vehicle-offer__img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="eager" decoding="async" />`;
  return wrapperClass ? `<div class="${wrapperClass}">${img}</div>` : img;
}

function renderMediaHtml(
  props: Record<string, unknown>,
  alt: string,
  context?: LandingRenderContext,
): string {
  const overlay =
    pick(props.overlayIntensity, ['none', 'light', 'medium', 'heavy'] as const, 'medium') !== 'none'
      ? '<div class="lp-hero-vehicle-offer__overlay" aria-hidden="true"></div>'
      : '';

  const desktopSrc = resolveAssetImage(props, 'heroImage', 'heroImageUrl', context);
  const mobileSrc = resolveAssetImage(props, 'mobileImage', 'mobileImageUrl', context);

  const desktop = desktopSrc
    ? renderImageHtml(props, 'heroImage', 'heroImageUrl', alt, context, 'lp-hero-vehicle-offer__img-desktop')
    : mobileSrc
      ? renderImageHtml(props, 'mobileImage', 'mobileImageUrl', alt, context, 'lp-hero-vehicle-offer__img-desktop')
      : renderPlaceholderHtml(alt, 'lp-hero-vehicle-offer__img-desktop');

  const mobile = mobileSrc
    ? `<div class="lp-hero-vehicle-offer__img-mobile"><img class="lp-hero-vehicle-offer__img" src="${escapeHtml(mobileSrc)}" alt="${escapeHtml(alt)}" loading="eager" decoding="async" /></div>`
    : '';

  return `<div class="lp-hero-vehicle-offer__media" data-lp-media="true">${desktop}${mobile}${overlay}</div>`;
}

export function renderHeroVehicleOfferHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const brand = resolveBrandPresetTokens(props.brandId);
  const sectionClass = buildSectionClasses(props);
  const inlineStyle = buildSectionInlineStyle(props, props.brandId);

  const modelName = propString(props, 'modelName');
  const headline = propString(props, 'headline');
  const subheadline = propString(props, 'subheadline');
  const offerLabel = propString(props, 'offerLabel');
  const priceText = propString(props, 'priceText');
  const primaryCta = propString(props, 'primaryCtaLabel');
  const secondaryCta = propString(props, 'secondaryCtaLabel');
  const design = readDesign(props);
  const showBadge = design.showOfferBadge !== false && offerLabel;

  const imageAlt = resolveHeroImageAlt(props);
  const layoutVariant = pick(props.layoutVariant, [
    'split-media-right',
    'split-media-left',
    'full-bleed-overlay',
    'stacked-mobile',
  ] as const, 'split-media-right');
  const imagePosition = pick(props.imagePosition, ['left', 'right', 'background'] as const, 'right');
  const isBackground = imagePosition === 'background' || layoutVariant === 'full-bleed-overlay';
  const ctaStyle = pick(design.ctaStyle, ['primary', 'outline', 'ghost'] as const, 'primary');

  const primaryCtaClass = `lp-hero-vehicle-offer__cta lp-hero-vehicle-offer__cta--primary lp-hero-vehicle-offer__cta--${ctaStyle}`;
  const secondaryCtaClass = `lp-hero-vehicle-offer__cta lp-hero-vehicle-offer__cta--secondary lp-hero-vehicle-offer__cta--${ctaStyle === 'primary' ? 'outline' : ctaStyle}`;

  const contentHtml = `
    <div class="lp-hero-vehicle-offer__content">
      <p class="lp-hero-vehicle-offer__brand">${escapeHtml(brand.name)}</p>
      ${modelName ? `<p class="lp-hero-vehicle-offer__model">${escapeHtml(modelName)}</p>` : ''}
      ${showBadge ? `<span class="lp-hero-vehicle-offer__badge">${escapeHtml(offerLabel!)}</span>` : ''}
      ${headline ? `<h1 class="lp-hero-vehicle-offer__headline">${escapeHtml(headline)}</h1>` : ''}
      ${subheadline ? `<p class="lp-hero-vehicle-offer__subheadline">${escapeHtml(subheadline)}</p>` : ''}
      ${priceText ? `<p class="lp-hero-vehicle-offer__price">${escapeHtml(priceText)}</p>` : ''}
      <div class="lp-hero-vehicle-offer__actions">
        ${primaryCta ? `<a href="#lead-form" class="${primaryCtaClass}">${escapeHtml(primaryCta)}</a>` : ''}
        ${secondaryCta ? `<a href="#offer" class="${secondaryCtaClass}">${escapeHtml(secondaryCta)}</a>` : ''}
      </div>
    </div>`;

  const mediaHtml = renderMediaHtml(props, imageAlt, context);
  const mediaFirst =
    layoutVariant === 'split-media-left' || imagePosition === 'left';

  if (isBackground) {
    return `
    <section class="${sectionClass}" style="${inlineStyle}">
      ${mediaHtml}
      <div class="lp-hero-vehicle-offer__inner">
        ${contentHtml}
      </div>
    </section>`;
  }

  return `
    <section class="${sectionClass}" style="${inlineStyle}">
      <div class="lp-hero-vehicle-offer__inner">
        ${mediaFirst ? mediaHtml : contentHtml}
        ${mediaFirst ? contentHtml : mediaHtml}
      </div>
    </section>`;
}
