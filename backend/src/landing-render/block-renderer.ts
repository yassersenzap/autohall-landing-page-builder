import { Prisma } from '@prisma/client';

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
    return propsJson as Record<string, unknown>;
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

function parseStringList(props: Record<string, unknown>, key: string): string[] {
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
  const parts = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return '<p class="lp-text__p">—</p>';
  }
  return parts
    .map((part) => `<p class="lp-text__p">${escapeHtml(part)}</p>`)
    .join('');
}

function renderSectionHeading(heading: string | null, subtitle: string | null): string {
  return `
    ${heading ? `<h2 class="lp-section-title">${escapeHtml(heading)}</h2>` : ''}
    ${subtitle ? `<p class="lp-section-subtitle">${escapeHtml(subtitle)}</p>` : ''}`;
}

function renderLeadFormHtml(props: Record<string, unknown>): string {
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const submitText = propString(props, 'submitText') ?? 'Envoyer ma demande';
  const privacyNote = propString(props, 'privacyNote', 'legalNote');
  const reassurance = parseStringList(props, 'reassurance');
  const fields = parseLeadFormFields(props);

  const fieldsHtml = fields
    .map((field) => {
      const requiredAttr = field.required ? ' required' : '';
      const inputType = escapeHtml(field.type || 'text');
      const isFullWidth =
        field.name === 'fullName' || field.name === 'message' || fields.length <= 2;
      return `
        <label class="lp-lead-form__field${isFullWidth ? ' lp-lead-form__field--full' : ''}">
          <span class="lp-lead-form__label">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</span>
          <input class="lp-lead-form__input" type="${inputType}" name="${escapeHtml(field.name)}"${requiredAttr} autocomplete="on" />
        </label>`;
    })
    .join('');

  const reassuranceHtml = reassurance.length
    ? `<ul class="lp-lead-form__reassurance">${reassurance
        .map(
          (item) =>
            `<li class="lp-lead-form__reassurance-item"><span class="lp-lead-form__check" aria-hidden="true"></span>${escapeHtml(item)}</li>`,
        )
        .join('')}</ul>`
    : '';

  return `
    <section class="lp-block lp-lead-form" id="lead-form">
      <div class="lp-section">
        <div class="lp-lead-form__layout">
          <aside class="lp-lead-form__aside">
            ${title ? `<h2 class="lp-lead-form__title">${escapeHtml(title)}</h2>` : ''}
            ${subtitle ? `<p class="lp-lead-form__subtitle">${escapeHtml(subtitle)}</p>` : ''}
            ${reassuranceHtml}
          </aside>
          <div class="lp-lead-form__card">
            <form class="lp-lead-form__form" action="#" method="post" novalidate>
              <div class="lp-lead-form__grid">${fieldsHtml}</div>
              <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
              <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit">${escapeHtml(submitText)}</button>
              ${privacyNote ? `<p class="lp-lead-form__privacy">${escapeHtml(privacyNote)}</p>` : ''}
            </form>
          </div>
        </div>
      </div>
    </section>`;
}

function renderHeroHtml(props: Record<string, unknown>): string {
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const eyebrow = propString(props, 'eyebrow', 'kicker', 'badge');
  const buttonText = propString(props, 'buttonText');
  const buttonTarget = propString(props, 'buttonTarget', 'href') ?? '#lead-form';
  const secondaryText = propString(props, 'secondaryButtonText', 'secondaryCtaText');
  const secondaryTarget =
    propString(props, 'secondaryButtonTarget', 'secondaryCtaTarget') ?? '#offer';
  const imageUrl = propString(props, 'imageUrl', 'src', 'url');
  const imageAlt = propString(props, 'alt', 'imageAlt') ?? 'Véhicule Auto Hall';

  const actions: string[] = [];
  if (buttonText) {
    actions.push(renderBtn(buttonTarget, buttonText, 'primary', 'lg'));
  }
  if (secondaryText) {
    actions.push(renderBtn(secondaryTarget, secondaryText, 'secondary', 'lg'));
  }

  const mediaHtml = imageUrl
    ? `<div class="lp-hero__media"><img class="lp-hero__img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" loading="eager" decoding="async" /></div>`
    : `<div class="lp-hero__media lp-hero__media--placeholder" aria-hidden="true"><span>Visuel véhicule / offre</span></div>`;

  return `
    <section class="lp-block lp-hero">
      <div class="lp-hero__glow" aria-hidden="true"></div>
      <div class="lp-hero__inner lp-section">
        <div class="lp-hero__content">
          ${eyebrow ? `<p class="lp-hero__eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
          ${title ? `<h1 class="lp-hero__title">${escapeHtml(title)}</h1>` : ''}
          ${subtitle ? `<p class="lp-hero__subtitle">${escapeHtml(subtitle)}</p>` : ''}
          ${actions.length ? `<div class="lp-hero__actions">${actions.join('')}</div>` : ''}
        </div>
        ${mediaHtml}
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

function renderOfferHighlightsHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseListItems(props, 'highlights', 'items');

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

function renderFeaturesShowcaseHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const modelName = propString(props, 'modelName', 'model');
  const modelTagline = propString(props, 'modelTagline', 'tagline');
  const imageUrl = propString(props, 'imageUrl', 'src');
  const imageAlt = propString(props, 'alt', 'imageAlt') ?? 'Véhicule';
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

  const mediaHtml = imageUrl
    ? `<div class="lp-showcase__media"><img class="lp-showcase__img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" /></div>`
    : `<div class="lp-showcase__media lp-showcase__media--placeholder" aria-hidden="true"><span>Visuel modèle</span></div>`;

  return `
    <section class="lp-block lp-features lp-features--showcase" id="model">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-showcase">
          ${mediaHtml}
          <div class="lp-showcase__copy">
            ${modelName ? `<p class="lp-showcase__model">${escapeHtml(modelName)}</p>` : ''}
            ${modelTagline ? `<p class="lp-showcase__tagline">${escapeHtml(modelTagline)}</p>` : ''}
            ${specs ? `<ul class="lp-showcase__specs">${specs}</ul>` : ''}
          </div>
        </div>
      </div>
    </section>`;
}

function renderFeaturesHtml(props: Record<string, unknown>): string {
  const layout = propString(props, 'layout');
  const imageUrl = propString(props, 'imageUrl', 'src');
  if (layout === 'showcase' || imageUrl) {
    return renderFeaturesShowcaseHtml(props);
  }

  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const items = parseListItems(props, 'items');

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
    <section class="lp-block lp-features">
      <div class="lp-section">
        <div class="lp-section-head">${renderSectionHeading(heading, subtitle)}</div>
        <div class="lp-features__grid">${cards}</div>
      </div>
    </section>`;
}

function renderFinancingHtml(props: Record<string, unknown>): string {
  const heading = propString(props, 'heading', 'title');
  const subtitle = propString(props, 'subtitle');
  const ctaLabel = propString(props, 'ctaLabel', 'buttonText') ?? 'Simuler mon financement';
  const ctaTarget = propString(props, 'ctaTarget', 'buttonTarget') ?? '#lead-form';
  const paymentExample = propString(props, 'paymentExample', 'monthlyFrom');
  const bullets = parseStringList(props, 'bullets');

  const listHtml = bullets
    .map((bullet) => `<li class="lp-financing__bullet">${escapeHtml(bullet)}</li>`)
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
  const title = propString(props, 'title', 'heading');
  const subtitle = propString(props, 'subtitle', 'description');
  const buttonText = propString(props, 'buttonText', 'label') ?? 'Je passe à l’action';
  const buttonTarget = propString(props, 'buttonTarget', 'target') ?? '#lead-form';

  return `
    <section class="lp-block lp-final-cta">
      <div class="lp-section">
        <div class="lp-final-cta__panel">
          ${title ? `<h2 class="lp-final-cta__title">${escapeHtml(title)}</h2>` : ''}
          ${subtitle ? `<p class="lp-final-cta__subtitle">${escapeHtml(subtitle)}</p>` : ''}
          <a class="lp-btn lp-btn--primary lp-btn--lg" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a>
        </div>
      </div>
    </section>`;
}

function renderFooterLegalHtml(props: Record<string, unknown>): string {
  const legalText =
    propString(props, 'legalText', 'text') ??
    'Mentions légales — Auto Hall. Offre soumise à conditions.';
  const links = parseLinks(props);

  const linksHtml = links
    .map(
      (link) =>
        `<a class="lp-footer-legal__link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join('');

  return `
    <section class="lp-block lp-footer-legal">
      <div class="lp-section">
        <p class="lp-footer-legal__text">${escapeHtml(legalText)}</p>
        ${linksHtml ? `<div class="lp-footer-legal__links">${linksHtml}</div>` : ''}
      </div>
    </section>`;
}

export function renderBlockHtml(block: RenderBlockInput): string {
  const props = propsAsRecord(block.propsJson);
  const type = block.blockType.toLowerCase();

  if (type === 'hero') {
    return renderHeroHtml(props);
  }

  if (type === 'trust_bar') {
    return renderTrustBarHtml(props);
  }

  if (type === 'text') {
    const content = propString(props, 'content', 'text', 'body') ?? '';
    const heading = propString(props, 'heading', 'title');

    return `
    <section class="lp-block lp-text">
      <div class="lp-section lp-section--narrow">
        ${heading ? `<h2 class="lp-text__heading">${escapeHtml(heading)}</h2>` : ''}
        <div class="lp-text__body">${renderTextParagraphs(content)}</div>
      </div>
    </section>`;
  }

  if (type === 'image') {
    const imageUrl = propString(props, 'imageUrl', 'src', 'url');
    const alt = propString(props, 'alt') ?? 'Image';
    const caption = propString(props, 'caption');

    if (imageUrl) {
      return `
    <section class="lp-block lp-media">
      <div class="lp-section">
        <figure class="lp-media__figure">
          <img class="lp-media__img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
          ${caption ? `<figcaption class="lp-media__caption">${escapeHtml(caption)}</figcaption>` : ''}
        </figure>
      </div>
    </section>`;
    }

    return `
    <section class="lp-block lp-media lp-media--empty">
      <div class="lp-section">
        <div class="lp-media__placeholder">Image non définie</div>
      </div>
    </section>`;
  }

  if (type === 'button') {
    const label = propString(props, 'label', 'text', 'buttonText') ?? 'En savoir plus';
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

  if (type === 'offer_highlights') {
    return renderOfferHighlightsHtml(props);
  }

  if (type === 'features') {
    return renderFeaturesHtml(props);
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

export function renderBlocksHtml(blocks: RenderBlockInput[]): string {
  return blocks.map((block) => renderBlockHtml(block)).join('\n');
}
