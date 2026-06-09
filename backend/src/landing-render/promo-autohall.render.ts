import type { LandingRenderContext } from './render-asset.types';
import { resolveHeroImageSrc } from './render-asset.resolve';
import {
  renderLeadFormConsentHtml,
  renderLeadFormFieldsHtml,
  renderLeadFormRequiredNoteHtml,
} from './lead-form-fields.render';

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

/** Plein écran campagne Auto Hall — texte + formulaire flottant (Builder V3 promo_autohall). */
export function renderPromoAutohallHtml(
  props: Record<string, unknown>,
  context?: LandingRenderContext,
): string {
  const title = propString(props, 'title') ?? 'Votre prochaine aventure';
  const subtitle =
    propString(props, 'subtitle') ??
    'Offres exclusives, financement sur mesure et essai en concession.';
  const eyebrow = propString(props, 'eyebrow');
  const promoBadge = propString(props, 'promoBadge');
  const legalNote = propString(props, 'legalNote');
  const formTitle = propString(props, 'formTitle') ?? 'Demandez votre offre';
  const formSubtitle = propString(props, 'formSubtitle');
  const submitText = propString(props, 'submitText') ?? 'Envoyer ma demande';
  const anchorId = propString(props, 'anchorId') ?? 'lead-form';
  const textAlign = propString(props, 'textAlignment') ?? 'left';
  const alignClass =
    textAlign === 'center'
      ? 'lp-promo-autohall__copy--center'
      : textAlign === 'right'
        ? 'lp-promo-autohall__copy--right'
        : '';

  const imageSrc = resolveHeroImageSrc(props, context);
  const bgType = propString(props, 'backgroundType') ?? 'image';
  const bgColor = propString(props, 'backgroundColor') ?? '#0f172a';
  const overlayKey = propString(props, 'overlayOpacity') ?? '80';
  const overlayAlpha = Math.min(
    1,
    Math.max(0, (Number.parseInt(overlayKey, 10) || 80) / 100),
  );

  const bgStyle =
    bgType === 'color'
      ? `background-color:${escapeHtml(bgColor)};`
      : imageSrc
        ? `background-image:linear-gradient(rgba(0,0,0,${overlayAlpha}),rgba(0,0,0,${overlayAlpha})),url('${escapeHtml(imageSrc)}');background-size:cover;background-position:center;`
        : `background:linear-gradient(160deg,#0f172a 0%,#1e293b 55%,#0f172a 100%);`;

  const fieldsHtml = renderLeadFormFieldsHtml(props);
  const consentHtml = renderLeadFormConsentHtml(props);
  const requiredNoteHtml = renderLeadFormRequiredNoteHtml(props);

  return `
    <section class="lp-block lp-promo-autohall" id="${escapeHtml(anchorId)}" style="${bgStyle}">
      <div class="lp-promo-autohall__inner lp-section">
        <div class="lp-promo-autohall__grid">
          <div class="lp-promo-autohall__copy ${alignClass}">
            ${eyebrow ? `<p class="lp-promo-autohall__eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
            ${promoBadge ? `<span class="lp-promo-autohall__badge">${escapeHtml(promoBadge)}</span>` : ''}
            <h1 class="lp-promo-autohall__title">${escapeHtml(title)}</h1>
            <p class="lp-promo-autohall__subtitle">${escapeHtml(subtitle)}</p>
            ${legalNote ? `<p class="lp-promo-autohall__legal">${escapeHtml(legalNote)}</p>` : ''}
          </div>
          <div class="lp-promo-autohall__form-wrap">
            <div class="lp-promo-autohall__form-card">
              <h2 class="lp-promo-autohall__form-title">${escapeHtml(formTitle)}</h2>
              ${formSubtitle ? `<p class="lp-promo-autohall__form-subtitle">${escapeHtml(formSubtitle)}</p>` : ''}
              <form class="lp-lead-form lp-lead-form__form lp-promo-autohall__form" action="#" method="post" novalidate>
                ${requiredNoteHtml}
                <div class="lp-lead-form__grid">${fieldsHtml}</div>
                ${consentHtml}
                <p class="lp-lead-form__feedback" role="status" aria-live="polite"></p>
                <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit">${escapeHtml(submitText)}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}
