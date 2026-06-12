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
  /** Base URL API absolue — fallback si leadEndpoint est relatif. */
  apiBaseUrl: string;
  campaignId: string;
  landingPageId: string;
  pageVersionId: string;
  landingSlug: string;
};

export function deriveApiBaseUrl(leadEndpoint: string): string {
  const normalized = leadEndpoint.replace(/\/$/, '');
  if (normalized.endsWith('/api/public/leads')) {
    return (
      normalized.slice(0, -'/api/public/leads'.length) ||
      'http://localhost:3000'
    );
  }
  return normalized.replace(/\/api\/.*$/, '') || 'http://localhost:3000';
}

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

/** Panneau de confirmation injecté dans le formulaire après soumission réussie. */
export const LEAD_FORM_SUCCESS_HTML = `
    <div class="flex flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full animate-in fade-in duration-500">
      <svg class="w-16 h-16 text-blue-600 dark:text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h3 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Demande envoyée avec succès</h3>
      <p class="text-neutral-500 dark:text-neutral-400">Un conseiller Auto Hall vous contactera dans les plus brefs délais.</p>
    </div>
  `.trim();

export const STATIC_LEAD_FORM_JS = `document.addEventListener('DOMContentLoaded', function () {
  console.log('[AutoHall] Landing page statique chargée');

  var config = window.LANDING_CONFIG || {};
  var leadForms = document.querySelectorAll('form.lp-lead-form');

  function resolveLeadEndpoint(cfg) {
    var endpoint = (cfg && cfg.leadEndpoint) || '';
    if (!endpoint) return '';
    if (/^https?:\\/\\//i.test(endpoint)) return endpoint;
    var base = ((cfg && cfg.apiBaseUrl) || 'http://localhost:3000').replace(/\\/$/, '');
    return base + (endpoint.charAt(0) === '/' ? endpoint : '/' + endpoint);
  }

  function resolveSourceUrl() {
    var currentUrl = window.location.href || '';
    if (currentUrl.indexOf('file://') === 0) {
      return 'http://offline-test.autohall.local';
    }
    return currentUrl || 'http://offline-test.autohall.local';
  }

  function showFeedback(form, message, type) {
    var node = form.querySelector('.lp-lead-form__feedback');
    if (!node) {
      alert(message);
      return;
    }
    node.textContent = message;
    node.className = 'lp-lead-form__feedback is-' + type;
  }

  function showSuccessState(form) {
    form.innerHTML = ${JSON.stringify(LEAD_FORM_SUCCESS_HTML)};
    form.setAttribute('role', 'status');
    form.setAttribute('aria-live', 'polite');
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

      var leadEndpoint = resolveLeadEndpoint(config);
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
        sourceUrl: resolveSourceUrl(),
        rawPayload: fields,
        metadata: {
          userAgent: navigator.userAgent,
          submittedFrom: 'static-export',
        },
      };

      fetch(leadEndpoint, {
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
          showSuccessState(form);
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

/** Runtime motion export-safe — IntersectionObserver + count-up (une seule inclusion). */
export const STATIC_MOTION_JS = `document.addEventListener('DOMContentLoaded', function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function activateMotion(node) {
    if (!node || node.classList.contains('lp-motion--in-view')) return;
    node.classList.add('lp-motion--in-view');
    var preset = node.getAttribute('data-lp-motion-preset');
    if (preset === 'stagger_children') {
      var children = node.querySelectorAll('.lp-motion__child');
      children.forEach(function (child, index) {
        child.style.transitionDelay = (index * 0.08) + 's';
        child.classList.add('lp-motion--in-view');
      });
    }
  }

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activateMotion(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    document.querySelectorAll('[data-lp-motion]').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('[data-lp-motion]').forEach(activateMotion);
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-lp-count-target') || '0');
    if (!target || Number.isNaN(target)) return;
    var prefix = el.getAttribute('data-lp-count-prefix') || '';
    var suffix = el.getAttribute('data-lp-count-suffix') || '';
    var duration = prefersReduced ? 0 : 1200;
    var start = performance.now();
    function frame(now) {
      var progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      var value = Math.round(target * progress);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll('[data-lp-count-up]').forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-lp-count-up]').forEach(function (el) {
      var target = el.getAttribute('data-lp-count-target') || '';
      var prefix = el.getAttribute('data-lp-count-prefix') || '';
      var suffix = el.getAttribute('data-lp-count-suffix') || '';
      el.textContent = prefix + target + suffix;
    });
  }
});
`;

/** @deprecated Alias — préférer STATIC_LEAD_FORM_JS pour les exports studio. */
export const STATIC_MAIN_JS = STATIC_LEAD_FORM_JS;

export function buildExportFilename(
  slug: string,
  versionNumber: number,
): string {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `landing-${safeSlug || 'page'}-v${versionNumber}.zip`;
}
