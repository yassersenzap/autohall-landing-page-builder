/**
 * export-js.ts — Vanilla JS autonome pour la landing page exportée.
 * ES5-compatible. Aucune dépendance.
 * Fonctionnalités :
 *   - Navigation multi-étapes (data-step, data-next, data-back, data-submit)
 *   - Validation : required, email, téléphone marocain, checkbox
 *   - Soumission : DATABASE (POST /api/public/leads) | WEBHOOK | LOCAL (localStorage)
 *   - Popup de succès avec "Fermer" et "Nouvelle demande"
 *   - FAQ accordéon
 *   - Scroll animations (IntersectionObserver)
 *   - Smooth scroll
 */

export function generateExportJs(ctx: {
  apiBaseUrl: string;
  campaignId?: string;
  landingPageId?: string;
  pageVersionId?: string;
}): string {
  const apiBase   = JSON.stringify((ctx.apiBaseUrl ?? '').replace(/\/$/, ''));
  const campId    = JSON.stringify(ctx.campaignId    ?? '');
  const lpId      = JSON.stringify(ctx.landingPageId ?? '');
  const pvId      = JSON.stringify(ctx.pageVersionId ?? '');

  return `/* AutoHall Landing Studio — app.js | Généré automatiquement */
(function () {
  'use strict';

  var API_BASE    = ${apiBase};
  var CAMPAIGN_ID = ${campId};
  var LP_ID       = ${lpId};
  var PV_ID       = ${pvId};

  /* ─────────────────────────────────────────────────────────────────────────
     UTILITAIRES
  ───────────────────────────────────────────────────────────────────────── */

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getSourceUrl() {
    var url = window.location.href || '';
    // file:// n'est pas accepté par @IsUrl() — on utilise un placeholder HTTP reconnu
    if (!url || url.indexOf('file://') === 0 || url.indexOf('FILE://') === 0) {
      return 'http://offline-export.autohall.local';
    }
    return url;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     VALIDATION PAR ÉTAPE
  ───────────────────────────────────────────────────────────────────────── */

  var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  var PHONE_RE = /^(?:0[5-7]\\d{8}|\\+?212[\\s\\-]?[5-7]\\d{8})$/;

  function clearFieldError(field) {
    field.classList.remove('lp-field__input--error');
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    var prev = field.closest('.lp-field, label')
      ? field.closest('.lp-field, label').querySelector('.lp-field-err')
      : null;
    if (prev) prev.remove();
  }

  function setFieldError(field, message) {
    field.classList.add('lp-field__input--error');
    field.style.borderColor = '#ef4444';
    field.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
    var container = field.closest('.lp-field') || field.closest('label') || field.parentNode;
    if (!container) return;
    var err = document.createElement('div');
    err.className = 'lp-field-err';
    err.style.cssText = 'color:#ef4444;font-size:12px;margin-top:4px;font-weight:500;line-height:1.3;';
    err.textContent = message;
    container.appendChild(err);
  }

  function validateStep(stepEl) {
    if (!stepEl) return true;

    // Clear previous errors
    stepEl.querySelectorAll('.lp-field-err').forEach(function (el) { el.remove(); });
    stepEl.querySelectorAll('.lp-field__input--error').forEach(function (el) {
      el.classList.remove('lp-field__input--error');
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    });

    var valid = true;

    stepEl.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.name || el.disabled) return;

      var isRequired  = el.hasAttribute('required');
      var isCheckbox  = el.type === 'checkbox';
      var isEmail     = el.type === 'email' || el.name === 'email';
      var isPhone     = el.type === 'tel'   || el.name === 'phone' || el.name === 'tel';
      var val         = isCheckbox ? el.checked : (el.value || '').trim();
      var errorMsg    = '';

      if (isCheckbox) {
        if (isRequired && !el.checked) errorMsg = 'Ce consentement est obligatoire.';
      } else if (isRequired && !val) {
        errorMsg = 'Ce champ est obligatoire.';
      } else if (val && isEmail && !EMAIL_RE.test(val)) {
        errorMsg = 'Adresse email invalide.';
      } else if (val && isPhone) {
        var digits = val.replace(/[\\s\\-\\.]/g, '');
        if (!PHONE_RE.test(digits)) {
          errorMsg = 'T\\u00e9l\\u00e9phone invalide (ex\\u00a0: 0612345678 ou +212612345678).';
        }
      }

      if (errorMsg) {
        valid = false;
        setFieldError(el, errorMsg);
      }
    });

    return valid;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     COLLECTE DES CHAMPS
  ───────────────────────────────────────────────────────────────────────── */

  function collectAllFields(card) {
    var data = {};
    card.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.name || el.type === 'submit') return;
      data[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return data;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     POPUP DE SUCCÈS
  ───────────────────────────────────────────────────────────────────────── */

  function showSuccessPopup(card, resetCallback) {
    var successMsg = card.getAttribute('data-success-message')
      || 'Merci\\u00a0! Notre \\u00e9quipe vous contactera dans les 24 heures.';
    var redirectUrl = card.getAttribute('data-redirect-url') || '';

    // Remove existing popup if any
    var existing = document.getElementById('ah-success-overlay');
    if (existing) existing.remove();

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'ah-success-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:99999;',
      'background:rgba(0,0,0,0.55);',
      'display:flex;align-items:center;justify-content:center;',
      'animation:ahFadeIn 180ms ease;',
    ].join('');

    var popup = document.createElement('div');
    popup.style.cssText = [
      'background:#fff;border-radius:20px;padding:40px 32px;',
      'max-width:440px;width:calc(100% - 40px);text-align:center;',
      'box-shadow:0 24px 80px rgba(0,0,0,0.22);',
      'animation:ahSlideUp 220ms cubic-bezier(.22,1,.36,1);',
    ].join('');

    popup.innerHTML = [
      '<div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;margin:0 auto 20px;',
      'font-size:32px;color:#16a34a;">\\u2713</div>',
      '<h2 style="font-size:22px;font-weight:700;margin:0 0 10px;color:#111827;">Merci\\u00a0!</h2>',
      '<p style="color:#6b7280;margin:0 0 28px;line-height:1.6;font-size:15px;">' + escHtml(successMsg) + '</p>',
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">',
      '<button id="ah-btn-close" style="padding:11px 22px;border:1px solid #e5e7eb;background:#fff;',
      'border-radius:8px;cursor:pointer;font-size:14px;color:#374151;font-weight:500;">Fermer</button>',
      '<button id="ah-btn-retry" style="padding:11px 22px;background:#e85d04;color:#fff;border:none;',
      'border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Nouvelle demande</button>',
      '</div>',
    ].join('');

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Inject keyframes once
    if (!document.getElementById('ah-anim-style')) {
      var style = document.createElement('style');
      style.id = 'ah-anim-style';
      style.textContent = '@keyframes ahFadeIn{from{opacity:0}to{opacity:1}}@keyframes ahSlideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}';
      document.head.appendChild(style);
    }

    document.getElementById('ah-btn-close').addEventListener('click', function () {
      overlay.remove();
    });

    document.getElementById('ah-btn-retry').addEventListener('click', function () {
      overlay.remove();
      if (resetCallback) resetCallback();
    });

    // Close on overlay click (outside popup)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    // Redirect after success if configured
    if (redirectUrl) {
      setTimeout(function () { window.location.href = redirectUrl; }, 2500);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SOUMISSION DU LEAD
  ───────────────────────────────────────────────────────────────────────── */

  function buildLeadPayload(card, data) {
    var fullName = (
      data.fullName || data.name ||
      ((data.firstname || data.prenom || '') + ' ' + (data.lastname || data.nom || '')).trim()
    ).trim();
    var phone    = (data.phone || data.tel || '').trim();
    var campId   = card.getAttribute('data-campaign-id')   || CAMPAIGN_ID || '';
    var lpId     = card.getAttribute('data-landing-page-id') || LP_ID || '';

    var payload = {
      fullName:     fullName,
      phone:        phone,
      campaignId:   campId    || undefined,
      landingPageId: lpId     || undefined,
      pageVersionId: PV_ID   || undefined,
      email:        data.email || undefined,
      vehicleModel: data.model || data.vehicleModel || undefined,
      city:         data.city  || data.ville || undefined,
      message:      data.message || undefined,
      requestType:  'TEST_DRIVE',
      sourceUrl:    getSourceUrl(),
      rawPayload:   data,
    };

    // Strip empty / undefined values
    Object.keys(payload).forEach(function (k) {
      if (payload[k] === undefined || payload[k] === '' || payload[k] === null) {
        delete payload[k];
      }
    });

    return { payload: payload, fullName: fullName, phone: phone };
  }

  function showCardError(card, message) {
    var errEl = card.querySelector('[data-error]');
    if (!errEl) return;
    errEl.textContent = message;
    errEl.style.display = 'block';
    try { errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
  }

  function hideCardError(card) {
    var errEl = card.querySelector('[data-error]');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
  }

  function submitLead(card, btn, resetCallback) {
    var data         = collectAllFields(card);
    var built        = buildLeadPayload(card, data);
    var payload      = built.payload;
    var fullName     = built.fullName;
    var phone        = built.phone;

    var mode         = card.getAttribute('data-submission-mode') || 'DATABASE';
    var webhookUrl   = card.getAttribute('data-webhook-url') || '';
    var errorMsg     = card.getAttribute('data-error-message')   || "Erreur lors de l'envoi. Veuillez r\\u00e9essayer.";

    if (!fullName || !phone) {
      showCardError(card, 'Nom et t\\u00e9l\\u00e9phone sont obligatoires.');
      return;
    }

    // Disable submit button
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi\\u2026'; }
    hideCardError(card);

    function onSuccess() {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      showSuccessPopup(card, resetCallback);
    }

    function onError(msg) {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      console.error('[AutoHall] Lead submission error:', msg);
      showCardError(card, errorMsg + ' (' + msg + ')');
    }

    // ── LOCAL ──
    if (mode === 'LOCAL') {
      try {
        var prev = [];
        try { prev = JSON.parse(localStorage.getItem('ah_leads') || '[]'); } catch(e) {}
        prev.push(Object.assign({}, payload, { submittedAt: new Date().toISOString() }));
        localStorage.setItem('ah_leads', JSON.stringify(prev));
      } catch(e) { /* ignore */ }
      onSuccess();
      return;
    }

    // ── WEBHOOK ──
    var targetUrl = (mode === 'WEBHOOK' && webhookUrl)
      ? webhookUrl
      : (API_BASE + '/api/public/leads');

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
        onError(err.message || 'Erreur r\\u00e9seau');
      });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     FORMULAIRES MULTI-ÉTAPES
  ───────────────────────────────────────────────────────────────────────── */

  function initMultiForm(card) {
    var stepEls = Array.prototype.slice.call(card.querySelectorAll('[data-step]'));
    if (!stepEls.length) return;

    var accent  = card.getAttribute('data-accent') || '#e85d04';
    var current = 0;

    function updateDots(n) {
      card.querySelectorAll('[data-step-dot]').forEach(function (dot, i) {
        dot.style.background = i <= n ? accent : '#e5e7eb';
        dot.style.width      = i === n ? '12px' : '8px';
        dot.style.height     = i === n ? '12px' : '8px';
        dot.style.boxShadow  = i === n ? '0 0 0 3px ' + accent + '33' : 'none';
        dot.style.transition = 'all 200ms ease';
      });
    }

    function showStep(n) {
      n = Math.max(0, Math.min(n, stepEls.length - 1));
      stepEls.forEach(function (el, i) {
        if (i === n) {
          el.removeAttribute('hidden');
          el.style.display = '';
        } else {
          el.setAttribute('hidden', '');
          el.style.display = 'none';
        }
      });
      current = n;
      updateDots(n);
    }

    function resetCard() {
      card.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
      });
      card.querySelectorAll('.lp-field-err').forEach(function (el) { el.remove(); });
      card.querySelectorAll('.lp-field__input--error').forEach(function (el) {
        el.classList.remove('lp-field__input--error');
        el.style.borderColor = '';
        el.style.boxShadow   = '';
      });
      hideCardError(card);
      showStep(0);
    }

    // Next buttons
    card.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = stepEls[current];
        if (!validateStep(panel)) return;
        hideCardError(card);
        showStep(current + 1);
      });
    });

    // Back buttons
    card.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        hideCardError(card);
        showStep(current - 1);
      });
    });

    // Submit button (last step)
    card.querySelectorAll('[data-submit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = stepEls[current];
        if (!validateStep(panel)) return;
        submitLead(card, btn, resetCard);
      });
    });

    showStep(0);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     FORMULAIRES MONO-ÉTAPE
  ───────────────────────────────────────────────────────────────────────── */

  function initSingleForm(card) {
    function resetCard() {
      card.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
      });
      card.querySelectorAll('.lp-field-err').forEach(function (el) { el.remove(); });
      hideCardError(card);
    }

    card.querySelectorAll('[data-submit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(card)) return;
        submitLead(card, btn, resetCard);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     FAQ ACCORDÉON
  ───────────────────────────────────────────────────────────────────────── */

  function initFAQ() {
    var items = document.querySelectorAll('[data-faq-item]');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('[data-faq-toggle]');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.hasAttribute('data-open');
        items.forEach(function (other) {
          other.removeAttribute('data-open');
          var ans  = other.querySelector('[data-faq-answer]');
          var icon = other.querySelector('[data-faq-icon]');
          if (ans)  ans.style.display  = 'none';
          if (icon) icon.textContent   = '+';
        });
        if (!isOpen) {
          item.setAttribute('data-open', '');
          var ans  = item.querySelector('[data-faq-answer]');
          var icon = item.querySelector('[data-faq-icon]');
          if (ans)  ans.style.display  = 'block';
          if (icon) icon.textContent   = '\\u2212';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SCROLL ANIMATIONS
  ───────────────────────────────────────────────────────────────────────── */

  function initScrollAnimations() {
    if (!window.IntersectionObserver) return;
    var targets = document.querySelectorAll(
      '.lp-features__card,.lp-testimonial-card,.lp-gallery__item,.lp-faq__item,.lp-stats__item'
    );
    if (!targets.length) return;
    targets.forEach(function (el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 450ms ease, transform 450ms ease';
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { obs.observe(el); });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SMOOTH SCROLL
  ───────────────────────────────────────────────────────────────────────── */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash   = link.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

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

      var cid = form.getAttribute('data-campaign') || CAMPAIGN_ID || 'ford-promo';
      var lpid = form.getAttribute('data-lp') || LP_ID || '';
      
      function isUUID(str) {
        if (!str) return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      }
      
      var payload = {
        fullName:     fullName,
        phone:        phone,
        campaignId:   isUUID(cid)   ? cid       : undefined,
        landingPageId: isUUID(lpid)  ? lpid      : undefined,
        pageVersionId: isUUID(PV_ID) ? PV_ID     : undefined,
        email:        email     || undefined,
        city:         city      || undefined,
        sourceUrl:    getSourceUrl(),
        rawPayload:   data,
      };
      
      // Disable submit button
      var originalText = btn.textContent || '';
      btn.disabled = true;
      btn.textContent = 'Envoi\u2026';
      
      var errEl = form.querySelector('[data-error]');
      if (errEl) errEl.style.display = 'none';
      
      // Determine targets
      var apiBaseUrl = form.getAttribute('data-api') || API_BASE || '';
      var targetUrl = apiBaseUrl;
      if (targetUrl && !targetUrl.includes('/leads')) {
        targetUrl = targetUrl.replace(/\\/$/, '') + '/api/public/leads';
      }
      if (!targetUrl) {
        targetUrl = '/api/public/leads';
      }
      // If relative URL and origin exists, prepend it
      if (targetUrl.indexOf('/') === 0 && API_BASE) {
        targetUrl = API_BASE + targetUrl;
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
          errEl.textContent = 'Une erreur est survenue. Veuillez r\u00e9essayer. (' + msg + ')';
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
                onError(err.message || extErr.message || 'Erreur r\u00e9seau');
              });
          } else {
            // Fallback pipeline: Auto Hall CRM directly if configured
            var autoHallApiUrl = form.getAttribute('data-autohall-api');
            var syncToAutoHallBase = form.getAttribute('data-sync-autohall') === 'true';
            
            if (syncToAutoHallBase && autoHallApiUrl) {
              var extUrl = autoHallApiUrl;
              if (extUrl.indexOf('/') === 0 && API_BASE) extUrl = API_BASE + extUrl;
              
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
                  onError(err.message || extErr.message || 'Erreur r\u00e9seau');
                });
            } else {
              onError(err.message || 'Erreur r\u00e9seau');
            }
          }
        });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────────────── */

  function init() {
    document.querySelectorAll('[data-multi-form]').forEach(initMultiForm);
    document.querySelectorAll('[data-single-form]').forEach(initSingleForm);
    document.querySelectorAll('.lp-form').forEach(initFordForm);
    initFAQ();
    initScrollAnimations();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
`;
}
