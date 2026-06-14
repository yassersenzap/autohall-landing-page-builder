import type { LandingRenderContext } from './render-asset.types';
import { resolveCoreCampaignLayout } from './core-campaign-form-landing.layout';
import { resolveHeroImageSrc } from './render-asset.resolve';
import { sanitizeExportHref } from './safe-export-link';
import {
  renderLeadFormConsentHtml,
  renderLeadFormFieldsHtml,
  renderLeadFormRequiredNoteHtml,
} from './lead-form-fields.render';

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

function resolveCoreLayout(props: Record<string, unknown>): string {
  return resolveCoreCampaignLayout(props);
}

function overlayClass(strength: string | null): string {
  if (strength === 'light') return 'lp-core-campaign-landing--overlay-light';
  if (strength === 'strong') return 'lp-core-campaign-landing--overlay-strong';
  return 'lp-core-campaign-landing--overlay-medium';
}

export function renderCoreCampaignFormLandingHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const coreLayout = resolveCoreLayout(props);
  const visualType = propString(props, 'visualType') ?? 'campaign_image';
  const stepCountRaw = props.stepCount;
  const stepCount =
    stepCountRaw === 3 || stepCountRaw === '3' ? 3 : 2;
  const stepIndex = Math.min(
    Math.max(typeof props.stepIndex === 'number' ? props.stepIndex : 1, 1),
    stepCount,
  );

  const brandLogoText = propString(props, 'brandLogoText', 'eyebrow');
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const offerLine = propString(props, 'offerLine', 'promoBadge');
  const legalNote = propString(props, 'legalNote');
  const footerCopyright = propString(props, 'footerCopyright');
  const primaryCtaLabel = propString(props, 'primaryCtaLabel', 'buttonText');
  const primaryCtaHref = sanitizeExportHref(
    propString(props, 'primaryCtaHref', 'buttonTarget'),
  );

  const imageSrc = resolveHeroImageSrc(props, context);
  const imageAlt = propString(props, 'alt') ?? title ?? 'Campagne Auto Hall';

  const formProps = parseFormProps(props);
  const formTitle = propString(formProps, 'formTitle', 'title') ?? propString(props, 'formTitle');
  const formSubtitle =
    propString(formProps, 'formSubtitle', 'subtitle') ?? propString(props, 'formSubtitle');
  const submitText =
    propString(formProps, 'submitText') ?? propString(props, 'submitText') ?? 'Envoyer';

  const fieldsHtml = renderLeadFormFieldsHtml(formProps);
  const consentHtml = renderLeadFormConsentHtml(formProps);
  const requiredNoteHtml = renderLeadFormRequiredNoteHtml(formProps);

  const progressPct = Math.round((stepIndex / stepCount) * 100);
  const stepHtml = `
    <div class="lp-core-campaign-landing__steps">
      <div class="lp-core-campaign-landing__step-progress" role="progressbar" aria-valuenow="${stepIndex}" aria-valuemin="1" aria-valuemax="${stepCount}" aria-label="Étape ${stepIndex} sur ${stepCount}">
        <span class="lp-core-campaign-landing__step-progress-fill" style="width:${progressPct}%"></span>
      </div>
      <p class="lp-core-campaign-landing__step-label">Étape ${stepIndex}/${stepCount}</p>
    </div>`;

  const contentHtml = `
    <div class="lp-core-campaign-landing__content">
      ${brandLogoText ? `<p class="lp-core-campaign-landing__brand">${escapeHtml(brandLogoText)}</p>` : ''}
      ${offerLine ? `<p class="lp-core-campaign-landing__offer">${escapeHtml(offerLine)}</p>` : ''}
      ${title ? `<h1 class="lp-core-campaign-landing__title">${escapeHtml(title)}</h1>` : ''}
      ${subtitle ? `<p class="lp-core-campaign-landing__subtitle">${escapeHtml(subtitle)}</p>` : ''}
      ${primaryCtaLabel ? `<a class="lp-btn lp-btn--secondary lp-btn--md lp-core-campaign-landing__cta" href="${escapeHtml(primaryCtaHref)}">${escapeHtml(primaryCtaLabel)}</a>` : ''}
      ${legalNote ? `<p class="lp-core-campaign-landing__legal">${escapeHtml(legalNote)}</p>` : ''}
    </div>`;

  const mediaHtml = imageSrc
    ? `<div class="lp-core-campaign-landing__media"><img class="lp-core-campaign-landing__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="eager" decoding="async" /></div>`
    : `<div class="lp-core-campaign-landing__media lp-core-campaign-landing__media--placeholder" aria-hidden="true"></div>`;

  const formHtml = `
    <div class="lp-core-campaign-landing__form" id="lead-form">
      <div class="lp-core-campaign-landing__form-card">
        ${stepHtml}
        ${formTitle ? `<h2 class="lp-core-campaign-landing__form-title">${escapeHtml(formTitle)}</h2>` : ''}
        ${formSubtitle ? `<p class="lp-core-campaign-landing__form-subtitle">${escapeHtml(formSubtitle)}</p>` : ''}
        <form class="lp-lead-form lp-lead-form__form" action="#" method="post" novalidate>
          ${requiredNoteHtml}
          <div class="lp-lead-form__grid">${fieldsHtml}</div>
          ${consentHtml}
          <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
          <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit">${escapeHtml(submitText)}</button>
        </form>
      </div>
    </div>`;

  const footerHtml = footerCopyright
    ? `<footer class="lp-core-campaign-landing__footer"><p>${escapeHtml(footerCopyright)}</p></footer>`
    : '';

  const inner =
    coreLayout === 'form_left_image_right'
      ? `${formHtml}${mediaHtml}${contentHtml}`
      : coreLayout === 'full_width_banner_form_side'
        ? `${mediaHtml}<div class="lp-core-campaign-landing__split">${contentHtml}${formHtml}</div>`
        : coreLayout === 'background_image_form_card'
          ? `${contentHtml}${formHtml}`
          : `${mediaHtml}${contentHtml}${formHtml}`;

  const sectionClass = [
    'lp-block lp-core-campaign-landing',
    `lp-core-campaign-landing--${coreLayout}`,
    `lp-core-campaign-landing--visual-${visualType}`,
    overlayClass(propString(props, 'overlayStrength')),
    imageSrc && coreLayout === 'background_image_form_card'
      ? 'lp-core-campaign-landing--has-bg'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const bgStyle =
    imageSrc && coreLayout === 'background_image_form_card'
      ? ` style="--lp-core-bg-image:url('${escapeHtml(imageSrc)}')"`
      : '';

  return `
    <section class="${sectionClass}"${bgStyle}>
      <div class="lp-section lp-core-campaign-landing__inner">
        ${inner}
        ${footerHtml}
      </div>
    </section>`;
}
