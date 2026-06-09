import { Prisma } from '@prisma/client';
import {
  buildBlockSectionClasses,
  buildButtonClasses,
  buildInlineStyleVars,
  buildMediaImgClasses,
  normalizeBlockDesign,
} from './block-style';
import { resolveHeroImageSrc } from './render-asset.resolve';
import type { LandingRenderContext } from './render-asset.types';
import {
  renderLeadFormConsentHtml,
  renderLeadFormFieldsHtml,
  renderLeadFormRequiredNoteHtml,
} from './lead-form-fields.render';
import { renderHeroFormCampaignHtml } from './hero-form-campaign.render';

export type RenderBlockInput = {
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type RenderPageShell = {
  title: string;
  campaignName: string;
  brand: string;
};

function propsAsRecord(propsJson: Prisma.JsonValue): Record<string, unknown> {
  if (propsJson && typeof propsJson === 'object' && !Array.isArray(propsJson)) {
    return propsJson;
  }
  return {};
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

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type LeadFormField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

type ListItem = { title: string; description: string };
type QuoteItem = { text: string; author: string; role: string };
type FaqItem = { question: string; answer: string };
type LinkItem = { label: string; href: string };
type MetricItem = { value: string; label: string };

function renderBtn(
  href: string,
  label: string,
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'lg' | 'md' = 'lg',
): string {
  return `<a class="lp-btn lp-btn--${variant} lp-btn--${size}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

function parseObjectList(
  props: Record<string, unknown>,
  key: string,
): Record<string, unknown>[] {
  if (!Array.isArray(props[key])) {
    return [];
  }
  return props[key].filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  );
}

function parseListItems(
  props: Record<string, unknown>,
  ...keys: string[]
): ListItem[] {
  for (const key of keys) {
    const items = parseObjectList(props, key)
      .map((item) => ({
        title: propString(item, 'title') ?? '',
        description: propString(item, 'description', 'text') ?? '',
      }))
      .filter((item) => item.title || item.description);
    if (items.length > 0) {
      return items;
    }
  }
  return [];
}

function parseQuotes(props: Record<string, unknown>): QuoteItem[] {
  return parseObjectList(props, 'quotes')
    .map((item) => ({
      text: propString(item, 'text', 'quote') ?? '',
      author: propString(item, 'author', 'name') ?? '',
      role: propString(item, 'role', 'subtitle') ?? '',
    }))
    .filter((item) => item.text);
}

function parseFaqItems(props: Record<string, unknown>): FaqItem[] {
  return parseObjectList(props, 'items')
    .map((item) => ({
      question: propString(item, 'question') ?? '',
      answer: propString(item, 'answer') ?? '',
    }))
    .filter((item) => item.question && item.answer);
}

function parseLinks(props: Record<string, unknown>): LinkItem[] {
  return parseObjectList(props, 'links')
    .map((item) => ({
      label: propString(item, 'label') ?? '',
      href: propString(item, 'href', 'url') ?? '#',
    }))
    .filter((item) => item.label);
}

function parseMetrics(props: Record<string, unknown>): MetricItem[] {
  return parseObjectList(props, 'metrics')
    .map((item) => ({
      value: propString(item, 'value') ?? '',
      label: propString(item, 'label') ?? '',
    }))
    .filter((item) => item.value && item.label);
}

function parseStringList(
  props: Record<string, unknown>,
  key: string,
): string[] {
  if (!Array.isArray(props[key])) {
    return [];
  }
  return props[key]
    .filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    )
    .map((value) => value.trim());
}

function parseLeadFormFields(props: Record<string, unknown>): LeadFormField[] {
  if (!Array.isArray(props.fields)) {
    return [];
  }

  return props.fields
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )
    .map((field) => ({
      name: typeof field.name === 'string' ? field.name : 'field',
      label: typeof field.label === 'string' ? field.label : 'Champ',
      type: typeof field.type === 'string' ? field.type : 'text',
      required: Boolean(field.required),
    }));
}

function renderTextParagraphs(content: string): string {
  const parts = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return '<p class="lp-text__p">—</p>';
  }
  return parts
    .map((part) => `<p class="lp-text__p">${escapeHtml(part)}</p>`)
    .join('');
}

function renderSectionHeading(
  heading: string | null,
  subtitle: string | null,
): string {
  return `
    ${heading ? `<h2 class="lp-section-title">${escapeHtml(heading)}</h2>` : ''}
    ${subtitle ? `<p class="lp-section-subtitle">${escapeHtml(subtitle)}</p>` : ''}`;
}

function renderLeadFormHtml(props: Record<string, unknown>): string {
  const design = normalizeBlockDesign('lead_form', props);
  const sectionClass = buildBlockSectionClasses(
    'lead_form',
    'lp-lead-form',
    design,
  );
  const inlineVars = buildInlineStyleVars(design);
  const btnClass = `${buildButtonClasses(design)} lp-lead-form__submit`;

  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const submitText = propString(props, 'submitText') ?? 'Envoyer votre demande';
  const privacyNote = propString(props, 'privacyNote', 'legalNote');
  const reassurance = parseStringList(props, 'reassurance');

  const fieldsHtml = renderLeadFormFieldsHtml(props);
  const consentHtml = renderLeadFormConsentHtml(props);
  const requiredNoteHtml = renderLeadFormRequiredNoteHtml(props);

  const reassuranceHtml = reassurance.length
    ? `<ul class="lp-lead-form__reassurance">${reassurance
        .map(
          (item) =>
            `<li class="lp-lead-form__reassurance-item"><span class="lp-lead-form__check" aria-hidden="true"></span>${escapeHtml(item)}</li>`,
        )
        .join('')}</ul>`
    : '';

  return `
    <section class="${sectionClass}" id="lead-form"${inlineVars}>
      <div class="lp-section">
        <div class="lp-lead-form__layout">
          <aside class="lp-lead-form__aside">
            ${title ? `<h2 class="lp-lead-form__title">${escapeHtml(title)}</h2>` : ''}
            ${subtitle ? `<p class="lp-lead-form__subtitle">${escapeHtml(subtitle)}</p>` : ''}
            ${reassuranceHtml}
          </aside>
          <div class="lp-lead-form__card">
            <form class="lp-lead-form__form" action="#" method="post" novalidate>
              ${requiredNoteHtml}
              <div class="lp-lead-form__grid">${fieldsHtml}</div>
              ${consentHtml}
              <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
              <button type="submit" class="${btnClass}">${escapeHtml(submitText)}</button>
              ${privacyNote ? `<p class="lp-lead-form__privacy">${escapeHtml(privacyNote)}</p>` : ''}
            </form>
          </div>
        </div>
      </div>
    </section>`;
}

function renderHeroHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const design = normalizeBlockDesign('hero', props);
  const sectionClass = buildBlockSectionClasses('hero', 'lp-hero', design);
  const inlineVars = buildInlineStyleVars(design);
  const imgClass = buildMediaImgClasses('lp-hero', design);
  const primaryBtnClass = buildButtonClasses(design);

  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const eyebrow = propString(props, 'eyebrow', 'kicker', 'badge');
  const buttonText = propString(props, 'buttonText');
  const buttonTarget =
    propString(props, 'buttonTarget', 'href') ?? '#lead-form';
  const secondaryText = propString(
    props,
    'secondaryButtonText',
    'secondaryCtaText',
  );
  const secondaryTarget =
    propString(props, 'secondaryButtonTarget', 'secondaryCtaTarget') ??
    '#offer';
  const imageSrc = resolveHeroImageSrc(props, context);
  const imageAlt = propString(props, 'alt', 'imageAlt') ?? '';

  const actions: string[] = [];
  if (buttonText) {
    actions.push(
      `<a class="${primaryBtnClass}" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a>`,
    );
  }
  if (secondaryText) {
    actions.push(
      renderBtn(secondaryTarget, secondaryText, 'secondary', design.buttonSize),
    );
  }

  const isBgLayout = design.layoutVariant === 'background_image';
  const hideMedia =
    design.layoutVariant === 'minimal' || design.mediaPosition === 'none';

  const bgMediaHtml =
    isBgLayout && imageSrc
      ? `<div class="lp-hero__bg" aria-hidden="true"><img class="${imgClass}" src="${escapeHtml(imageSrc)}" alt="" loading="eager" decoding="async" /></div>`
      : '';

  const overlayHtml =
    isBgLayout && design.overlayOpacity !== 'none'
      ? `<div class="lp-hero__overlay" aria-hidden="true"></div>`
      : '';

  const mediaHtml =
    !hideMedia && !isBgLayout
      ? imageSrc
        ? `<div class="lp-hero__media"><img class="${imgClass}" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="eager" decoding="async" /></div>`
        : `<div class="lp-hero__media lp-hero__media--placeholder" aria-hidden="true"></div>`
      : '';

  const campaignType = propString(props, 'campaignType');
  const promoBadge = propString(props, 'promoBadge');
  const campaignClass =
    campaignType &&
    ['promo', 'sav', 'gamme', 'lead_capture'].includes(campaignType)
      ? ` lp-hero--campaign-${campaignType}`
      : '';

  const contentHtml = `
        <div class="lp-hero__content">
          ${eyebrow ? `<p class="lp-hero__eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
          ${promoBadge ? `<span class="lp-hero__badge">${escapeHtml(promoBadge)}</span>` : ''}
          ${title ? `<h1 class="lp-hero__title">${escapeHtml(title)}</h1>` : ''}
          ${subtitle ? `<p class="lp-hero__subtitle">${escapeHtml(subtitle)}</p>` : ''}
          ${actions.length ? `<div class="lp-hero__actions">${actions.join('')}</div>` : ''}
        </div>`;

  const innerOrder =
    design.mediaPosition === 'left' && !isBgLayout
      ? `${mediaHtml}${contentHtml}`
      : `${contentHtml}${mediaHtml}`;

  return `
    <section class="${sectionClass}${campaignClass}"${inlineVars}>
      ${bgMediaHtml}
      ${overlayHtml}
      <div class="lp-hero__glow" aria-hidden="true"></div>
      <div class="lp-hero__inner lp-section">
        ${innerOrder}
      </div>
    </section>`;
}

function renderTrustBarHtml(props: Record<string, unknown>): string {
  const metrics = parseMetrics(props);
  if (metrics.length === 0) {
    return '';
  }

  const items = metrics
    .map(
      (metric) => `
      <div class="lp-trust-bar__item">
        <p class="lp-trust-bar__value">${escapeHtml(metric.value)}</p>
        <p class="lp-trust-bar__label">${escapeHtml(metric.label)}</p>
      </div>`,
    )
    .join('');

  return `
    <section class="lp-block lp-trust-bar" aria-label="Réassurance">
      <div class="lp-section">
        <div class="lp-trust-bar__grid">${items}</div>
      </div>
    </section>`;
}

function renderBenefitsHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseListItems(props, 'items');

  const cards = items
    .map(
      (item) => `
      <article class="lp-card lp-benefits__card">
        <h3 class="lp-card__title">${escapeHtml(item.title)}</h3>
        <p class="lp-card__text">${escapeHtml(item.description)}</p>
      </article>`,
    )
    .join('');

  return `
    <section class="lp-block lp-benefits">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-benefits__grid">${cards}</div>
      </div>
    </section>`;
}

function renderOfferHighlightsHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const modelName = propString(props, 'modelName', 'model');
  const tagline = propString(props, 'tagline', 'modelTagline');
  const priceLabel = propString(props, 'priceLabel') ?? 'À partir de';
  const priceValue = propString(props, 'priceValue', 'price');
  const monthlyValue = propString(props, 'monthlyValue', 'monthlyFrom');
  const buttonText = propString(props, 'buttonText', 'ctaLabel');
  const buttonTarget =
    propString(props, 'buttonTarget', 'ctaTarget') ?? '#lead-form';
  const imageSrc = resolveHeroImageSrc(props, context);
  const imageAlt = propString(props, 'alt') ?? '';
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseListItems(props, 'highlights', 'items');

  if (modelName || imageSrc || priceValue || monthlyValue) {
    const highlightsHtml = items
      .map(
        (item) =>
          `<li class="lp-vehicle-offer__highlight"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description)}</span></li>`,
      )
      .join('');

    const priceHtml = priceValue
      ? `<p class="lp-vehicle-offer__price"><span class="lp-vehicle-offer__price-label">${escapeHtml(priceLabel)}</span> <strong>${escapeHtml(priceValue)}</strong></p>`
      : '';
    const monthlyHtml = monthlyValue
      ? `<p class="lp-vehicle-offer__monthly">${escapeHtml(monthlyValue)}</p>`
      : '';

    const mediaHtml = imageSrc
      ? `<div class="lp-vehicle-offer__media"><img class="lp-vehicle-offer__img" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" /></div>`
      : `<div class="lp-vehicle-offer__media lp-vehicle-offer__media--placeholder" aria-hidden="true"></div>`;

    return `
    <section class="lp-block lp-vehicle-offer" id="offer">
      <div class="lp-section">
        ${heading || subtitle ? `<div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>` : ''}
        <div class="lp-vehicle-offer__panel">
          ${mediaHtml}
          <div class="lp-vehicle-offer__body">
            ${modelName ? `<p class="lp-vehicle-offer__model">${escapeHtml(modelName)}</p>` : ''}
            ${tagline ? `<p class="lp-vehicle-offer__tagline">${escapeHtml(tagline)}</p>` : ''}
            ${priceHtml}
            ${monthlyHtml}
            ${highlightsHtml ? `<ul class="lp-vehicle-offer__highlights">${highlightsHtml}</ul>` : ''}
            ${buttonText ? `<div class="lp-vehicle-offer__cta">${renderBtn(buttonTarget, buttonText, 'primary', 'lg')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>`;
  }

  const cards = items
    .map(
      (item, index) => `
      <article class="lp-offer-card">
        <span class="lp-offer-card__index">${String(index + 1).padStart(2, '0')}</span>
        <h3 class="lp-offer-card__title">${escapeHtml(item.title)}</h3>
        <p class="lp-offer-card__text">${escapeHtml(item.description)}</p>
      </article>`,
    )
    .join('');

  return `
    <section class="lp-block lp-offer-highlights" id="offer">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-offer-highlights__grid">${cards}</div>
      </div>
    </section>`;
}

type VehicleRangeItem = {
  name: string;
  energy: string;
  tag: string;
  imageSrc: string | null;
  imageAlt: string;
  ctaText: string;
  ctaTarget: string;
};

function parseVehicleRangeItems(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): VehicleRangeItem[] {
  return parseObjectList(props, 'vehicles')
    .map((item) => {
      const imageAssetId = propString(item, 'imageAssetId');
      const imageUrl = propString(item, 'imageUrl');
      const merged = { ...item, imageAssetId, imageUrl };
      return {
        name: propString(item, 'name', 'modelName') ?? '',
        energy: propString(item, 'energy', 'type') ?? '',
        tag: propString(item, 'tag', 'badge') ?? '',
        imageSrc: resolveHeroImageSrc(merged, context),
        imageAlt: propString(item, 'alt') ?? '',
        ctaText: propString(item, 'ctaText', 'buttonText') ?? 'Découvrir',
        ctaTarget:
          propString(item, 'ctaTarget', 'buttonTarget') ?? '#lead-form',
      };
    })
    .filter((item) => item.name);
}

function renderVehicleRangeHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const vehicles = parseVehicleRangeItems(props, context);

  const cards = vehicles
    .map((vehicle) => {
      const mediaHtml = vehicle.imageSrc
        ? `<img class="lp-vehicle-card__img" src="${escapeHtml(vehicle.imageSrc)}" alt="${escapeHtml(vehicle.imageAlt)}" loading="lazy" decoding="async" />`
        : `<div class="lp-vehicle-card__placeholder" aria-hidden="true"></div>`;
      const tagHtml = vehicle.tag
        ? `<span class="lp-vehicle-card__tag">${escapeHtml(vehicle.tag)}</span>`
        : '';
      const energyHtml = vehicle.energy
        ? `<span class="lp-vehicle-card__energy">${escapeHtml(vehicle.energy)}</span>`
        : '';
      return `
      <article class="lp-vehicle-card">
        <div class="lp-vehicle-card__media">${mediaHtml}</div>
        <div class="lp-vehicle-card__body">
          ${tagHtml}
          <h3 class="lp-vehicle-card__name">${escapeHtml(vehicle.name)}</h3>
          ${energyHtml}
          <a class="lp-btn lp-btn--secondary lp-btn--md lp-vehicle-card__cta" href="${escapeHtml(vehicle.ctaTarget)}">${escapeHtml(vehicle.ctaText)}</a>
        </div>
      </article>`;
    })
    .join('');

  return `
    <section class="lp-block lp-vehicle-range">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-vehicle-range__grid">${cards}</div>
      </div>
    </section>`;
}

function renderFeaturesShowcaseHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const design = normalizeBlockDesign('features', props);
  const sectionClass = buildBlockSectionClasses(
    'features',
    'lp-features lp-features--showcase',
    design,
  );
  const inlineVars = buildInlineStyleVars(design);
  const imgClass = buildMediaImgClasses('lp-showcase', design);

  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const modelName = propString(props, 'modelName', 'model');
  const modelTagline = propString(props, 'modelTagline', 'tagline');
  const imageSrc = resolveHeroImageSrc(props, context);
  const imageAlt = propString(props, 'alt', 'imageAlt') ?? '';
  const items = parseListItems(props, 'items');

  const specs = items
    .map(
      (item) => `
      <li class="lp-showcase__spec">
        <strong class="lp-showcase__spec-title">${escapeHtml(item.title)}</strong>
        <span class="lp-showcase__spec-text">${escapeHtml(item.description)}</span>
      </li>`,
    )
    .join('');

  const mediaHtml = imageSrc
    ? `<div class="lp-showcase__media"><img class="${imgClass}" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" /></div>`
    : `<div class="lp-showcase__media lp-showcase__media--placeholder" aria-hidden="true"></div>`;

  const copyHtml = `
          <div class="lp-showcase__copy">
            ${modelName ? `<p class="lp-showcase__model">${escapeHtml(modelName)}</p>` : ''}
            ${modelTagline ? `<p class="lp-showcase__tagline">${escapeHtml(modelTagline)}</p>` : ''}
            ${specs ? `<ul class="lp-showcase__specs">${specs}</ul>` : ''}
          </div>`;

  const showcaseInner =
    design.mediaPosition === 'left'
      ? `${mediaHtml}${copyHtml}`
      : `${copyHtml}${mediaHtml}`;

  return `
    <section class="${sectionClass}" id="model"${inlineVars}>
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-showcase lp-showcase--media-${design.mediaPosition}">
          ${showcaseInner}
        </div>
      </div>
    </section>`;
}

function renderFeaturesHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const design = normalizeBlockDesign('features', props);
  if (design.layoutVariant === 'showcase') {
    return renderFeaturesShowcaseHtml(props, context);
  }

  const sectionClass = buildBlockSectionClasses(
    'features',
    'lp-features',
    design,
  );
  const inlineVars = buildInlineStyleVars(design);
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseListItems(props, 'items');

  const gridClass =
    design.layoutVariant === 'compact_row'
      ? 'lp-features__row'
      : design.layoutVariant === 'icon_list'
        ? 'lp-features__icon-grid'
        : 'lp-features__grid';

  const cards = items
    .map(
      (item, index) => `
      <article class="lp-feature-card">
        <span class="lp-feature-card__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <h3 class="lp-feature-card__title">${escapeHtml(item.title)}</h3>
        <p class="lp-feature-card__text">${escapeHtml(item.description)}</p>
      </article>`,
    )
    .join('');

  return `
    <section class="${sectionClass}"${inlineVars}>
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="${gridClass}">${cards}</div>
      </div>
    </section>`;
}

function renderFinancingHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const ctaLabel =
    propString(props, 'ctaLabel', 'buttonText') ?? 'Simuler mon financement';
  const ctaTarget =
    propString(props, 'ctaTarget', 'buttonTarget') ?? '#lead-form';
  const paymentExample = propString(props, 'paymentExample', 'monthlyFrom');
  const bullets = parseStringList(props, 'bullets');

  const listHtml = bullets
    .map(
      (bullet) => `<li class="lp-financing__bullet">${escapeHtml(bullet)}</li>`,
    )
    .join('');

  const paymentHtml = paymentExample
    ? `<p class="lp-financing__payment"><span class="lp-financing__payment-label">À partir de</span> <strong>${escapeHtml(paymentExample)}</strong></p>`
    : '';

  return `
    <section class="lp-block lp-financing">
      <div class="lp-section">
        <div class="lp-financing__panel">
          <div class="lp-financing__copy">
            ${renderSectionHeading(heading, subtitle)}
            ${paymentHtml}
            ${listHtml ? `<ul class="lp-financing__list">${listHtml}</ul>` : ''}
          </div>
          <div class="lp-financing__cta">
            ${renderBtn(ctaTarget, ctaLabel, 'primary', 'lg')}
          </div>
        </div>
      </div>
    </section>`;
}

function renderAfterSalesHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle', 'description');
  const items = parseListItems(props, 'items');

  const listHtml = items
    .map(
      (item) => `
      <li class="lp-after-sales__item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </li>`,
    )
    .join('');

  return `
    <section class="lp-block lp-after-sales">
      <div class="lp-section lp-section--narrow">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        ${listHtml ? `<ul class="lp-after-sales__list">${listHtml}</ul>` : ''}
      </div>
    </section>`;
}

function renderTestimonialsHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const quotes = parseQuotes(props);

  const cards = quotes
    .map(
      (quote) => `
      <blockquote class="lp-testimonial-card">
        <p class="lp-testimonial-card__text">“${escapeHtml(quote.text)}”</p>
        <footer class="lp-testimonial-card__author">
          <strong>${escapeHtml(quote.author)}</strong>
          ${quote.role ? `<span>${escapeHtml(quote.role)}</span>` : ''}
        </footer>
      </blockquote>`,
    )
    .join('');

  return `
    <section class="lp-block lp-testimonials">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-testimonials__grid">${cards}</div>
      </div>
    </section>`;
}

function renderFaqHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseFaqItems(props);

  const rows = items
    .map(
      (item) => `
      <details class="lp-faq__item">
        <summary class="lp-faq__question">${escapeHtml(item.question)}</summary>
        <p class="lp-faq__answer">${escapeHtml(item.answer)}</p>
      </details>`,
    )
    .join('');

  return `
    <section class="lp-block lp-faq">
      <div class="lp-section lp-section--narrow">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-faq__list">${rows}</div>
      </div>
    </section>`;
}

function renderFinalCtaHtml(props: Record<string, unknown>): string {
  const design = normalizeBlockDesign('final_cta', props);
  const sectionClass = buildBlockSectionClasses(
    'final_cta',
    'lp-final-cta',
    design,
  );
  const inlineVars = buildInlineStyleVars(design);
  const btnClass = buildButtonClasses(design);

  const title = propString(props, 'title', 'heading');
  const subtitle = propString(props, 'subtitle', 'description');
  const buttonText = propString(props, 'buttonText', 'label');
  const buttonTarget =
    propString(props, 'buttonTarget', 'target') ?? '#lead-form';

  const buttonHtml = buttonText
    ? `<a class="${btnClass}" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a>`
    : '';

  return `
    <section class="${sectionClass}"${inlineVars}>
      <div class="lp-section">
        <div class="lp-final-cta__panel">
          ${title ? `<h2 class="lp-final-cta__title">${escapeHtml(title)}</h2>` : ''}
          ${subtitle ? `<p class="lp-final-cta__subtitle">${escapeHtml(subtitle)}</p>` : ''}
          ${buttonHtml}
        </div>
      </div>
    </section>`;
}

function renderFooterLegalHtml(props: Record<string, unknown>): string {
  const design = normalizeBlockDesign('footer_legal', props);
  const sectionClass = buildBlockSectionClasses(
    'footer_legal',
    'lp-footer-legal',
    design,
  );
  const inlineVars = buildInlineStyleVars(design);

  const legalText = propString(props, 'legalText', 'text');
  const links = parseLinks(props);

  const linksHtml = links
    .map(
      (link) =>
        `<a class="lp-footer-legal__link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join('');

  return `
    <section class="${sectionClass}"${inlineVars}>
      <div class="lp-section">
        ${legalText ? `<p class="lp-footer-legal__text">${escapeHtml(legalText)}</p>` : ''}
        ${linksHtml ? `<div class="lp-footer-legal__links">${linksHtml}</div>` : ''}
      </div>
    </section>`;
}

export function renderBlockHtml(
  block: RenderBlockInput,
  context?: LandingRenderContext,
): string {
  const props = propsAsRecord(block.propsJson);
  const type = block.blockType.toLowerCase();

  if (type === 'hero' || type === 'hero_campaign') {
    return renderHeroHtml(props, context);
  }

  if (type === 'hero_form_campaign') {
    return renderHeroFormCampaignHtml(props, context);
  }

  if (type === 'trust_bar') {
    return renderTrustBarHtml(props);
  }

  if (type === 'text') {
    const design = normalizeBlockDesign('text', props);
    const sectionClass = buildBlockSectionClasses('text', 'lp-text', design);
    const inlineVars = buildInlineStyleVars(design);
    const content = propString(props, 'content', 'text', 'body') ?? '';
    const heading = propString(props, 'heading', 'title');
    const widthClass =
      design.contentWidth === 'wide'
        ? 'lp-section'
        : design.contentWidth === 'narrow'
          ? 'lp-section lp-section--narrow'
          : 'lp-section lp-section--narrow';

    return `
    <section class="${sectionClass}"${inlineVars}>
      <div class="${widthClass}">
        ${heading ? `<h2 class="lp-text__heading">${escapeHtml(heading)}</h2>` : ''}
        <div class="lp-text__body">${renderTextParagraphs(content)}</div>
      </div>
    </section>`;
  }

  if (type === 'image') {
    const design = normalizeBlockDesign('image', props);
    const sectionClass = buildBlockSectionClasses('image', 'lp-media', design);
    const inlineVars = buildInlineStyleVars(design);
    const imgClass = buildMediaImgClasses('lp-media', design);
    const imageSrc = resolveHeroImageSrc(props, context);
    const alt = propString(props, 'alt') ?? '';
    const caption = propString(props, 'caption');

    if (imageSrc) {
      return `
    <section class="${sectionClass}"${inlineVars}>
      <div class="lp-section">
        <figure class="lp-media__figure">
          <img class="${imgClass}" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
          ${caption ? `<figcaption class="lp-media__caption">${escapeHtml(caption)}</figcaption>` : ''}
        </figure>
      </div>
    </section>`;
    }

    return `
    <section class="${sectionClass} lp-media--empty"${inlineVars}>
      <div class="lp-section">
        <div class="lp-media__placeholder">Sélectionnez une image</div>
      </div>
    </section>`;
  }

  if (type === 'button') {
    const label =
      propString(props, 'label', 'text', 'buttonText') ?? 'En savoir plus';
    const target = propString(props, 'target', 'href', 'buttonTarget') ?? '#';
    const description = propString(props, 'description', 'subtitle');

    return `
    <section class="lp-block lp-cta-band">
      <div class="lp-section lp-section--narrow lp-cta-band__inner">
        ${description ? `<p class="lp-cta-band__text">${escapeHtml(description)}</p>` : ''}
        <a class="lp-btn lp-btn--primary lp-btn--lg" href="${escapeHtml(target)}">${escapeHtml(label)}</a>
      </div>
    </section>`;
  }

  if (type === 'lead_form') {
    return renderLeadFormHtml(props);
  }

  if (type === 'benefits') {
    return renderBenefitsHtml(props);
  }

  if (type === 'offer_highlights' || type === 'vehicle_offer') {
    return renderOfferHighlightsHtml(props, context);
  }

  if (type === 'vehicle_range') {
    return renderVehicleRangeHtml(props, context);
  }

  if (type === 'features') {
    return renderFeaturesHtml(props, context);
  }

  if (type === 'financing') {
    return renderFinancingHtml(props);
  }

  if (type === 'after_sales') {
    return renderAfterSalesHtml(props);
  }

  if (type === 'testimonials') {
    return renderTestimonialsHtml(props);
  }

  if (type === 'faq') {
    return renderFaqHtml(props);
  }

  if (type === 'final_cta') {
    return renderFinalCtaHtml(props);
  }

  if (type === 'footer_legal') {
    return renderFooterLegalHtml(props);
  }

  return `
    <section class="lp-block lp-unknown">
      <div class="lp-section">
        <p>Type de bloc non supporté : ${escapeHtml(block.blockType)}</p>
      </div>
    </section>`;
}

export function renderPageShellHeader(shell: RenderPageShell): string {
  return `
  <header class="lp-site-header">
    <div class="lp-site-header__inner lp-section">
      <div class="lp-site-header__brand-group">
        <p class="lp-site-header__brand">${escapeHtml(shell.brand)}</p>
        <p class="lp-site-header__campaign">${escapeHtml(shell.campaignName)}</p>
      </div>
      <a class="lp-btn lp-btn--primary lp-btn--md lp-site-header__cta" href="#lead-form">Demander un essai</a>
    </div>
  </header>`;
}

export function renderPageShellFooter(): string {
  const year = new Date().getFullYear();
  return `
  <footer class="lp-site-footer">
    <div class="lp-site-footer__inner lp-section">
      <p>&copy; ${year} Auto Hall. Tous droits réservés.</p>
    </div>
  </footer>`;
}

export function renderBlocksHtml(
  blocks: RenderBlockInput[],
  context?: LandingRenderContext,
): string {
  return blocks.map((block) => renderBlockHtml(block, context)).join('\n');
}
