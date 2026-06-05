import { Prisma } from '@prisma/client';
import { buildLandingDocumentHtml } from '../landing-render/landing-document.builder';
import type { LandingRenderContext } from '../landing-render/render-asset.types';
import { getLandingPageStylesheet } from '../landing-render/landing-styles';

export type ExportBlock = {
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type ExportPageContext = {
  title: string;
  campaignName: string;
  brand: string;
};

export type ExportLandingConfig = {
  leadEndpoint: string;
  campaignId: string;
  landingPageId: string;
  pageVersionId: string;
  landingSlug: string;
};

export function buildLandingConfigJs(config: ExportLandingConfig): string {
  return `window.LANDING_CONFIG = ${JSON.stringify(config)};\n`;
}

export function buildIndexHtml(
  context: ExportPageContext,
  blocks: ExportBlock[],
  themeJson: Prisma.JsonValue | null = null,
  renderContext?: LandingRenderContext,
): string {
  return buildLandingDocumentHtml({
    shell: context,
    blocks,
    themeJson,
    includeScripts: true,
    stylesheetHref: 'assets/style.css',
    renderContext,
  });
}

export const STATIC_STYLE_CSS = getLandingPageStylesheet();

export const STATIC_LEAD_FORM_JS = `document.addEventListener('DOMContentLoaded', function () {
  console.log('[AutoHall] Landing page statique chargée');

  var config = window.LANDING_CONFIG || {};
  var leadForms = document.querySelectorAll('form.lp-lead-form');

  function showFeedback(form, message, type) {
    var node = form.querySelector('.lp-lead-form__feedback');
    if (!node) {
      alert(message);
      return;
    }
    node.textContent = message;
    node.className = 'lp-lead-form__feedback is-' + type;
  }

  function collectFormFields(form) {
    var fields = {};
    var elements = form.querySelectorAll('input, textarea, select');
    elements.forEach(function (el) {
      if (!el.name) return;
      fields[el.name] = el.value;
    });
    return fields;
  }

  leadForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!config.leadEndpoint) {
        showFeedback(
          form,
          "Configuration manquante : endpoint de collecte des leads.",
          'error',
        );
        return;
      }

      var fields = collectFormFields(form);
      var firstName = (fields.firstName || '').trim();
      var lastName = (fields.lastName || '').trim();
      var fullName = (fields.fullName || '').trim();
      if (!fullName && (firstName || lastName)) {
        fullName = (firstName + ' ' + lastName).trim();
      }
      var phone = (fields.phone || '').trim();
      var consent = form.querySelector('input[name="consent"]');

      if (consent && !consent.checked) {
        showFeedback(form, 'Veuillez accepter le traitement de vos données personnelles.', 'error');
        return;
      }

      if (!fullName || !phone) {
        showFeedback(form, 'Nom et téléphone sont obligatoires.', 'error');
        return;
      }

      var submitButton = form.querySelector('.lp-btn[type="submit"], .lp-lead-form .lp-btn--primary');
      if (submitButton) submitButton.disabled = true;
      showFeedback(form, 'Envoi en cours…', 'success');

      var body = {
        campaignId: config.campaignId,
        landingPageId: config.landingPageId,
        pageVersionId: config.pageVersionId,
        landingSlug: config.landingSlug,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: fields.email || undefined,
        vehicleModel: fields.vehicleModel || undefined,
        city: fields.city || undefined,
        message: fields.message || undefined,
        sourceUrl: window.location.href,
        rawPayload: fields,
        metadata: {
          userAgent: navigator.userAgent,
          submittedFrom: 'static-export',
        },
      };

      fetch(config.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then(function (response) {
          return response.json().then(function (payload) {
            return { ok: response.ok, payload: payload };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            var errMsg =
              (result.payload && result.payload.message) ||
              'Impossible d’envoyer votre demande.';
            throw new Error(errMsg);
          }
          showFeedback(
            form,
            (result.payload && result.payload.message) ||
              'Votre demande a bien été enregistrée. Un conseiller Auto Hall vous contactera.',
            'success',
          );
          form.reset();
        })
        .catch(function (err) {
          showFeedback(
            form,
            err.message || 'Erreur réseau lors de l’envoi du formulaire.',
            'error',
          );
        })
        .finally(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  });
});
`;

/** @deprecated Alias — préférer STATIC_LEAD_FORM_JS pour les exports studio. */
export const STATIC_MAIN_JS = STATIC_LEAD_FORM_JS;

export function buildExportFilename(slug: string, versionNumber: number): string {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `landing-${safeSlug || 'page'}-v${versionNumber}.zip`;
}
