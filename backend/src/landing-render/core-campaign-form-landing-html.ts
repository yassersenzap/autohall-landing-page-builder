/**
 * Backend HTML renderer for core_campaign_form_landing.
 * Synced with frontend/src/packages/blocks/core-campaign-form-landing/render-html.ts
 */
import { buildCoreCampaignImageInlineStyle } from './core-campaign-view-model';
import { coreLayoutPresentationClasses, resolveCoreCampaignLayout } from './core-campaign-form-landing.layout';
import { resolveCoreFormSteps } from './core-campaign-form-steps';

type CoreOverlayStrength = 'light' | 'medium' | 'strong';

const CORE_SCRIM_STOPS: Record<CoreOverlayStrength, { bottom: number; mid: number }> = {
  light: { bottom: 0.55, mid: 0.18 },
  medium: { bottom: 0.85, mid: 0.3 },
  strong: { bottom: 0.92, mid: 0.5 },
};

function resolveCoreScrimStops(strength: CoreOverlayStrength) {
  return CORE_SCRIM_STOPS[strength];
}

export type CoreCampaignFeaturedModel = {
  value: string;
  label: string;
};

export type LeadFormFieldSpec = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type CoreCampaignHtmlDeps = {
  resolveImageSrc: (props: Record<string, unknown>) => string | null;
  sanitizeHref: (href: string | null) => string;
  buildLeadFormFieldSpecs: (formProps: Record<string, unknown>) => LeadFormFieldSpec[];
  renderLeadFormFieldsHtml: (
    formProps: Record<string, unknown>,
    fields?: LeadFormFieldSpec[],
  ) => string;
  renderLeadFormConsentHtml: (formProps: Record<string, unknown>) => string;
  appendSectionStyleToClass: (baseClass: string, props: Record<string, unknown>) => string;
  appendSectionStyleToInlineStyle: (
    baseInlineStyle: string,
    props: Record<string, unknown>,
  ) => string;
  featuredModels: CoreCampaignFeaturedModel[];
};

function propString(props: Record<string, unknown>, ...keys: string[]): string | null {
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

function parseFormProps(props: Record<string, unknown>): Record<string, unknown> {
  const form = props.form;
  if (form && typeof form === 'object' && !Array.isArray(form)) {
    return { ...props, ...(form as Record<string, unknown>) };
  }
  return props;
}

function mediaScrimStyleAttr(strength: string | null): string {
  const overlayStrength: CoreOverlayStrength =
    strength === 'light' || strength === 'strong' ? strength : 'medium';
  const { bottom, mid } = resolveCoreScrimStops(overlayStrength);
  return `--scrim-bottom:${bottom};--scrim-mid:${mid}`;
}

function mediaOverlayHtml(props: Record<string, unknown>): string {
  const overlayColor = propString(props, 'overlayColor') || '#000000';
  const overlayOpacity = props.overlayOpacity !== undefined ? Number(props.overlayOpacity) : 45;
  if (overlayOpacity <= 0) return '';
  return `<div class="lp-core-campaign-landing__media-scrim lp-core-campaign-landing__media-overlay" aria-hidden="true" style="background-color:${escapeHtml(overlayColor)};opacity:${overlayOpacity / 100};"></div>`;
}

function overlayClass(strength: string | null): string {
  if (strength === 'light') return 'lp-core-campaign-landing--overlay-light';
  if (strength === 'strong') return 'lp-core-campaign-landing--overlay-strong';
  return 'lp-core-campaign-landing--overlay-medium';
}

const PREMIUM_STEP_ONE_FIELDS = new Set(['city', 'preferredDate']);

function partitionPremiumFormFields(specs: LeadFormFieldSpec[]): {
  stepOne: LeadFormFieldSpec[];
  stepTwo: LeadFormFieldSpec[];
} {
  const stepOne: LeadFormFieldSpec[] = [];
  const stepTwo: LeadFormFieldSpec[] = [];
  for (const spec of specs) {
    if (PREMIUM_STEP_ONE_FIELDS.has(spec.name)) {
      stepOne.push(spec);
    } else {
      stepTwo.push(spec);
    }
  }
  return { stepOne, stepTwo };
}

function renderStepIndicatorHtml(stepIndex: number, stepCount: number): string {
  const progressPct = Math.round((stepIndex / stepCount) * 100);
  return `
    <div class="lp-core-campaign-landing__steps" data-lp-step-indicator>
      <p class="lp-core-campaign-landing__step-label" data-lp-step-label>Étape ${stepIndex}/${stepCount}</p>
      <div class="lp-core-campaign-landing__step-progress" role="progressbar" aria-valuenow="${stepIndex}" aria-valuemin="1" aria-valuemax="${stepCount}" aria-label="Étape ${stepIndex} sur ${stepCount}">
        <span class="lp-core-campaign-landing__step-progress-fill" data-lp-step-progress style="width:${progressPct}%"></span>
      </div>
    </div>`;
}

function renderVehicleSelectHtml(deps: CoreCampaignHtmlDeps): string {
  const options = deps.featuredModels
    .map(
      (model) =>
        `<option value="${escapeHtml(model.value)}">${escapeHtml(model.label)}</option>`,
    )
    .join('');

  return `
        <label class="lp-lead-form__field lp-lead-form__field--full">
          <span class="lp-lead-form__label">Modèle souhaité</span>
          <select class="lp-lead-form__input lp-lead-form__select" name="vehicleModel">
            <option value="">Sélectionner un modèle</option>
            ${options}
          </select>
        </label>`;
}

function renderPremiumFormHtml(
  formProps: Record<string, unknown>,
  props: Record<string, unknown>,
  deps: CoreCampaignHtmlDeps,
): string {
  const steps = resolveCoreFormSteps(props);
  const stepCount = steps.length;
  const stepIndex = Math.min(
    Math.max(typeof props.stepIndex === 'number' ? props.stepIndex : 1, 1),
    stepCount,
  );

  const formTitle = propString(formProps, 'formTitle', 'title') ?? propString(props, 'formTitle');
  const formSubtitle =
    propString(formProps, 'formSubtitle', 'subtitle') ?? propString(props, 'formSubtitle');
  const submitText =
    propString(formProps, 'submitText') ??
    propString(props, 'submitText') ??
    "Confirmer ma demande d'essai";

  const hasMultiStep = stepCount > 1;
  const currentStep = steps[stepIndex - 1];
  const displayTitle = currentStep ? currentStep.title : formTitle || 'Planifiez votre essai';

  const hasSelectStep = steps.some((s) => s.type === 'select');
  const allSpecs = deps.buildLeadFormFieldSpecs(formProps);
  const { stepOne, stepTwo } = partitionPremiumFormFields(allSpecs);
  const consentHtml = deps.renderLeadFormConsentHtml(formProps);

  const stepPanelsHtml = steps
    .map((stepDef, i) => {
      const idx = i + 1;
      const isCurrent = idx === stepIndex;
      const hiddenAttr = hasMultiStep && !isCurrent ? ' hidden' : '';

      let contentHtml = '';
      const isLast = idx === stepCount;

      if (stepDef.type === 'select') {
        contentHtml = `
        <div class="lp-lead-form__grid">
          ${renderVehicleSelectHtml(deps)}
        </div>`;
      } else if (hasSelectStep) {
        if (stepCount === 2) {
          contentHtml = `
            <div class="lp-lead-form__grid">
              ${deps.renderLeadFormFieldsHtml(formProps, stepOne)}
              ${deps.renderLeadFormFieldsHtml(formProps, stepTwo)}
            </div>
            ${consentHtml ? `<div class="lp-core-campaign-landing__consent">${consentHtml}</div>` : ''}`;
        } else {
          const isFirstInput = idx === 2;
          if (isFirstInput) {
            contentHtml = `
              <div class="lp-lead-form__grid">
                ${deps.renderLeadFormFieldsHtml(formProps, stepOne)}
              </div>`;
          } else {
            contentHtml = `
              <div class="lp-lead-form__grid">
                ${deps.renderLeadFormFieldsHtml(formProps, stepTwo)}
              </div>
              ${consentHtml ? `<div class="lp-core-campaign-landing__consent">${consentHtml}</div>` : ''}`;
          }
        }
      } else if (stepCount <= 1) {
        contentHtml = `
            <div class="lp-lead-form__grid">
              ${deps.renderLeadFormFieldsHtml(formProps)}
            </div>
            ${consentHtml ? `<div class="lp-core-campaign-landing__consent">${consentHtml}</div>` : ''}`;
      } else if (idx === 1) {
        contentHtml = `
              <div class="lp-lead-form__grid">
                ${deps.renderLeadFormFieldsHtml(formProps, stepOne)}
              </div>`;
      } else {
        contentHtml = `
              <div class="lp-lead-form__grid">
                ${deps.renderLeadFormFieldsHtml(formProps, stepTwo)}
              </div>
              ${consentHtml ? `<div class="lp-core-campaign-landing__consent">${consentHtml}</div>` : ''}`;
      }

      let buttonsHtml = '';
      if (hasMultiStep) {
        if (isLast) {
          buttonsHtml = `
          <div class="lp-core-campaign-landing__form-actions" style="display:flex;gap:12px;">
            <button type="button" class="lp-btn lp-btn--secondary lp-lead-form__back" data-lp-form-back>Retour</button>
            <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit">${escapeHtml(submitText)}</button>
          </div>`;
        } else {
          const backBtn =
            idx > 1
              ? `<button type="button" class="lp-btn lp-btn--secondary lp-lead-form__back" data-lp-form-back>Retour</button>`
              : '';
          buttonsHtml = `
          <div class="lp-core-campaign-landing__form-actions" style="display:flex;gap:12px;">
            ${backBtn}
            <button type="button" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit lp-lead-form__continue" data-lp-form-advance>Continuer</button>
          </div>`;
        }
      } else {
        buttonsHtml = `<button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit">${escapeHtml(submitText)}</button>`;
      }

      return `
        <div class="lp-lead-form__step" data-lp-form-step="${idx}"${hiddenAttr}>
          ${contentHtml}
          <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
          ${buttonsHtml}
        </div>`;
    })
    .join('');

  const titles = steps.map((s) => s.title);
  const dataLpStepTitlesAttr = `data-lp-step-titles="${escapeHtml(JSON.stringify(titles))}"`;

  return `
    <div class="lp-core-campaign-landing__form" id="lead-form">
      <div class="lp-core-campaign-landing__form-card">
        ${hasMultiStep ? renderStepIndicatorHtml(stepIndex, stepCount) : ''}
        ${displayTitle ? `<h2 class="lp-core-campaign-landing__form-title" data-lp-form-step-title>${escapeHtml(displayTitle)}</h2>` : ''}
        ${formSubtitle ? `<p class="lp-core-campaign-landing__form-subtitle">${escapeHtml(formSubtitle)}</p>` : ''}
        <form class="lp-lead-form lp-lead-form__form" action="#" method="post" novalidate${hasMultiStep ? ` data-lp-step-count="${stepCount}" data-lp-current-step="${stepIndex}" ${dataLpStepTitlesAttr}` : ''}>
          ${stepPanelsHtml}
        </form>
      </div>
    </div>`;
}

/** Renders the core_campaign_form_landing block as an HTML section string. */
export function buildCoreCampaignFormLandingHtml(
  props: Record<string, unknown>,
  deps: CoreCampaignHtmlDeps,
): string {
  const coreLayout = resolveCoreCampaignLayout(props);
  const visualType = propString(props, 'visualType') ?? 'campaign_image';

  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const footerCopyright = propString(props, 'footerCopyright');
  const primaryCtaLabel = propString(props, 'primaryCtaLabel', 'buttonText');
  const primaryCtaHref = deps.sanitizeHref(
    propString(props, 'primaryCtaHref', 'buttonTarget'),
  );

  const imageSrc = deps.resolveImageSrc(props);
  const imageAlt = propString(props, 'alt') ?? title ?? 'Campagne';
  const imageStyle = buildCoreCampaignImageInlineStyle(props);
  const overlayStrength = propString(props, 'overlayStrength');
  const scrimStyle = mediaScrimStyleAttr(overlayStrength);

  const formProps = parseFormProps(props);

  const brandLogoText = propString(props, 'brandLogoText');
  const brandId = propString(props, 'brandId') || 'ford';
  const modelName = propString(props, 'modelName');
  const offerBadge = propString(props, 'offerBadge');
  const offerPrice = propString(props, 'offerPrice') || propString(props, 'offerLine');
  const monthlyPayment = propString(props, 'monthlyPayment');
  const financingOffer = propString(props, 'financingOffer');
  const brochureUrl = propString(props, 'brochureUrl');

  let pricingHtml = '';
  if (offerPrice || monthlyPayment || financingOffer) {
    pricingHtml = `
      <div class="lp-core-campaign-landing__pricing-grid">
        ${offerPrice ? `
          <div class="lp-core-campaign-landing__price-item lp-core-campaign-landing__price-item--main">
            <span class="lp-core-campaign-landing__price-label">Prix</span>
            <span class="lp-core-campaign-landing__price-val">${escapeHtml(offerPrice)}</span>
          </div>` : ''}
        ${monthlyPayment ? `
          <div class="lp-core-campaign-landing__price-item lp-core-campaign-landing__price-item--monthly">
            <span class="lp-core-campaign-landing__price-label">Mensualité</span>
            <span class="lp-core-campaign-landing__price-val">${escapeHtml(monthlyPayment)}</span>
          </div>` : ''}
        ${financingOffer ? `
          <div class="lp-core-campaign-landing__price-item lp-core-campaign-landing__price-item--financing">
            <span class="lp-core-campaign-landing__price-label">Crédit</span>
            <span class="lp-core-campaign-landing__price-val">${escapeHtml(financingOffer)}</span>
          </div>` : ''}
      </div>`;
  }

  let actionsHtml = '';
  if (brochureUrl || primaryCtaLabel) {
    actionsHtml = `
      <div class="lp-core-campaign-landing__actions">
        ${brochureUrl ? `
          <a class="lp-btn lp-btn--secondary lp-core-campaign-landing__brochure-btn" href="${escapeHtml(brochureUrl)}" target="_blank" rel="noopener noreferrer">Télécharger la brochure</a>` : ''}
        ${primaryCtaLabel ? `
          <a class="lp-btn lp-btn--secondary lp-core-campaign-landing__cta" href="${escapeHtml(primaryCtaHref)}">${escapeHtml(primaryCtaLabel)}</a>` : ''}
      </div>`;
  }

  const showMarketingCopy = title || subtitle || offerBadge || offerPrice || monthlyPayment || financingOffer;
  
  const marketingCopyContent = showMarketingCopy
    ? `
    <div class="lp-core-campaign-landing__content">
      ${offerBadge ? `<span class="lp-core-campaign-landing__badge">${escapeHtml(offerBadge)}</span>` : ''}
      ${title ? `<h1 class="lp-core-campaign-landing__title">${escapeHtml(title)}</h1>` : ''}
      ${subtitle ? `<p class="lp-core-campaign-landing__subtitle">${escapeHtml(subtitle)}</p>` : ''}
      ${pricingHtml}
    </div>`
    : '';

  const mediaContent = imageSrc
    ? `
    <div class="lp-core-campaign-landing__media lp-core-campaign-landing__media--hero">
      <div class="lp-core-campaign-landing__media-inner">
        <img class="lp-core-campaign-landing__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" style="${escapeHtml(imageStyle)}" loading="eager" decoding="async" />
      </div>
    </div>`
    : `
    <div class="lp-core-campaign-landing__media lp-core-campaign-landing__media--hero">
      <div class="lp-core-campaign-landing__media-inner lp-core-campaign-landing__media-placeholder" role="img" aria-label="Ajouter un visuel">
        <span class="lp-core-campaign-landing__media-placeholder-icon" aria-hidden="true">◫</span>
        <span class="lp-core-campaign-landing__media-placeholder-label">Aucun visuel disponible</span>
      </div>
    </div>`;

  const marketingHtml = `
    <div class="lp-core-campaign-landing__premium-marketing">
      ${marketingCopyContent}
      ${mediaContent}
    </div>`;

  const formHtml = renderPremiumFormHtml(formProps, props, deps);

  const footerHtml = footerCopyright
    ? `<footer class="lp-core-campaign-landing__footer lp-core-campaign-landing__footer--premium"><p>${escapeHtml(footerCopyright)}</p></footer>`
    : '';

  const sectionClass = deps.appendSectionStyleToClass(
    [
      'lp-block lp-core-campaign-landing',
      'lp-core-campaign-landing--premium',
      `lp-core-campaign-landing--${coreLayout}`,
      `lp-core-campaign-landing--visual-${visualType}`,
      overlayClass(overlayStrength),
      imageSrc && coreLayout === 'background_image_form_card'
        ? 'lp-core-campaign-landing--has-bg'
        : '',
      ...coreLayoutPresentationClasses(props),
    ]
      .filter(Boolean)
      .join(' '),
    props,
  );

  const baseInlineStyle =
    imageSrc && coreLayout === 'background_image_form_card'
      ? `--lp-core-bg-image:url('${escapeHtml(imageSrc)}')`
      : '';
  const sectionInlineStyle = deps.appendSectionStyleToInlineStyle(baseInlineStyle, props);
  const styleAttr = sectionInlineStyle ? ` style="${sectionInlineStyle}"` : '';

  const preset = propString(props, 'layoutPreset') || 'campaign_split';
  const innerClass =
    preset === 'lead_banner'
      ? 'lp-core-campaign-landing__premium-full-banner'
      : preset === 'fullscreen_overlay'
        ? 'lp-core-campaign-landing__premium-fullscreen'
        : preset === 'vehicle_showcase'
          ? 'lp-core-campaign-landing__premium-vehicle'
          : 'lp-core-campaign-landing__premium-split';

  return `
    <section class="${sectionClass}"${styleAttr}>
      <div class="lp-section lp-core-campaign-landing__inner ${innerClass}">
        ${marketingHtml}
        <div class="lp-core-campaign-landing__form-column">${formHtml}</div>
        ${footerHtml}
      </div>
    </section>`;
}
