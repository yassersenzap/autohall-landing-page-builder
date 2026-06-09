import type { LandingRenderContext } from './render-asset.types';

import { resolveHeroImageSrc } from './render-asset.resolve';

import {

  buildButtonClasses,

  buildMediaImgClasses,

  normalizeBlockDesign,

} from './block-style';

import {

  renderLeadFormConsentHtml,

  renderLeadFormFieldsHtml,

  renderLeadFormRequiredNoteHtml,

} from './lead-form-fields.render';

import {

  buildPremiumCtaClass,

  buildPremiumSectionClasses,

  normalizePremiumDesign,

  parseTrustItems,

  resolveHeroFormImagePosition,

  resolveHeroFormLayoutVariant,

} from './premium-block-design';



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



function parseFormProps(

  props: Record<string, unknown>,

): Record<string, unknown> {

  const form = props.form;

  if (form && typeof form === 'object' && !Array.isArray(form)) {

    return form as Record<string, unknown>;

  }

  return props;

}



export function renderHeroFormCampaignHtml(

  props: Record<string, unknown>,

  context?: LandingRenderContext,

): string {

  const premiumDesign = normalizePremiumDesign(props);

  const layoutVariant = resolveHeroFormLayoutVariant(premiumDesign);

  const imagePosition = resolveHeroFormImagePosition(premiumDesign);



  const title = propString(props, 'title');

  const subtitle = propString(props, 'subtitle');

  const eyebrow = propString(props, 'eyebrow');

  const promoBadge = propString(props, 'promoBadge');

  const buttonText = propString(props, 'buttonText');

  const buttonTarget = propString(props, 'buttonTarget') ?? '#lead-form';

  const legalNote = propString(props, 'legalNote');

  const imageSrc = resolveHeroImageSrc(props, context);

  const imageAlt = propString(props, 'alt') ?? '';

  const trustItems = parseTrustItems(props);



  const formProps = parseFormProps(props);

  const formDesign = normalizeBlockDesign('lead_form', formProps);

  const btnClass = `${buildButtonClasses(formDesign)} lp-lead-form__submit`;

  const formTitle = propString(formProps, 'title');

  const formSubtitle = propString(formProps, 'subtitle');

  const submitText =

    propString(formProps, 'submitText') ?? 'Envoyer votre demande';

  const privacyNote = propString(formProps, 'privacyNote', 'legalNote');



  const fieldsHtml = renderLeadFormFieldsHtml(formProps);

  const consentHtml = renderLeadFormConsentHtml(formProps);

  const requiredNoteHtml = renderLeadFormRequiredNoteHtml(formProps);



  const primaryBtnClass = buildPremiumCtaClass(premiumDesign, 'lp-btn lp-btn--md');

  const imgClass = buildMediaImgClasses(

    'lp-hero',

    normalizeBlockDesign('hero', props),

  );



  const actions: string[] = [];

  if (buttonText) {

    actions.push(

      `<a class="${primaryBtnClass}" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a>`,

    );

  }



  const trustHtml =

    trustItems.length > 0

      ? `<ul class="lp-hero-form-campaign__trust">${trustItems

          .map((item) => `<li>${escapeHtml(item)}</li>`)

          .join('')}</ul>`

      : '';



  const mediaHtml =

    imagePosition !== 'none' && imageSrc

      ? `<div class="lp-hero-form-campaign__media"><img class="${imgClass}" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="eager" decoding="async" /></div>`

      : imagePosition !== 'none'

        ? `<div class="lp-hero-form-campaign__media lp-hero-form-campaign__media--placeholder" aria-hidden="true"></div>`

        : '';



  const contentHtml = `

    <div class="lp-hero-form-campaign__content">

      ${eyebrow ? `<p class="lp-hero-form-campaign__eyebrow">${escapeHtml(eyebrow)}</p>` : ''}

      ${promoBadge ? `<span class="lp-hero-form-campaign__badge">${escapeHtml(promoBadge)}</span>` : ''}

      ${title ? `<h1 class="lp-hero-form-campaign__title">${escapeHtml(title)}</h1>` : ''}

      ${subtitle ? `<p class="lp-hero-form-campaign__subtitle">${escapeHtml(subtitle)}</p>` : ''}

      ${trustHtml}

      ${actions.length ? `<div class="lp-hero-form-campaign__actions">${actions.join('')}</div>` : ''}

      ${legalNote ? `<p class="lp-hero-form-campaign__legal">${escapeHtml(legalNote)}</p>` : ''}

    </div>`;



  const formHtml = `

    <div class="lp-hero-form-campaign__form" id="lead-form">

      <div class="lp-hero-form-campaign__form-card">

        ${formTitle ? `<h2 class="lp-hero-form-campaign__form-title">${escapeHtml(formTitle)}</h2>` : ''}

        ${formSubtitle ? `<p class="lp-hero-form-campaign__form-subtitle">${escapeHtml(formSubtitle)}</p>` : ''}

        <form class="lp-lead-form lp-lead-form__form" action="#" method="post" novalidate>

          ${requiredNoteHtml}

          <div class="lp-lead-form__grid">${fieldsHtml}</div>

          ${consentHtml}

          <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>

          <button type="submit" class="${btnClass}">${escapeHtml(submitText)}</button>

          ${privacyNote ? `<p class="lp-lead-form__privacy">${escapeHtml(privacyNote)}</p>` : ''}

        </form>

      </div>

    </div>`;



  const formFirst = layoutVariant === 'form_left_text_right';

  const inner =

    layoutVariant === 'image_left_form_right'

      ? `${mediaHtml}${contentHtml}${formHtml}`

      : formFirst

        ? `${formHtml}${contentHtml}${mediaHtml}`

        : `${contentHtml}${mediaHtml}${formHtml}`;



  const sectionClass = [

    buildPremiumSectionClasses('lp-hero-form-campaign', premiumDesign),

    `lp-hero-form-campaign--${layoutVariant}`,

  ].join(' ');



  return `

    <section class="${sectionClass}">

      <div class="lp-section lp-hero-form-campaign__inner">

        ${inner}

      </div>

    </section>`;

}


