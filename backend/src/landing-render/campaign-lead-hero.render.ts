import type { LandingRenderContext } from './render-asset.types';
import { buildBrandInlineStyle, resolveBrandPresetTokens } from './brand-presets';
import {
  buildHeroFocalInlineStyle,
  resolveHeroFocalPoint,
} from './hero-image-controls';

type CampaignLayout =
  | 'media_left_form_right'
  | 'form_left_media_right'
  | 'background_media_form_right'
  | 'background_media_form_left'
  | 'dual_media_form_right'
  | 'dual_media_form_left';

type ContentPlacement = 'overlay_media' | 'beside_form' | 'hidden';
type FormTheme = 'light' | 'dark' | 'glass';

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
    if (lower.startsWith('blob:')) return null;
  }

  return imageUrl;
}

function readDesign(props: Record<string, unknown>): Record<string, unknown> {
  const raw = props.design;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function resolveLayout(props: Record<string, unknown>): CampaignLayout {
  return pick(
    props.layoutVariant,
    [
      'media_left_form_right',
      'form_left_media_right',
      'background_media_form_right',
      'background_media_form_left',
      'dual_media_form_right',
      'dual_media_form_left',
    ] as const,
    'media_left_form_right',
  );
}

function isBackgroundLayout(layout: CampaignLayout): boolean {
  return layout === 'background_media_form_right' || layout === 'background_media_form_left';
}

function isDualMediaLayout(layout: CampaignLayout): boolean {
  return layout === 'dual_media_form_right' || layout === 'dual_media_form_left';
}

function isFormFirst(layout: CampaignLayout): boolean {
  return (
    layout === 'form_left_media_right' ||
    layout === 'background_media_form_left' ||
    layout === 'dual_media_form_left'
  );
}

function resolveContentPlacement(props: Record<string, unknown>, layout: CampaignLayout): ContentPlacement {
  const raw = props.contentPlacement;
  if (
    typeof raw === 'string' &&
    (raw === 'overlay_media' || raw === 'beside_form' || raw === 'hidden')
  ) {
    return raw;
  }
  if (isBackgroundLayout(layout)) return 'beside_form';
  if (isDualMediaLayout(layout)) return 'overlay_media';
  return 'hidden';
}

function buildSectionClasses(props: Record<string, unknown>): string {
  const design = readDesign(props);
  const focal = resolveHeroFocalPoint(props);
  const layoutVariant = resolveLayout(props);
  const contentPlacement = resolveContentPlacement(props, layoutVariant);
  const imageFit = pick(props.imageFit, ['cover', 'contain'] as const, 'cover');
  const imagePosition = pick(props.imagePosition, ['left', 'right', 'center'] as const, 'center');
  const overlayIntensity = pick(
    props.overlayIntensity,
    ['none', 'light', 'medium', 'heavy'] as const,
    'light',
  );
  const tone = pick(design.tone, ['light', 'dark', 'brand'] as const, 'light');
  const formTheme = pick(design.formTheme, ['light', 'dark', 'glass'] as const, 'light');
  const showOfferBadge = design.showOfferBadge !== false;
  const showProgressBar = design.showProgressBar !== false;

  return [
    'lp-campaign-lead-hero',
    `lp-campaign-lead-hero--layout-${layoutVariant}`,
    `lp-campaign-lead-hero--fit-${imageFit}`,
    `lp-campaign-lead-hero--position-${imagePosition}`,
    `lp-campaign-lead-hero--crop-${focal.cropPreset}`,
    `lp-campaign-lead-hero--overlay-${overlayIntensity}`,
    `lp-campaign-lead-hero--tone-${tone}`,
    `lp-campaign-lead-hero--form-theme-${formTheme}`,
    `lp-campaign-lead-hero--content-${contentPlacement}`,
    showOfferBadge ? 'lp-campaign-lead-hero--has-badge' : 'lp-campaign-lead-hero--no-badge',
    showProgressBar ? 'lp-campaign-lead-hero--has-progress' : 'lp-campaign-lead-hero--no-progress',
  ].join(' ');
}

function buildSectionInlineStyle(props: Record<string, unknown>, brandId: unknown): string {
  const brand = resolveBrandPresetTokens(brandId);
  const focal = resolveHeroFocalPoint(props);
  return [buildBrandInlineStyle(brand), buildHeroFocalInlineStyle(focal.x, focal.y)].join('; ');
}

function resolvePrimaryAlt(props: Record<string, unknown>): string {
  return (
    propString(props, 'primaryImageAlt') ??
    propString(props, 'campaignTitle') ??
    'Visuel campagne'
  );
}

function renderPlaceholderHtml(alt: string, label: string, wrapperClass?: string): string {
  const placeholder = `<div class="lp-campaign-lead-hero__media-placeholder" role="img" aria-label="${escapeHtml(alt)}"><span class="lp-campaign-lead-hero__media-placeholder-icon" aria-hidden="true">◫</span><span class="lp-campaign-lead-hero__media-placeholder-label">${escapeHtml(label)}</span></div>`;
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
    return renderPlaceholderHtml(alt, 'Visuel campagne', wrapperClass);
  }

  const img = `<img class="lp-campaign-lead-hero__img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="eager" decoding="async" />`;
  return wrapperClass ? `<div class="${wrapperClass}">${img}</div>` : img;
}

function renderMediaInnerHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const layout = resolveLayout(props);
  const dual = isDualMediaLayout(layout);
  const primaryAlt = resolvePrimaryAlt(props);
  const secondaryAlt = propString(props, 'secondaryImageAlt') ?? primaryAlt;

  if (dual) {
    const primary = resolveAssetImage(props, 'primaryImage', 'primaryImageUrl', context)
      ? renderImageHtml(props, 'primaryImage', 'primaryImageUrl', primaryAlt, context)
      : renderPlaceholderHtml(primaryAlt, 'Visuel 1');
    const secondary = resolveAssetImage(props, 'secondaryImage', 'secondaryImageUrl', context)
      ? renderImageHtml(props, 'secondaryImage', 'secondaryImageUrl', secondaryAlt, context)
      : renderPlaceholderHtml(secondaryAlt, 'Visuel 2');

    return `<div class="lp-campaign-lead-hero__dual-media"><div class="lp-campaign-lead-hero__media-primary">${primary}</div><div class="lp-campaign-lead-hero__media-secondary">${secondary}</div></div>`;
  }

  const desktopSrc = resolveAssetImage(props, 'primaryImage', 'primaryImageUrl', context);
  const mobileSrc = resolveAssetImage(props, 'mobileImage', 'mobileImageUrl', context);

  const desktop = desktopSrc
    ? renderImageHtml(props, 'primaryImage', 'primaryImageUrl', primaryAlt, context, 'lp-campaign-lead-hero__img-desktop')
    : mobileSrc
      ? renderImageHtml(props, 'mobileImage', 'mobileImageUrl', primaryAlt, context, 'lp-campaign-lead-hero__img-desktop')
      : renderPlaceholderHtml(primaryAlt, 'Visuel campagne', 'lp-campaign-lead-hero__img-desktop');

  const mobile = mobileSrc
    ? `<div class="lp-campaign-lead-hero__img-mobile"><img class="lp-campaign-lead-hero__img" src="${escapeHtml(mobileSrc)}" alt="${escapeHtml(primaryAlt)}" loading="eager" decoding="async" /></div>`
    : '';

  return `${desktop}${mobile}`;
}

function renderMediaHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const overlay =
    pick(props.overlayIntensity, ['none', 'light', 'medium', 'heavy'] as const, 'light') !== 'none'
      ? '<div class="lp-campaign-lead-hero__overlay" aria-hidden="true"></div>'
      : '';

  return `<div class="lp-campaign-lead-hero__media" data-lp-media="true">${renderMediaInnerHtml(props, context)}${overlay}</div>`;
}

function renderCampaignHtml(
  props: Record<string, unknown>,
  brandName: string,
  mode: 'overlay' | 'beside',
): string {
  const design = readDesign(props);
  const campaignTitle = propString(props, 'campaignTitle');
  const campaignSubtitle = propString(props, 'campaignSubtitle');
  const offerBadge = propString(props, 'offerBadge');
  const showBadge = design.showOfferBadge !== false && offerBadge;
  const modeClass =
    mode === 'overlay'
      ? 'lp-campaign-lead-hero__campaign--overlay'
      : 'lp-campaign-lead-hero__campaign--beside';

  return `
    <div class="lp-campaign-lead-hero__campaign ${modeClass}">
      <p class="lp-campaign-lead-hero__brand">${escapeHtml(brandName)}</p>
      ${showBadge ? `<span class="lp-campaign-lead-hero__badge">${escapeHtml(offerBadge!)}</span>` : ''}
      ${campaignTitle ? `<h1 class="lp-campaign-lead-hero__title">${escapeHtml(campaignTitle)}</h1>` : ''}
      ${campaignSubtitle ? `<p class="lp-campaign-lead-hero__subtitle">${escapeHtml(campaignSubtitle)}</p>` : ''}
    </div>`;
}

function renderFormShellHtml(props: Record<string, unknown>): string {
  const design = readDesign(props);
  const formTitle = propString(props, 'formTitle');
  const formSubtitle = propString(props, 'formSubtitle');
  const formStepLabel = propString(props, 'formStepLabel');
  const formPrimaryFieldLabel = propString(props, 'formPrimaryFieldLabel');
  const formCtaLabel = propString(props, 'formCtaLabel');
  const legalText = propString(props, 'legalText');
  const footerText = propString(props, 'footerText');
  const showProgress = design.showProgressBar !== false;

  const progressHtml = showProgress
    ? `<div class="lp-campaign-lead-hero__progress" aria-hidden="true">
        <div class="lp-campaign-lead-hero__progress-track">
          <span class="lp-campaign-lead-hero__progress-fill"></span>
        </div>
        ${formStepLabel ? `<p class="lp-campaign-lead-hero__step-label">${escapeHtml(formStepLabel)}</p>` : ''}
      </div>`
    : '';

  const fieldLabel = formPrimaryFieldLabel ?? 'Champ principal';

  return `
    <aside class="lp-campaign-lead-hero__form" id="lead-form">
      <div class="lp-campaign-lead-hero__form-card">
        ${progressHtml}
        ${formTitle ? `<h2 class="lp-campaign-lead-hero__form-title">${escapeHtml(formTitle)}</h2>` : ''}
        ${formSubtitle ? `<p class="lp-campaign-lead-hero__form-subtitle">${escapeHtml(formSubtitle)}</p>` : ''}
        <div class="lp-campaign-lead-hero__field-shell">
          <label class="lp-campaign-lead-hero__field-label">${escapeHtml(fieldLabel)}</label>
          <select class="lp-campaign-lead-hero__field-control" disabled>
            <option value="">${escapeHtml(formPrimaryFieldLabel ?? 'Sélectionnez une option')}</option>
          </select>
        </div>
        ${formCtaLabel ? `<button type="button" class="lp-campaign-lead-hero__cta" disabled>${escapeHtml(formCtaLabel)}</button>` : ''}
        ${legalText ? `<p class="lp-campaign-lead-hero__legal">${escapeHtml(legalText)}</p>` : ''}
        ${footerText ? `<p class="lp-campaign-lead-hero__footer">${escapeHtml(footerText)}</p>` : ''}
      </div>
    </aside>`;
}

export function renderCampaignLeadHeroHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const brand = resolveBrandPresetTokens(props.brandId);
  const sectionClass = buildSectionClasses(props);
  const inlineStyle = buildSectionInlineStyle(props, props.brandId);
  const layout = resolveLayout(props);
  const background = isBackgroundLayout(layout);
  const formFirst = isFormFirst(layout);
  const placement = resolveContentPlacement(props, layout);

  const mediaHtml = renderMediaHtml(props, context);
  const formHtml = renderFormShellHtml(props);
  const overlayCampaign =
    placement === 'overlay_media' ? renderCampaignHtml(props, brand.name, 'overlay') : '';
  const besideCampaign =
    placement === 'beside_form' ? renderCampaignHtml(props, brand.name, 'beside') : '';

  if (background) {
    return `
    <section class="${sectionClass}" style="${inlineStyle}">
      ${mediaHtml}
      <div class="lp-campaign-lead-hero__inner">
        ${formFirst ? `${formHtml}${besideCampaign}` : `${besideCampaign}${formHtml}`}
      </div>
    </section>`;
  }

  const mediaStage = `<div class="lp-campaign-lead-hero__media-stage">${mediaHtml}${overlayCampaign}</div>`;

  return `
    <section class="${sectionClass}" style="${inlineStyle}">
      <div class="lp-campaign-lead-hero__inner">
        ${formFirst ? formHtml : ''}
        ${mediaStage}
        ${formFirst ? '' : formHtml}
      </div>
    </section>`;
}
