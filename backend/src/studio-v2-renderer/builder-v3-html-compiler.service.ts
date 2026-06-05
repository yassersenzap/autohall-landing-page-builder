import { Injectable } from '@nestjs/common';
import {
  buildLeadFormFieldSpecs,
  type LeadFormFieldSpec,
} from '../landing-render/lead-form-fields.builder';

export type BuilderV3CompileBlock = {
  type: string;
  sortOrder?: number;
  propsJson: Record<string, unknown>;
};

export type BuilderV3CompileInput = {
  pageTitle: string;
  metaDescription: string;
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  blocks: BuilderV3CompileBlock[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function renderLeadFieldHtml(field: LeadFormFieldSpec): string {
  const full = field.fullWidth ? 'sm:col-span-2' : '';
  const requiredMark = field.required ? ' *' : '';
  const inputClass =
    'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900';

  let control = '';
  if (field.type === 'select') {
    const options = (field.options ?? [])
      .map(
        (opt) =>
          `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`,
      )
      .join('');
    control = `<select class="${inputClass}" name="${escapeHtml(field.name)}"${field.required ? ' required' : ''}>${options}</select>`;
  } else if (field.type === 'textarea') {
    control = `<textarea class="${inputClass}" name="${escapeHtml(field.name)}" rows="3"${field.required ? ' required' : ''}></textarea>`;
  } else {
    control = `<input class="${inputClass}" type="${field.type}" name="${escapeHtml(field.name)}"${field.required ? ' required' : ''} />`;
  }

  return `
    <label class="block space-y-1 ${full}">
      <span class="text-xs font-medium text-neutral-700">${escapeHtml(field.label)}${requiredMark}</span>
      ${control}
    </label>`;
}

function renderLeadFormInner(props: Record<string, unknown>): string {
  const fields = buildLeadFormFieldSpecs(props);
  const submitText = asString(props.submitText, 'Envoyer votre demande');
  const consentLabel = asString(
    props.consentLabel,
    'J’accepte le traitement de mes données personnelles.',
  );
  const requiredNote = asString(props.requiredFieldsNote, '* Champs obligatoires.');
  const formConfig =
    props.formConfig && typeof props.formConfig === 'object' && !Array.isArray(props.formConfig)
      ? (props.formConfig as Record<string, unknown>)
      : {};
  const showConsent = formConfig.showConsent !== false;

  const fieldsHtml = fields.map(renderLeadFieldHtml).join('');
  const consentHtml = showConsent
    ? `<label class="flex items-start gap-2 text-xs leading-snug text-neutral-600">
        <input type="checkbox" name="consent" required class="mt-0.5" />
        <span>${escapeHtml(consentLabel)}</span>
      </label>`
    : '';

  return `
    <p class="text-[0.625rem] text-neutral-500">${escapeHtml(requiredNote)}</p>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">${fieldsHtml}</div>
    ${consentHtml}
    <p class="lp-lead-form__feedback text-sm" role="status" aria-live="polite"></p>
    <button type="submit" class="lp-btn lp-btn--primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg" style="background:var(--primary)">
      ${escapeHtml(submitText)}
    </button>`;
}

@Injectable()
export class BuilderV3HtmlCompilerService {
  compile(input: BuilderV3CompileInput): string {
    const sorted = [...input.blocks].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const body = sorted.map((block) => this.compileBlock(block)).join('\n');
    const title = escapeHtml(input.pageTitle || 'Landing Auto Hall');
    const description = escapeHtml(input.metaDescription || 'Campagne Auto Hall');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary: ${escapeHtml(input.primaryColor)};
      --primary-hover: ${escapeHtml(input.primaryColor)};
      --font-heading: "${escapeHtml(input.headingFont)}", system-ui, sans-serif;
      --font-body: "${escapeHtml(input.bodyFont)}", system-ui, sans-serif;
    }
    body { font-family: var(--font-body); color: #171717; background: #fff; }
    h1, h2, h3 { font-family: var(--font-heading); }
    .lp-lead-form__feedback.is-success { color: #15803d; }
    .lp-lead-form__feedback.is-error { color: #b91c1c; }
  </style>
</head>
<body class="min-h-screen antialiased">
  <main class="w-full">
${body}
  </main>
  <script src="js/landing-config.js"></script>
  <script src="js/lead-form.js"></script>
</body>
</html>`;
  }

  private compileBlock(block: BuilderV3CompileBlock): string {
    const props = block.propsJson ?? {};
    switch (block.type) {
      case 'promo_autohall':
        return this.compilePromoAutoHall(props);
      case 'lead_form':
        return this.compileLeadForm(props);
      case 'hero_campaign':
      case 'hero_form_campaign':
        return this.compileHero(props);
      case 'cta_band':
        return this.compileCtaBand(props);
      case 'footer_legal':
        return this.compileFooterLegal(props);
      case 'faq':
        return this.compileFaq(props);
      case 'testimonials':
        return this.compileTestimonials(props);
      case 'pricing_trim':
        return this.compilePricingTrim(props);
      case 'vehicle_features':
        return this.compileVehicleFeatures(props);
      case 'rich_text':
        return this.compileRichText(props);
      case 'media_only':
        return this.compileMediaOnly(props);
      case 'gallery':
        return this.compileGallery(props);
      case 'video_embed':
        return this.compileVideoEmbed(props);
      case 'spacer_divider':
        return this.compileSpacer(props);
      default:
        return `<section class="px-6 py-12 text-center text-sm text-neutral-500">Bloc ${escapeHtml(block.type)}</section>`;
    }
  }

  private compilePromoAutoHall(props: Record<string, unknown>): string {
    const title = asString(props.title, 'Votre prochaine aventure');
    const subtitle = asString(
      props.subtitle,
      'Offres exclusives, financement sur mesure et essai en concession.',
    );
    const formTitle = asString(props.formTitle, 'Demandez votre offre');
    const formSubtitle = asString(props.formSubtitle);
    const imageUrl = asString(props.imageUrl);
    const bgStyle = imageUrl
      ? `background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url('${escapeHtml(imageUrl)}');background-size:cover;background-position:center;`
      : 'background:linear-gradient(135deg,#1e293b,#0f172a);';

    return `
    <section id="${escapeHtml(asString(props.anchorId, 'lead-form'))}" class="relative flex min-h-[800px] w-full items-center overflow-hidden px-8 py-16" style="${bgStyle}">
      <div class="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div class="space-y-4 text-white">
          <h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">${escapeHtml(title)}</h1>
          <p class="max-w-xl text-base text-white/85 sm:text-lg">${escapeHtml(subtitle)}</p>
        </div>
        <div class="w-full max-w-md justify-self-center lg:justify-self-end">
          <div class="rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div class="mb-5 space-y-1">
              <h2 class="text-xl font-bold text-neutral-900">${escapeHtml(formTitle)}</h2>
              ${formSubtitle ? `<p class="text-sm text-neutral-600">${escapeHtml(formSubtitle)}</p>` : ''}
            </div>
            <form class="lp-lead-form space-y-3" action="#" method="post" novalidate>
              ${renderLeadFormInner(props)}
            </form>
          </div>
        </div>
      </div>
    </section>`;
  }

  private compileLeadForm(props: Record<string, unknown>): string {
    const title = asString(props.title, 'Contactez-nous');
    const subtitle = asString(props.subtitle);

    return `
    <section id="lead-form" class="bg-neutral-50 px-6 py-16">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 class="text-3xl font-bold text-neutral-900">${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="mt-3 text-neutral-600">${escapeHtml(subtitle)}</p>` : ''}
        </div>
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <form class="lp-lead-form space-y-4" action="#" method="post" novalidate>
            ${renderLeadFormInner(props)}
          </form>
        </div>
      </div>
    </section>`;
  }

  private compileHero(props: Record<string, unknown>): string {
    const title = asString(props.title, 'Titre principal');
    const subtitle = asString(props.subtitle);
    const buttonText = asString(props.buttonText);
    const buttonTarget = asString(props.buttonTarget, '#lead-form');
    const secondaryText = asString(props.secondaryButtonText);
    const secondaryTarget = asString(props.secondaryButtonTarget, '#offer');
    const imageUrl = asString(props.imageUrl);

    const actions: string[] = [];
    if (buttonText) {
      actions.push(
        `<a href="${escapeHtml(buttonTarget)}" class="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md" style="background:var(--primary)">${escapeHtml(buttonText)}</a>`,
      );
    }
    if (secondaryText) {
      actions.push(
        `<a href="${escapeHtml(secondaryTarget)}" class="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800">${escapeHtml(secondaryText)}</a>`,
      );
    }

    return `
    <section class="px-6 py-16 lg:py-24">
      <div class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div class="space-y-5">
          <h1 class="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="text-lg text-neutral-600">${escapeHtml(subtitle)}</p>` : ''}
          ${actions.length ? `<div class="flex flex-wrap gap-3">${actions.join('')}</div>` : ''}
        </div>
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" class="w-full rounded-2xl object-cover shadow-lg" />` : ''}
      </div>
    </section>`;
  }

  private compileCtaBand(props: Record<string, unknown>): string {
    const title = asString(props.title, 'Prêt à passer à l’action ?');
    const buttonText = asString(props.buttonText, 'Contactez-nous');
    const buttonHref = asString(props.buttonHref, '#lead-form');

    return `
    <section class="px-6 py-12 text-white" style="background:var(--primary)">
      <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <h2 class="text-xl font-bold sm:text-2xl">${escapeHtml(title)}</h2>
        <a href="${escapeHtml(buttonHref)}" class="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-lg" style="color:var(--primary)">${escapeHtml(buttonText)}</a>
      </div>
    </section>`;
  }

  private compileFooterLegal(props: Record<string, unknown>): string {
    const legalText = asString(
      props.legalText,
      '© Auto Hall — Mentions légales et politique de confidentialité.',
    );
    return `
    <footer class="border-t border-neutral-200 bg-neutral-50 px-6 py-8">
      <p class="mx-auto max-w-5xl text-center text-xs leading-relaxed text-neutral-500">${escapeHtml(legalText)}</p>
    </footer>`;
  }

  private compileFaq(props: Record<string, unknown>): string {
    const heading = asString(props.heading, 'Questions fréquentes');
    const items = Array.isArray(props.items) ? props.items : [];
    const itemsHtml = items
      .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
      .map(
        (item) => `
        <details class="rounded-lg border border-neutral-200 bg-white p-4">
          <summary class="cursor-pointer font-semibold text-neutral-900">${escapeHtml(asString(item.question))}</summary>
          <p class="mt-2 text-sm text-neutral-600">${escapeHtml(asString(item.answer))}</p>
        </details>`,
      )
      .join('');

    return `
    <section class="px-6 py-16">
      <div class="mx-auto max-w-3xl space-y-6">
        <h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>
        <div class="space-y-3">${itemsHtml}</div>
      </div>
    </section>`;
  }

  private compileTestimonials(props: Record<string, unknown>): string {
    const heading = asString(props.heading, 'Ils nous font confiance');
    const quotes = Array.isArray(props.quotes) ? props.quotes : [];
    const cards = quotes
      .filter((q): q is Record<string, unknown> => q !== null && typeof q === 'object')
      .map(
        (q) => `
        <blockquote class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p class="text-sm italic text-neutral-700">"${escapeHtml(asString(q.text))}"</p>
          <footer class="mt-4 text-xs font-semibold text-neutral-900">${escapeHtml(asString(q.author))}</footer>
        </blockquote>`,
      )
      .join('');

    return `
    <section class="bg-neutral-50 px-6 py-16">
      <div class="mx-auto max-w-6xl space-y-8">
        <h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">${cards}</div>
      </div>
    </section>`;
  }

  private compilePricingTrim(props: Record<string, unknown>): string {
    const heading = asString(props.heading, 'Finitions & financement');
    const trims = (Array.isArray(props.trims) ? props.trims : []).slice(0, 3);
    const cards = trims
      .filter((t): t is Record<string, unknown> => t !== null && typeof t === 'object')
      .map((trim, index) => {
        const featured = Boolean(trim.featured);
        const btnClass = featured
          ? 'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white'
          : 'inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900';
        return `
        <article class="flex flex-col rounded-2xl border p-6 shadow-sm ${featured ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-neutral-200'}">
          <h3 class="text-lg font-semibold">${escapeHtml(asString(trim.name, `Finition ${index + 1}`))}</h3>
          <p class="mt-3 text-3xl font-bold">${escapeHtml(asString(trim.price, '—'))}</p>
          <a href="${escapeHtml(asString(trim.buttonHref, '#lead-form'))}" class="${btnClass} mt-8"${featured ? ' style="background:var(--primary)"' : ''}>
            ${escapeHtml(asString(trim.buttonText, 'Choisir'))}
          </a>
        </article>`;
      })
      .join('');

    return `
    <section class="px-6 py-16">
      <div class="mx-auto max-w-6xl space-y-10">
        <h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">${cards}</div>
      </div>
    </section>`;
  }

  private compileVehicleFeatures(props: Record<string, unknown>): string {
    const heading = asString(props.heading, asString(props.title, 'Caractéristiques'));
    const items = Array.isArray(props.items) ? props.items : [];
    const list = items
      .filter((i): i is Record<string, unknown> => i !== null && typeof i === 'object')
      .map(
        (item) => `
        <li class="rounded-xl border border-neutral-200 bg-white p-4">
          <p class="font-semibold text-neutral-900">${escapeHtml(asString(item.title))}</p>
          <p class="mt-1 text-sm text-neutral-600">${escapeHtml(asString(item.description))}</p>
        </li>`,
      )
      .join('');

    return `
    <section class="bg-neutral-50 px-6 py-16">
      <div class="mx-auto max-w-6xl space-y-8">
        <h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>
        <ul class="grid grid-cols-1 gap-4 md:grid-cols-3">${list}</ul>
      </div>
    </section>`;
  }

  private compileRichText(props: Record<string, unknown>): string {
    const title = asString(props.title, asString(props.heading));
    const body = asString(props.body, asString(props.content));
    return `
    <section class="px-6 py-12">
      <div class="prose mx-auto max-w-3xl">
        ${title ? `<h2 class="text-2xl font-bold text-neutral-900">${escapeHtml(title)}</h2>` : ''}
        ${body ? `<p class="mt-4 whitespace-pre-line text-neutral-600">${escapeHtml(body)}</p>` : ''}
      </div>
    </section>`;
  }

  private compileMediaOnly(props: Record<string, unknown>): string {
    const imageUrl = asString(props.imageUrl);
    const alt = asString(props.alt, 'Visuel Auto Hall');
    if (!imageUrl) return '';
    return `
    <section class="px-6 py-8">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" class="mx-auto max-w-5xl rounded-2xl shadow-lg" />
    </section>`;
  }

  private compileGallery(props: Record<string, unknown>): string {
    const images = Array.isArray(props.images) ? props.images : [];
    const cells = images
      .filter((img): img is Record<string, unknown> => img !== null && typeof img === 'object')
      .map(
        (img) =>
          `<img src="${escapeHtml(asString(img.url, asString(img.imageUrl)))}" alt="" class="h-48 w-full rounded-xl object-cover" />`,
      )
      .join('');
    return `
    <section class="px-6 py-12">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">${cells}</div>
    </section>`;
  }

  private compileVideoEmbed(props: Record<string, unknown>): string {
    const videoUrl = asString(props.videoUrl);
    if (!videoUrl) return '';
    const embed = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
      ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
      : videoUrl;
    return `
    <section class="px-6 py-12">
      <div class="mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl shadow-lg">
        <iframe src="${escapeHtml(embed)}" class="h-full w-full" allowfullscreen loading="lazy"></iframe>
      </div>
    </section>`;
  }

  private compileSpacer(props: Record<string, unknown>): string {
    const hauteur = asString(props.hauteur, 'M');
    const heightMap: Record<string, string> = { S: '2rem', M: '4rem', L: '6rem', XL: '8rem' };
    return `<div style="height:${heightMap[hauteur] ?? '4rem'}"></div>`;
  }
}
