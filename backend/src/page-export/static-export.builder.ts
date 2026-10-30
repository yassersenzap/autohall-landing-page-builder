import { Prisma } from '@prisma/client';
import { buildLandingDocumentHtml } from '../landing-render/landing-document.builder';
import type { LandingRenderContext } from '../landing-render/render-asset.types';
import { getLandingPageStylesheet } from '../landing-render/landing-styles';
import { renderAutohallCampaignFontsLinkTags } from '../landing-render/constants/autohall-campaign-fonts';
import { resolveLandingTheme } from '../landing-render/landing-theme';
import { escapeHtml } from '../landing-render/block-renderer';

export type ExportBlock = {
  blockType: string;
  sortOrder: number;
  propsJson: Prisma.JsonValue;
};

export type ExportPageContext = {
  title: string;
  campaignName: string;
  brand: string;
  /** Meta description injectée dans le <head> exporté/publié. */
  seoDescription?: string;
  /** Scripts personnalisés (GTM, Meta Pixel...) injectés tels quels dans le <head>. */
  headScripts?: string;
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
    stylesheetHref: 'css/style.css',
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

  var MOROCCO_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Meknès',
    'Tétouan', 'Salé', 'Béni Mellal', 'Berkane', 'Dakhla', 'El Jadida', 'Errachidia',
    'Kénitra', 'Nador', 'Safi', 'Settat', 'Khouribga', 'Mohammedia', 'Aït Melloul',
    'Laâyoune', 'Taroudant', 'Tiznit', 'Al Hoceima', 'Tifelt', 'Rommani', 'Karia', 'Tout le Maroc'
  ];

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
    var node = form.querySelector('.lp-submit-error');
    if (!node) {
      // Prefer the feedback node inside the currently visible step.
      var currentStepAttr = form.getAttribute('data-lp-current-step') || '1';
      var currentPanel = form.querySelector('[data-lp-form-step="' + currentStepAttr + '"]');
      node = (currentPanel && currentPanel.querySelector('.lp-lead-form__feedback')) ||
             form.querySelector('.lp-lead-form__feedback');
    }
    if (!node) return;
    node.textContent = message;
    node.style.display = message ? 'flex' : 'none';
    if (type === 'error') {
      node.style.color = '#ef4444';
      node.style.background = '#fff7f7';
      node.style.border = '1px solid #fecaca';
    } else {
      node.style.color = '#059669';
      node.style.background = '#ecfdf5';
      node.style.border = '1px solid #a7f3d0';
    }
  }

  function showSuccessState(form) {
    var stepper = form.closest('.hfr-card')?.querySelector('[data-lp-step-indicator]');
    if (stepper) stepper.style.display = 'none';

    var conf = form.querySelector('.hfr-confirmation');
    if (conf) {
      conf.style.display = 'flex';
      form.querySelectorAll('[data-lp-form-step]').forEach(function (stepEl) {
        stepEl.style.display = 'none';
      });
      var redirectUrl = form.getAttribute('data-redirect-url');
      if (redirectUrl) {
        setTimeout(function() {
          window.location.href = redirectUrl;
        }, 1500);
      }
    } else {
      form.innerHTML = ${JSON.stringify(LEAD_FORM_SUCCESS_HTML)};
      form.setAttribute('role', 'status');
      form.setAttribute('aria-live', 'polite');
    }
  }

  function collectFormFields(form) {
    var fields = {};
    var elements = form.querySelectorAll('input, textarea, select');
    elements.forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        fields[el.name] = el.checked;
      } else {
        fields[el.name] = el.value;
      }
    });
    return fields;
  }

  function validateStepPanel(panel) {
    if (!panel) return true;
    var inputs = panel.querySelectorAll('input, textarea, select');
    var isValid = true;

    panel.querySelectorAll('.hfr-error').forEach(function (err) { err.remove(); });
    panel.querySelectorAll('.hfr-field__input--error').forEach(function (el) {
      el.classList.remove('hfr-field__input--error');
    });

    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var val = (el.value || '').trim();
      var isFieldRequired = el.hasAttribute('required');
      var name = el.name || '';

      if (el.type === 'checkbox') {
        if (isFieldRequired && !el.checked) {
          isValid = false;
          el.classList.add('hfr-field__input--error');
          var errDiv = document.createElement('div');
          errDiv.className = 'hfr-error';
          errDiv.textContent = 'Ce consentement est obligatoire.';
          el.parentNode.appendChild(errDiv);
        }
        continue;
      }

      var isEmail = el.type === 'email' || name === 'email';
      var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

      var isPhone = el.type === 'tel' || name === 'phone' || name === 'telephone';
      var phoneRegex = /^(?:0|\\+212)[567]\\d{8}$/;

      var fieldError = '';

      if (isFieldRequired && !val) {
        fieldError = 'Ce champ est obligatoire.';
      } else if (val && isEmail && !emailRegex.test(val)) {
        fieldError = 'Adresse email invalide.';
      } else if (val && isPhone && !phoneRegex.test(val.replace(/\\s/g, ''))) {
        fieldError = 'Téléphone marocain invalide (Ex: 0612345678).';
      }

      if (fieldError) {
        isValid = false;
        el.classList.add('hfr-field__input--error');
        var errDiv = document.createElement('div');
        errDiv.className = 'hfr-error';
        errDiv.textContent = fieldError;
        var container = el.closest('.hfr-field') || el.parentNode;
        container.appendChild(errDiv);
      }
    }
    return isValid;
  }

  function updateStepIndicator(form, step, stepCount) {
    var stepperWrap = form.closest('.hfr-card')?.querySelector('[data-lp-step-indicator]');
    if (stepperWrap) {
      var dots = stepperWrap.querySelectorAll('[data-step-dot]');
      var lines = stepperWrap.querySelectorAll('[data-step-line]');
      
      dots.forEach(function (dot) {
        var dotIndex = parseInt(dot.getAttribute('data-step-dot'), 10);
        dot.className = 'hfr-stepper__dot';
        if (dotIndex === step - 1) {
          dot.classList.add('hfr-stepper__dot--active');
        } else if (dotIndex < step - 1) {
          dot.classList.add('hfr-stepper__dot--done');
        }
      });

      lines.forEach(function (line) {
        var lineIndex = parseInt(line.getAttribute('data-step-line'), 10);
        line.className = 'hfr-stepper__line';
        if (lineIndex <= step - 1) {
          line.classList.add('hfr-stepper__line--done');
        }
      });
    }

    var root = form.closest('.lp-core-campaign-landing__form-card');
    if (!root) return;
    var label = root.querySelector('[data-lp-step-label]');
    var progress = root.querySelector('[data-lp-step-progress]');
    if (label) label.textContent = 'Étape ' + step + '/' + stepCount;
    if (progress) progress.style.width = Math.round((step / stepCount) * 100) + '%';
  }

  function initCityCombobox(form) {
    var comboWraps = form.querySelectorAll('.hfr-city-combo');
    comboWraps.forEach(function (wrap) {
      var textInput = wrap.querySelector('.hfr-city-combo__input');
      var valueInput = wrap.querySelector('.hfr-city-combo__value');
      var listUl = wrap.querySelector('.hfr-city-combo__list');
      if (!textInput || !valueInput || !listUl) return;

      function renderList(filterText) {
        listUl.innerHTML = '';
        var search = (filterText || '').toLowerCase().trim();
        var matches = MOROCCO_CITIES.filter(function (city) {
          return city.toLowerCase().indexOf(search) !== -1;
        });

        if (matches.length === 0) {
          var li = document.createElement('li');
          li.className = 'hfr-city-combo__option';
          li.style.color = '#9ca3af';
          li.style.cursor = 'default';
          li.textContent = 'Aucune ville trouvée';
          listUl.appendChild(li);
        } else {
          matches.forEach(function (city) {
            var li = document.createElement('li');
            li.className = 'hfr-city-combo__option';
            li.textContent = city;
            if (valueInput.value === city) {
              li.classList.add('hfr-city-combo__option--selected');
            }
            li.addEventListener('click', function (e) {
              e.stopPropagation();
              textInput.value = city;
              valueInput.value = city;
              listUl.style.display = 'none';
              wrap.setAttribute('aria-expanded', 'false');
              var event = new Event('change', { bubbles: true });
              valueInput.dispatchEvent(event);
            });
            listUl.appendChild(li);
          });
        }
      }

      textInput.addEventListener('focus', function () {
        renderList(textInput.value);
        listUl.style.display = 'block';
        wrap.setAttribute('aria-expanded', 'true');
      });

      textInput.addEventListener('input', function () {
        renderList(textInput.value);
        listUl.style.display = 'block';
        wrap.setAttribute('aria-expanded', 'true');
      });

      document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) {
          listUl.style.display = 'none';
          wrap.setAttribute('aria-expanded', 'false');
          var typed = textInput.value.trim().toLowerCase();
          var matched = MOROCCO_CITIES.find(function (c) {
            return c.toLowerCase() === typed;
          });
          if (matched) {
            textInput.value = matched;
            valueInput.value = matched;
          } else if (valueInput.value) {
            var prev = MOROCCO_CITIES.find(function (c) {
              return c === valueInput.value;
            });
            textInput.value = prev || '';
          } else {
            textInput.value = '';
            valueInput.value = '';
          }
        }
      });
    });
  }

  function initMultiStepForm(form) {
    var stepCount = parseInt(form.getAttribute('data-lp-step-count') || '1', 10);
    if (stepCount <= 1) return;
    var steps = form.querySelectorAll('[data-lp-form-step]');
    if (!steps.length) return;

    var titlesAttr = form.getAttribute('data-lp-step-titles');
    var titles = [];
    try {
      if (titlesAttr) {
        titles = JSON.parse(titlesAttr);
      }
    } catch (e) {
      console.error('[AutoHall] Error parsing data-lp-step-titles', e);
    }

    function showStep(n) {
      steps.forEach(function (stepEl) {
        var idx = parseInt(stepEl.getAttribute('data-lp-form-step') || '1', 10);
        if (idx === n) {
          stepEl.removeAttribute('hidden');
          stepEl.style.opacity = '0';
          stepEl.style.transform = 'translateY(8px)';
          stepEl.style.transition = 'opacity 200ms ease, transform 200ms ease';
          void stepEl.offsetHeight;
          stepEl.style.opacity = '1';
          stepEl.style.transform = 'translateY(0)';
        } else {
          stepEl.setAttribute('hidden', '');
        }
      });
      form.setAttribute('data-lp-current-step', String(n));
      try { form.dispatchEvent(new CustomEvent('lead-form-step-changed', { bubbles: true, detail: { step: n } })); } catch(e) {}

      var titleEl = form.querySelector('.hfr-step-title');
      var descEl = form.querySelector('.hfr-step-desc');
      var stepConfig = titles[n - 1];
      if (stepConfig) {
        if (titleEl) titleEl.textContent = stepConfig.title || '';
        if (descEl) descEl.textContent = stepConfig.description || '';
      }

      updateStepIndicator(form, n, stepCount);
    }

    form.querySelectorAll('[data-lp-form-advance]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = parseInt(form.getAttribute('data-lp-current-step') || '1', 10);
        var panel = form.querySelector('[data-lp-form-step="' + current + '"]');
        if (!validateStepPanel(panel)) {
          showFeedback(form, 'Veuillez corriger les erreurs ci-dessus.', 'error');
          return;
        }
        showFeedback(form, '', 'success');
        showStep(Math.min(current + 1, stepCount));
      });
    });

    form.querySelectorAll('[data-lp-form-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = parseInt(form.getAttribute('data-lp-current-step') || '1', 10);
        showFeedback(form, '', 'success');
        showStep(Math.max(current - 1, 1));
      });
    });
  }

  leadForms.forEach(function (form) {
    initCityCombobox(form);
    initMultiStepForm(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var current = parseInt(form.getAttribute('data-lp-current-step') || '1', 10);
      var panel = form.querySelector('[data-lp-form-step="' + current + '"]');
      if (panel && !validateStepPanel(panel)) {
        showFeedback(form, 'Veuillez corriger les erreurs ci-dessus.', 'error');
        return;
      }

      var formDataAction = form.getAttribute('data-action');
      var leadEndpoint;
      if (formDataAction) {
        leadEndpoint = /^https?:\/\//i.test(formDataAction)
          ? formDataAction
          : ((config.apiBaseUrl || '').replace(/\/$/, '') + (formDataAction.charAt(0) === '/' ? formDataAction : '/' + formDataAction));
      } else {
        leadEndpoint = resolveLeadEndpoint(config);
      }
      if (!leadEndpoint) {
        showFeedback(form, "Configuration manquante : endpoint de collecte des leads.", 'error');
        return;
      }
      var fields = collectFormFields(form);

      // Semantic extraction: try common IDs, then fallback to DOM element type.
      // Handles preset field IDs (f_name, f_phone, …) as well as semantic ones.
      // NOTE: lastName/firstName cover the split-name layout used by default in core_campaign_form_landing.
      var NAME_IDS  = ['fullName', 'name', 'f_name', 'nom_complet', 'nom'];
      var PHONE_IDS = ['phone', 'tel', 'f_phone', 'telephone'];
      var EMAIL_IDS = ['email', 'f_email', 'mail'];
      var MODEL_IDS = ['model', 'vehicleModel', 'f_model', 'vehicule'];
      var CITY_IDS  = ['city', 'ville', 'f_city', 'concession'];
      var MSG_IDS   = ['message', 'f_message', 'msg'];
      var DATE_IDS  = ['preferredDate', 'f_date', 'testDate', 'date'];

      function findByIds(ids) {
        for (var _i = 0; _i < ids.length; _i++) {
          var v = (fields[ids[_i]] || '');
          if (v && typeof v === 'string' && v.trim()) return v.trim();
        }
        return '';
      }

      var fullName = findByIds(NAME_IDS);
      // Handle split-name layout (lastName + firstName fields generated by useSplitName:true).
      if (!fullName) {
        var firstName = (fields['firstName'] || fields['prenom'] || '').toString().trim();
        var lastName  = (fields['lastName']  || fields['nom']    || '').toString().trim();
        if (firstName || lastName) {
          fullName = (firstName + ' ' + lastName).trim();
        }
      }
      if (!fullName) {
        var nameEl = form.querySelector('input[type="text"][name*="name"], input[type="text"][name*="nom"]');
        if (nameEl && nameEl.value) fullName = nameEl.value.trim();
      }

      var phone = findByIds(PHONE_IDS);
      if (!phone) {
        var telEl = form.querySelector('input[type="tel"]');
        if (telEl && telEl.value) phone = telEl.value.trim();
      }

      var email = findByIds(EMAIL_IDS);
      if (!email) {
        var emailEl = form.querySelector('input[type="email"]');
        if (emailEl && emailEl.value) email = emailEl.value.trim();
      }

      var vehicleModel = findByIds(MODEL_IDS);
      var city = findByIds(CITY_IDS);
      var message = findByIds(MSG_IDS);
      var preferredDate = findByIds(DATE_IDS);
      if (!preferredDate) {
        var dateEl = form.querySelector('input[type="date"]');
        if (dateEl && dateEl.value) preferredDate = dateEl.value.trim();
      }

      if (!fullName || !phone) {
        showFeedback(form, 'Nom et téléphone sont obligatoires.', 'error');
        return;
      }

      var submitButton = form.querySelector('.hfr-btn[type="submit"], button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('hfr-btn--loading');
      }
      showFeedback(form, 'Envoi en cours…', 'success');

      var body = {
        campaignId: config.campaignId,
        landingPageId: config.landingPageId,
        pageVersionId: config.pageVersionId,
        landingSlug: config.landingSlug,
        fullName: fullName,
        phone: phone,
        email: email || undefined,
        vehicleModel: vehicleModel || undefined,
        city: city || undefined,
        message: message || undefined,
        preferredDate: preferredDate || undefined,
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
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('hfr-btn--loading');
          }
        });
    });
  });

  function initFordForm(form) {
    var btn = form.querySelector('[data-submit]');
    if (!btn) return;
    
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Validation
      if (!form.checkValidity()) {
        if (typeof form.reportValidity === 'function') {
          form.reportValidity();
        }
        return;
      }
      
      // Collect fields
      var data = {};
      var phone = '';
      var email = '';
      var city = '';
      var nom = '';
      var prenom = '';
      var fullName = '';

      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.name || el.type === 'submit') return;
        var val = el.type === 'checkbox' ? el.checked : el.value;
        data[el.name] = val;

        if (el.type === 'tel' || el.name === 'phone' || el.name === 'tel') {
          phone = val;
        } else if (el.type === 'email' || el.name === 'email') {
          email = val;
        } else if (el.name === 'city' || el.name === 'ville' || el.tagName.toLowerCase() === 'select') {
          city = val;
        } else if (el.name === 'nom' || el.name === 'lastName') {
          nom = val;
        } else if (el.name === 'prenom' || el.name === 'firstName') {
          prenom = val;
        } else if (el.name === 'fullName' || el.name === 'name') {
          fullName = val;
        }
      });

      if (!fullName) {
        fullName = ((prenom || '') + ' ' + (nom || '')).trim();
      }
      if (!fullName) {
        var textEl = form.querySelector('input[type="text"]');
        if (textEl) fullName = textEl.value;
      }

      var cid = form.getAttribute('data-campaign') || config.campaignId || 'ford-promo';
      var lpid = form.getAttribute('data-lp') || config.landingPageId || '';
      
      function isUUID(str) {
        if (!str) return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      }
      
      var payload = {
        fullName:     fullName,
        phone:        phone,
        campaignId:   isUUID(cid)   ? cid       : undefined,
        landingPageId: isUUID(lpid)  ? lpid      : undefined,
        pageVersionId: isUUID(config.pageVersionId) ? config.pageVersionId : undefined,
        email:        email     || undefined,
        city:         city      || undefined,
        sourceUrl:    resolveSourceUrl(),
        rawPayload:   data,
        metadata: {
          userAgent: navigator.userAgent,
          submittedFrom: 'static-export',
        },
      };
      
      // Disable submit button
      var originalText = btn.textContent || '';
      btn.disabled = true;
      btn.textContent = 'Envoi...';
      
      var errEl = form.querySelector('[data-error]');
      if (errEl) errEl.style.display = 'none';
      
      // Determine targets
      var apiBaseUrl = form.getAttribute('data-api') || config.apiBaseUrl || '';
      var targetUrl = apiBaseUrl;
      if (targetUrl && !targetUrl.includes('/leads')) {
        targetUrl = targetUrl.replace(/\\/$/, '') + '/api/public/leads';
      }
      if (!targetUrl) {
        targetUrl = '/api/public/leads';
      }
      if (targetUrl.indexOf('/') === 0 && config.apiBaseUrl) {
        targetUrl = config.apiBaseUrl + targetUrl;
      }
      
      function onSuccess() {
        btn.disabled = false;
        btn.textContent = originalText;
        var parentCol = form.closest('.fp-form-col');
        if (parentCol) {
          var successBox = parentCol.querySelector('[data-success]');
          var formContainer = parentCol.querySelector('[data-form-container]');
          if (successBox) successBox.style.display = 'flex';
          if (formContainer) formContainer.style.display = 'none';
        }
      }
      
      function onError(msg) {
        btn.disabled = false;
        btn.textContent = originalText;
        console.error('[AutoHall] Ford form submission error:', msg);
        if (errEl) {
          errEl.textContent = 'Une erreur est survenue. Veuillez réessayer. (' + msg + ')';
          errEl.style.display = 'block';
        }
      }
      
      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json()
            .then(function (body) { return { ok: r.ok, status: r.status, body: body }; })
            .catch(function ()    { return { ok: r.ok, status: r.status, body: {} }; });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.body && result.body.message) || 'HTTP ' + result.status);
          }
          onSuccess();
        })
        .catch(function (err) {
          // If we are in ford-promo, try submitting to https://fordpromo.myautohall.ma/js/Acontact.php via FormData!
          var isFord = form.closest('[data-block="ford-promo"]') !== null || cid === 'ford-promo';
          if (isFord) {
            var fd = new FormData();
            form.querySelectorAll('input, select, textarea').forEach(function (el) {
              if (!el.name || el.type === 'submit') return;
              fd.append(el.name, el.type === 'checkbox' ? (el.checked ? 'true' : '') : el.value);
            });
            fetch('https://fordpromo.myautohall.ma/js/Acontact.php', {
              method: 'POST',
              body: fd
            })
              .then(function (res) {
                if (res.ok) onSuccess();
                else throw new Error('CRM HTTP ' + res.status);
              })
              .catch(function (extErr) {
                onError(err.message || extErr.message || 'Erreur réseau');
              });
          } else {
            // Fallback pipeline: Auto Hall CRM directly if configured
            var autoHallApiUrl = form.getAttribute('data-autohall-api');
            var syncToAutoHallBase = form.getAttribute('data-sync-autohall') === 'true';
            
            if (syncToAutoHallBase && autoHallApiUrl) {
              var extUrl = autoHallApiUrl;
              if (extUrl.indexOf('/') === 0 && config.apiBaseUrl) extUrl = config.apiBaseUrl + extUrl;
              
              fetch(extUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source: 'Landing Page Builder',
                  capturedAt: new Date().toISOString(),
                  data: payload
                })
              })
                .then(function (extR) {
                  if (extR.ok) onSuccess();
                  else throw new Error('CRM HTTP ' + extR.status);
                })
                .catch(function (extErr) {
                  onError(err.message || extErr.message || 'Erreur réseau');
                });
            } else {
              onError(err.message || 'Erreur réseau');
            }
          }
        });
    });
  }

  document.querySelectorAll('.lp-form').forEach(initFordForm);
});`;

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

export function buildV4IndexHtml(
  context: ExportPageContext,
  compiledHtml: string,
  compiledCss: string,
  themeJson: Prisma.JsonValue | null = null,
  includeScripts = true,
  stylesheetHref?: string,
): string {
  const theme = resolveLandingTheme(themeJson);
  const stylesheet = stylesheetHref
    ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}" />`
    : '';

  const scripts = includeScripts
    ? `
  <script src="js/landing-config.js"></script>
  <script src="js/lead-form.js"></script>
  <script src="js/motion-runtime.js"></script>`
    : '';

  const description = context.seoDescription?.trim();
  const descriptionTag = description
    ? `\n  <meta name="description" content="${escapeHtml(description)}" />`
    : '';
  // Custom head scripts (GTM/Meta Pixel...) are the page owner's own trusted embed
  // code for their own published page — injected verbatim, same trust model as any
  // other page-builder "custom code" field.
  const headScripts = context.headScripts?.trim();
  const headScriptsBlock = headScripts ? `\n  ${headScripts}` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="${theme.mode === 'dark' ? 'dark light' : 'light dark'}" />
  <title>${escapeHtml(context.title)}</title>${descriptionTag}
  ${renderAutohallCampaignFontsLinkTags()}
  ${stylesheet}
  <style>
    ${compiledCss}
  </style>${headScriptsBlock}
</head>
<body>
  <article class="lp-document" data-theme="${theme.mode}" data-section-spacing="${theme.sectionSpacing}" data-heading-scale="${theme.headingScale}" data-button-style="${theme.buttonStyle}" style="${theme.cssVariables}">
    <main class="lp-page">
      ${compiledHtml}
    </main>
  </article>${scripts}
</body>
</html>
`;
}
