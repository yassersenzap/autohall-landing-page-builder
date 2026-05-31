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

function renderLeadFormHtml(props: Record<string, unknown>): string {
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const submitText = propString(props, 'submitText') ?? 'Envoyer ma demande';
  const fields = parseLeadFormFields(props);

  const fieldsHtml = fields
    .map((field) => {
      const requiredAttr = field.required ? ' required' : '';
      const inputType = escapeHtml(field.type || 'text');
      return `
        <label class="lp-lead-form__field">
          <span class="lp-lead-form__label">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</span>
          <input class="lp-lead-form__input" type="${inputType}" name="${escapeHtml(field.name)}"${requiredAttr} autocomplete="on" />
        </label>`;
    })
    .join('');

  return `
    <section class="lp-block lp-lead-form" id="lead-form">
      <div class="lp-section lp-section--narrow">
        <div class="lp-lead-form__card">
          ${title ? `<h2 class="lp-lead-form__title">${escapeHtml(title)}</h2>` : ''}
          ${subtitle ? `<p class="lp-lead-form__subtitle">${escapeHtml(subtitle)}</p>` : ''}
          <form class="lp-lead-form" action="#" method="post" novalidate>
            <div class="lp-lead-form__grid">${fieldsHtml}</div>
            <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
            <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg">${escapeHtml(submitText)}</button>
          </form>
        </div>
      </div>
    </section>`;
}

export function renderBlockHtml(block: RenderBlockInput): string {
  const props = propsAsRecord(block.propsJson);
  const type = block.blockType.toLowerCase();

  if (type === 'hero') {
    const title = propString(props, 'title');
    const subtitle = propString(props, 'subtitle');
    const eyebrow = propString(props, 'eyebrow', 'kicker', 'badge');
    const buttonText = propString(props, 'buttonText');
    const buttonTarget = propString(props, 'buttonTarget', 'href') ?? '#lead-form';

    return `
    <section class="lp-block lp-hero">
      <div class="lp-hero__inner lp-section">
        ${eyebrow ? `<p class="lp-hero__eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
        ${title ? `<h1 class="lp-hero__title">${escapeHtml(title)}</h1>` : ''}
        ${subtitle ? `<p class="lp-hero__subtitle">${escapeHtml(subtitle)}</p>` : ''}
        ${
          buttonText
            ? `<div class="lp-hero__actions"><a class="lp-btn lp-btn--primary lp-btn--lg" href="${escapeHtml(buttonTarget)}">${escapeHtml(buttonText)}</a></div>`
            : ''
        }
      </div>
    </section>`;
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
      <p class="lp-site-header__brand">${escapeHtml(shell.brand)}</p>
      <p class="lp-site-header__campaign">${escapeHtml(shell.campaignName)}</p>
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
