import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildLeadFormFieldSpecs,
  type LeadFormFieldSpec,
} from '../landing-render/lead-form-fields.builder';
import { renderBlockHtml } from '../landing-render/block-renderer';
import { resolveHeroImageSrc } from '../landing-render/render-asset.resolve';
import type { LandingRenderContext } from '../landing-render/render-asset.types';

const LANDING_RENDER_BLOCK_TYPES = new Set([
  'hero_form_campaign',
  'promo_autohall',
  'vehicle_offer',
  'lead_form',
  'final_cta',
  'hero_campaign',
  'trust_bar',
  'benefits',
  'faq',
  'testimonials',
  'footer_legal',
  'vehicle_range',
]);

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
  renderContext?: LandingRenderContext;
  pageSettings?: Record<string, unknown>;
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

function resolveObjectFitClass(objectFit: unknown): string {
  return objectFit === 'contain' ? 'object-contain' : 'object-cover';
}

function resolveImageSrc(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  return resolveHeroImageSrc(props, context) ?? '';
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
  const requiredNote = asString(
    props.requiredFieldsNote,
    '* Champs obligatoires.',
  );
  const formConfig =
    props.formConfig &&
    typeof props.formConfig === 'object' &&
    !Array.isArray(props.formConfig)
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
    const context = input.renderContext;
    const sorted = [...input.blocks].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const body = sorted
      .map((block) => this.compileBlock(block, context))
      .join('\n');
    const title = escapeHtml(input.pageTitle || 'Landing Auto Hall');
    const description = escapeHtml(
      input.metaDescription || 'Campagne Auto Hall',
    );
    const pageSettings = input.pageSettings ?? {};
    const ogImageSrc = resolveImageSrc(
      {
        imageAssetId: pageSettings.ogImageAssetId,
        imageUrl: pageSettings.ogImageUrl,
      },
      context,
    );
    const faviconSrc = resolveImageSrc(
      {
        imageAssetId: pageSettings.faviconAssetId,
        imageUrl: pageSettings.faviconUrl,
      },
      context,
    );
    const ogImageTag = ogImageSrc
      ? `\n  <meta property="og:image" content="${escapeHtml(ogImageSrc)}" />`
      : '';
    const faviconTag = faviconSrc
      ? `\n  <link rel="icon" href="${escapeHtml(faviconSrc)}" />`
      : '';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />${ogImageTag}${faviconTag}
  <link rel="stylesheet" href="assets/style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --lp-primary: ${escapeHtml(input.primaryColor)};
      --lp-primary-hover: ${escapeHtml(input.primaryColor)};
      --lp-display-font: "${escapeHtml(input.headingFont)}", system-ui, sans-serif;
      --lp-font: "${escapeHtml(input.bodyFont)}", system-ui, sans-serif;
      --primary: ${escapeHtml(input.primaryColor)};
      --font-heading: var(--lp-display-font);
      --font-body: var(--lp-font);
    }
  </style>
</head>
<body class="min-h-screen antialiased">
  <article class="lp-document" style="--lp-primary:${escapeHtml(input.primaryColor)};--lp-display-font:var(--font-heading);--lp-font:var(--font-body);">
  <main class="lp-page w-full">
${body}
  </main>
  </article>
  <script src="js/landing-config.js"></script>
  <script src="js/lead-form.js"></script>
</body>
</html>`;
  }

  private compileBlock(
    block: BuilderV3CompileBlock,
    context?: LandingRenderContext,
  ): string {
    if (LANDING_RENDER_BLOCK_TYPES.has(block.type)) {
      return renderBlockHtml(
        {
          blockType: block.type,
          sortOrder: block.sortOrder ?? 0,
          propsJson: block.propsJson as Prisma.JsonValue,
        },
        context,
      );
    }

    const props = block.propsJson ?? {};
    switch (block.type) {
      case 'promo_autohall':
        return this.compilePromoAutoHall(props, context);
      case 'lead_form':
        return this.compileLeadForm(props);
      case 'hero_campaign':
      case 'hero_form_campaign':
        return this.compileHero(props, context);
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
        return this.compileMediaOnly(props, context);
      case 'gallery':
        return this.compileGallery(props, context);
      case 'video_embed':
        return this.compileVideoEmbed(props);
      case 'spacer_divider':
        return this.compileSpacer(props);
      case 'vehicle_offer':
        return this.compileVehicleOffer(props, context);
      case 'vehicle_range':
        return this.compileVehicleRange(props, context);
      case 'benefits':
        return this.compileBenefits(props);
      case 'trust_bar':
        return this.compileTrustBar(props);
      case 'final_cta':
        return this.compileFinalCta(props, context);
      default:
        return `<section class="px-6 py-12 text-center text-sm text-neutral-500">Bloc ${escapeHtml(block.type)}</section>`;
    }
  }

  private compilePromoAutoHall(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const title = asString(props.title, 'Votre prochaine aventure');
    const subtitle = asString(
      props.subtitle,
      'Offres exclusives, financement sur mesure et essai en concession.',
    );
    const formTitle = asString(props.formTitle, 'Demandez votre offre');
    const formSubtitle = asString(props.formSubtitle);
    const imageSrc = resolveImageSrc(props, context);
    const bgStyle = imageSrc
      ? `background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url('${escapeHtml(imageSrc)}');background-size:cover;background-position:center;`
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

  private compileHero(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const title = asString(props.title, 'Titre principal');
    const subtitle = asString(props.subtitle);
    const buttonText = asString(props.buttonText);
    const buttonTarget = asString(props.buttonTarget, '#lead-form');
    const secondaryText = asString(props.secondaryButtonText);
    const secondaryTarget = asString(props.secondaryButtonTarget, '#offer');
    const imageSrc = resolveImageSrc(props, context);
    const imageAlt = asString(props.alt, asString(props.imageAlt, title));
    const fitClass = resolveObjectFitClass(props.objectFit);

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
        ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" class="w-full rounded-2xl shadow-lg ${fitClass}" />` : ''}
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
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === 'object',
      )
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
      .filter(
        (q): q is Record<string, unknown> =>
          q !== null && typeof q === 'object',
      )
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
      .filter(
        (t): t is Record<string, unknown> =>
          t !== null && typeof t === 'object',
      )
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
    const heading = asString(
      props.heading,
      asString(props.title, 'Caractéristiques'),
    );
    const items = Array.isArray(props.items) ? props.items : [];
    const list = items
      .filter(
        (i): i is Record<string, unknown> =>
          i !== null && typeof i === 'object',
      )
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

  private compileMediaOnly(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const imageSrc = resolveImageSrc(props, context);
    const alt = asString(props.alt, asString(props.imageAlt, 'Visuel Auto Hall'));
    const fitClass = resolveObjectFitClass(props.objectFit);
    if (!imageSrc) return '';
    return `
    <section class="px-6 py-8">
      <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt)}" class="mx-auto max-w-5xl rounded-2xl shadow-lg ${fitClass}" />
    </section>`;
  }

  private compileGallery(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const images = Array.isArray(props.images) ? props.images : [];
    const cells = images
      .filter(
        (img): img is Record<string, unknown> =>
          img !== null && typeof img === 'object',
      )
      .map((img) => {
        const src = resolveImageSrc(img, context);
        if (!src) return '';
        const alt = asString(img.alt, 'Visuel galerie');
        const fitClass = resolveObjectFitClass(img.objectFit);
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="h-48 w-full rounded-xl ${fitClass}" />`;
      })
      .filter(Boolean)
      .join('');
    return `
    <section class="px-6 py-12">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">${cells}</div>
    </section>`;
  }

  private compileVideoEmbed(props: Record<string, unknown>): string {
    const videoUrl = asString(props.videoUrl);
    if (!videoUrl) return '';
    const embed =
      videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
        ? videoUrl
            .replace('watch?v=', 'embed/')
            .replace('youtu.be/', 'youtube.com/embed/')
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
    const heightMap: Record<string, string> = {
      S: '2rem',
      M: '4rem',
      L: '6rem',
      XL: '8rem',
    };
    return `<div style="height:${heightMap[hauteur] ?? '4rem'}"></div>`;
  }

  private compileVehicleOffer(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const modelName = asString(props.modelName);
    const heading = asString(props.heading, modelName);
    const subtitle = asString(props.subtitle);
    const priceLabel = asString(props.priceLabel, 'À partir de');
    const priceValue = asString(props.priceValue);
    const buttonText = asString(props.buttonText, 'Demander une offre');
    const imageSrc = resolveImageSrc(props, context);
    const imageAlt = asString(props.alt, modelName || heading);
    const fitClass = resolveObjectFitClass(props.objectFit);

    return `
    <section class="px-6 py-16">
      <div class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div class="space-y-4">
          ${heading ? `<h2 class="text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>` : ''}
          ${subtitle ? `<p class="text-neutral-600">${escapeHtml(subtitle)}</p>` : ''}
          ${priceValue ? `<p class="text-lg"><span class="text-neutral-500">${escapeHtml(priceLabel)}</span> <strong class="text-2xl">${escapeHtml(priceValue)}</strong></p>` : ''}
          <a href="#lead-form" class="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white" style="background:var(--primary)">${escapeHtml(buttonText)}</a>
        </div>
        ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" class="w-full rounded-2xl shadow-lg ${fitClass}" />` : ''}
      </div>
    </section>`;
  }

  private compileVehicleRange(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const heading = asString(props.heading);
    const subtitle = asString(props.subtitle);
    const vehicles = Array.isArray(props.vehicles) ? props.vehicles : [];
    const cards = vehicles
      .filter(
        (v): v is Record<string, unknown> =>
          v !== null && typeof v === 'object',
      )
      .map((vehicle) => {
        const name = asString(vehicle.name);
        if (!name) return '';
        const energy = asString(vehicle.energy);
        const imageSrc = resolveImageSrc(vehicle, context);
        const imageAlt = asString(vehicle.alt, name);
        const fitClass = resolveObjectFitClass(vehicle.objectFit);
        const mediaHtml = imageSrc
          ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" class="h-40 w-full rounded-t-xl ${fitClass}" />`
          : `<div class="h-40 w-full rounded-t-xl bg-neutral-200"></div>`;
        return `
        <article class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          ${mediaHtml}
          <div class="space-y-2 p-4">
            <h3 class="font-semibold text-neutral-900">${escapeHtml(name)}</h3>
            ${energy ? `<p class="text-xs text-neutral-500">${escapeHtml(energy)}</p>` : ''}
          </div>
        </article>`;
      })
      .filter(Boolean)
      .join('');

    return `
    <section class="bg-neutral-50 px-6 py-16">
      <div class="mx-auto max-w-6xl space-y-8">
        ${heading ? `<h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>` : ''}
        ${subtitle ? `<p class="text-center text-neutral-600">${escapeHtml(subtitle)}</p>` : ''}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">${cards}</div>
      </div>
    </section>`;
  }

  private compileBenefits(props: Record<string, unknown>): string {
    const heading = asString(props.heading);
    const items = Array.isArray(props.items) ? props.items : [];
    const cards = items
      .filter(
        (i): i is Record<string, unknown> =>
          i !== null && typeof i === 'object',
      )
      .map(
        (item) => `
        <article class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 class="font-semibold text-neutral-900">${escapeHtml(asString(item.title))}</h3>
          <p class="mt-2 text-sm text-neutral-600">${escapeHtml(asString(item.description))}</p>
        </article>`,
      )
      .join('');

    return `
    <section class="px-6 py-16">
      <div class="mx-auto max-w-6xl space-y-8">
        ${heading ? `<h2 class="text-center text-3xl font-bold text-neutral-900">${escapeHtml(heading)}</h2>` : ''}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">${cards}</div>
      </div>
    </section>`;
  }

  private compileTrustBar(props: Record<string, unknown>): string {
    const metrics = Array.isArray(props.metrics) ? props.metrics : [];
    const cells = metrics
      .filter(
        (m): m is Record<string, unknown> =>
          m !== null && typeof m === 'object',
      )
      .filter((m) => asString(m.value) || asString(m.label))
      .map(
        (metric) => `
        <div class="text-center">
          <p class="text-2xl font-bold text-neutral-900">${escapeHtml(asString(metric.value))}</p>
          <p class="text-xs text-neutral-500">${escapeHtml(asString(metric.label))}</p>
        </div>`,
      )
      .join('');
    if (!cells) return '';

    return `
    <section class="border-y border-neutral-200 bg-white px-6 py-8">
      <div class="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">${cells}</div>
    </section>`;
  }

  private compileFinalCta(
    props: Record<string, unknown>,
    context?: LandingRenderContext,
  ): string {
    const title = asString(props.title);
    const subtitle = asString(props.subtitle);
    const buttonText = asString(props.buttonText, 'Contactez-nous');
    const buttonTarget = asString(props.buttonTarget, '#lead-form');
    const bgImageSrc = resolveImageSrc(props, context);
    const bgStyle = bgImageSrc
      ? `background-image:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),url('${escapeHtml(bgImageSrc)}');background-size:cover;background-position:center;`
      : 'background:var(--primary)';

    return `
    <section class="px-6 py-16 text-white" style="${bgStyle}">
      <div class="mx-auto max-w-3xl space-y-4 text-center">
        ${title ? `<h2 class="text-3xl font-bold">${escapeHtml(title)}</h2>` : ''}
        ${subtitle ? `<p class="text-white/90">${escapeHtml(subtitle)}</p>` : ''}
        <a href="${escapeHtml(buttonTarget)}" class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-lg" style="color:var(--primary)">${escapeHtml(buttonText)}</a>
      </div>
    </section>`;
  }
}
