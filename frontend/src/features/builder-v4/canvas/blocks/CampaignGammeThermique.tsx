/**
 * CampaignGammeThermique.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout fidèle à la structure HTML de production Auto Hall :
 *   • 2 colonnes soudées sans marges blanches externes
 *   • Image gauche (cover, pleine hauteur)
 *   • Colonne droite = fond configurable, formulaire multi-étapes centré
 *   • Barre de progression animée + navigation fluide
 *   • Écran succès premium animé (identique Ford Promo)
 *   • Liaison temps réel panneau droit (couleur, arrondi, fond, modèles)
 */

import { useEffect, useState } from 'react';
import type { CampaignGammeThermiqueBlockProps } from '../../lib/pro-blocks';
import {
  CGT_COPY,
  CGT_FALLBACK_BANNER,
  openNativeDatePicker,
  resolveCgtProps,
  DEFAULT_CHERY_MODELS,
} from './campaign-gamme-thermique.shared';

const MOBILE_BREAKPOINT = 900;

type Step = 1 | 2 | 3 | 4;

export function CampaignGammeThermiqueBlock({
  props,
  editorMode = false,
}: {
  props: CampaignGammeThermiqueBlockProps;
  editorMode?: boolean;
}) {
  const cfg = resolveCgtProps(props);

  const [step, setStep]               = useState<Step>(1);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVille, setSelectedVille] = useState('');
  const [selectedDate, setSelectedDate]   = useState('');
  const [nom, setNom]                 = useState('');
  const [tel, setTel]                 = useState('');
  const [email, setEmail]             = useState('');
  const [triedStep1, setTriedStep1]   = useState(false);
  const [triedStep2, setTriedStep2]   = useState(false);
  const [triedStep3, setTriedStep3]   = useState(false);
  const [winW, setWinW]               = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );

  const fieldModele = cfg.fields.find(f => f.id === 'modele') || { label: 'Modèle', placeholder: '', required: true, active: true };
  const fieldVille  = cfg.fields.find(f => f.id === 'ville')  || { label: 'Ville', placeholder: '', required: true, active: true };
  const fieldDate   = cfg.fields.find(f => f.id === 'date')   || { label: 'Date', placeholder: '', required: true, active: true };
  const fieldNom    = cfg.fields.find(f => f.id === 'nom')    || { label: 'Nom', placeholder: 'Entrez votre nom', required: true, active: true };
  const fieldTel    = cfg.fields.find(f => f.id === 'tel')    || { label: 'Téléphone', placeholder: 'Entrez votre Téléphone', required: true, active: true };
  const fieldEmail  = cfg.fields.find(f => f.id === 'email')  || { label: 'Email', placeholder: 'Entrez votre adresse email', required: true, active: false };

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sync studio preview step
  useEffect(() => {
    if (editorMode && cfg.studioPreviewStep) setStep(cfg.studioPreviewStep);
  }, [editorMode, cfg.studioPreviewStep]);

  const isMobile = winW <= MOBILE_BREAKPOINT;

  // Progress bar percentages (25 / 50 / 75 / 100)
  const progressPct = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  // Validation
  const step1Valid = !fieldModele.active || !fieldModele.required || selectedModel.trim() !== '';
  const step2Valid =
    (!fieldVille.active || !fieldVille.required || selectedVille.trim() !== '') &&
    (!fieldDate.active || !fieldDate.required || selectedDate.trim() !== '');
  const nomValid   = !fieldNom.active || !fieldNom.required || nom.trim().length >= 2;
  const telValid   = !fieldTel.active || !fieldTel.required || /^0[5-7]\d{8}$/.test(tel.replace(/[\s-]/g, ''));
  const emailValid = !fieldEmail.active || !fieldEmail.required || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const step3Valid = nomValid && telValid && emailValid;

  // ── Border radius from props ─────────────────────────────────────────────
  const radiusMap: Record<string, string> = { none: '0px', md: '8px', lg: '12px' };
  const inputRadius = radiusMap[cfg.borderRadius ?? 'md'] ?? '8px';

  // ── Primary color & glow ─────────────────────────────────────────────────
  const primary = cfg.primary;
  const primaryGlow = `${primary}33`;
  const sReq: React.CSSProperties = { color: '#ef4444', marginLeft: 3 };

  // ── Background color with Opacity ────────────────────────────────────────
  const getRgba = (hex: string, op: number) => {
    if (!hex.startsWith('#')) return hex;
    const h = hex.slice(1);
    let r = 255, g = 255, b = 255;
    if (h.length === 3) {
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
    } else if (h.length === 6) {
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${op / 100})`;
  };
  const finalFormBgColor = getRgba(cfg.formBg, cfg.formBgOpacity ?? 100);

  // ── Navigation ─────────────────────────────────────────────────────────
  function nextStep1() {
    setTriedStep1(true);
    if (editorMode || step1Valid) setStep(2);
  }
  function nextStep2() {
    setTriedStep2(true);
    if (editorMode || step2Valid) setStep(3);
  }

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    setTriedStep3(true);
    if (editorMode) { setStep(4); return; }
    if (!step3Valid) return;
    try {
      await fetch(cfg.autoHallApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:      nom,
          phone:         tel,
          email:         fieldEmail.active ? email : undefined,
          vehicleModel:  selectedModel,
          city:          selectedVille,
          preferredDate: selectedDate || undefined,
          brand:         'Chery',
          requestType:   'TEST_DRIVE',
          rawPayload: {
            modele: selectedModel, ville: selectedVille,
            dateessai: selectedDate, nomprenom: nom, telephone: tel,
            email: fieldEmail.active ? email : undefined,
          },
        }),
      });
    } catch (err) {
      console.error('[CGT] Lead submission error:', err);
    }
    setStep(4);
  }



  // ── Micro-components ────────────────────────────────────────────────────
  const Err = ({ msg }: { msg: string }) => (
    <p style={{ fontSize: 11, color: '#ef4444', margin: '3px 0 0', lineHeight: 1.4 }}>{msg}</p>
  );

  const ChevSvg = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="M2 4l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const CalendarSvg = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  // ── Models list selection ────────────────────────────────────────────────
  const models = cfg.customizeVehicles ? (cfg.modelsList?.length ? cfg.modelsList : DEFAULT_CHERY_MODELS) : DEFAULT_CHERY_MODELS;

  // ── Keyframe and styles injection ───────────────────────────────────────
  const stylesInject = `
    .cgt-layout {
      display: flex;
      width: 100%;
      background: ${cfg.layoutBg};
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
      align-items: stretch;
    }
    .cgt-layout .image-container {
      flex: 1;
      height: 100%;
      background: ${cfg.layoutBg};
      overflow: hidden;
    }
    .cgt-layout .image-container img {
      width: 100%;
      height: 100%;
      object-fit: ${cfg.imageSizing};
      display: block;
    }
    .cgt-layout .form-wrapper {
      flex: 0 0 420px;
      width: 420px;
      display: flex;
      flex-direction: column;
      background: ${finalFormBgColor};
      box-sizing: border-box;
      padding: 32px 24px;
      justify-content: center;
      align-items: center;
      transition: background 250ms ease;
    }
    .cgt-layout .form_test_drive {
      width: 100%;
      max-width: 380px;
    }
    .cgt-layout .form-container {
      display: flex;
      flex-direction: column;
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0px;
      box-sizing: border-box;
      position: relative;
    }
    .cgt-layout .progress-bar-custom {
      height: 4px;
      width: 100%;
      background: #e2e8f0;
      border-radius: 2px;
      margin-bottom: 22px;
      overflow: hidden;
    }
    .cgt-layout .progress-fill {
      height: 100%;
      background: ${primary};
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .cgt-layout .step {
      display: none;
      flex-direction: column;
    }
    .cgt-layout .step.active {
      display: flex;
      animation: cgtFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .cgt-layout .step-header {
      margin-bottom: 18px;
    }
    .cgt-layout .step-number {
      color: ${primary};
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: 11px;
      font-weight: 800;
      margin: 0;
    }
    .cgt-layout .step-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 5px 0 0;
    }
    .cgt-layout .step-description {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
      line-height: 1.5;
    }
    .cgt-layout .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      display: block;
      margin-bottom: 6px;
    }
    .cgt-layout .form-select,
    .cgt-layout .form-control {
      display: block;
      width: 100%;
      padding: 12px 16px;
      font-size: 14px;
      color: #1e293b;
      background: #ffffff;
      border: 1.5px solid ${cfg.inputBorder};
      border-radius: ${inputRadius};
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      line-height: 1.5;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .cgt-layout .form-select {
      padding-right: 36px;
      appearance: none;
      -webkit-appearance: none;
    }
    .cgt-layout .form-select:focus,
    .cgt-layout .form-control:focus {
      border-color: ${primary};
      box-shadow: 0 0 0 3px ${primaryGlow};
    }
    .cgt-layout .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      border: none;
      border-radius: ${inputRadius};
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .cgt-layout .btn-primary {
      color: #ffffff;
      background: ${primary};
      box-shadow: 0 4px 12px ${primaryGlow};
    }
    .cgt-layout .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-0.5px);
    }
    .cgt-layout .btn-primary:active {
      transform: scale(0.975);
    }
    .cgt-layout .btn-secondary {
      color: #4b5563;
      background: transparent;
      border: 1.5px solid ${cfg.inputBorder};
    }
    .cgt-layout .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    .cgt-layout .btn-secondary:active {
      transform: scale(0.975);
    }
    .cgt-layout .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px 0 8px;
    }
    .cgt-layout .success-icon {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #22c55e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 16px;
      animation: cgtPulse 2.4s ease-in-out infinite;
    }
    .cgt-layout .success-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .cgt-layout .powered-by {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 20px;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    @keyframes cgtFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cgtPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    @media (max-width: 900px) {
      .cgt-layout {
        flex-direction: column !important;
        align-items: stretch;
      }
      .cgt-layout .image-container {
        flex: none;
        width: 100%;
        height: 280px;
      }
      .cgt-layout .form-wrapper {
        flex: none;
        width: 100%;
        padding: 24px 16px;
      }
      .cgt-layout .form-container {
        padding: 20px 16px;
      }
    }
  `;

  // aspect-ratio constraints
  const ASPECT_RATIO = '16 / 8.5';
  const SECTION_MIN_H = isMobile ? 280 : 540;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: stylesInject }} />

      <section
        className="cgt-layout layout autohall-campaign-block"
        data-testid="autohall-campaign-block"
        style={{
          aspectRatio: isMobile ? undefined : ASPECT_RATIO,
          minHeight: SECTION_MIN_H,
          flexDirection: cfg.formOnLeft ? 'row-reverse' : 'row',
        }}
      >
        {/* LEFT COLUMN: Visual */}
        <div className="image-container">
          <img
            src={cfg.imgUrl}
            alt={cfg.imgAlt}
            loading="lazy"
            onError={e => {
              const img = e.currentTarget;
              if (img.src !== CGT_FALLBACK_BANNER) img.src = CGT_FALLBACK_BANNER;
            }}
          />
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className={`form-wrapper ${cfg.formShadow ? 'shadow-2xl' : 'shadow-none'}`} style={{ background: finalFormBgColor }}>
          <div className="form_test_drive" id="form_test_drive">
            <div className="form-container">
              {/* Progress bar */}
              <div className="progress-bar-custom">
                <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
              </div>

              {/* Étape 1: Sélection du véhicule */}
              <div className={`step ${step === 1 ? 'active' : ''}`} id="step1">
                <div className="step-header">
                  <div className="step-number">Étape 1/3</div>
                  <div className="step-title">{cfg.step1Title}</div>
                  <div className="step-description">{CGT_COPY.step1Desc}</div>
                </div>
                <div className="step-content">
                  {fieldModele.active && (
                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">
                        {fieldModele.label} {fieldModele.required && <span style={sReq}>*</span>}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="testdrive_modele"
                          className="form-select"
                          value={selectedModel}
                          onChange={e => { setSelectedModel(e.target.value); setTriedStep1(false); }}
                          style={{ borderColor: triedStep1 && !step1Valid ? '#f87171' : undefined }}
                        >
                          <option value=""></option>
                          {models.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <ChevSvg />
                      </div>
                      {triedStep1 && !step1Valid && <Err msg="Veuillez sélectionner un modèle pour continuer." />}
                    </div>
                  )}
                  <button className="btn btn-primary formtestdrivenextstep" style={{ width: '100%' }} onClick={nextStep1}>
                    {cfg.btnNext}
                  </button>
                </div>
              </div>

              {/* Étape 2: Disponibilité */}
              <div className={`step ${step === 2 ? 'active' : ''}`} id="step2">
                <div className="step-header">
                  <div className="step-number">Étape 2/3</div>
                  <div className="step-title">{cfg.step2Title}</div>
                  <div className="step-description">{CGT_COPY.step2Desc}</div>
                </div>
                <div className="step-content">
                  {fieldVille.active && (
                    <div style={{ marginBottom: 12 }}>
                      <label className="form-label">
                        {fieldVille.label} {fieldVille.required && <span style={sReq}>*</span>}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="testdrive_ville"
                          className="form-select"
                          value={selectedVille}
                          onChange={e => { setSelectedVille(e.target.value); setTriedStep2(false); }}
                          style={{ borderColor: triedStep2 && !selectedVille && fieldVille.required ? '#f87171' : undefined }}
                        >
                          <option value=""></option>
                          {cfg.villesList.map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                        <ChevSvg />
                      </div>
                      {triedStep2 && !selectedVille && fieldVille.required && <Err msg="Veuillez choisir une ville." />}
                    </div>
                  )}
                  {fieldDate.active && (
                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">
                        {fieldDate.label} {fieldDate.required && <span style={sReq}>*</span>}
                      </label>
                      <div
                        className="autohall-campaign-block__date-wrap"
                        onClick={openNativeDatePicker}
                        style={{ position: 'relative', cursor: 'pointer' }}
                      >
                        <input
                          type="date"
                          id="testdrive_dateessai"
                          required={fieldDate.required}
                          className="form-control"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => { setSelectedDate(e.target.value); setTriedStep2(false); }}
                          style={{ borderColor: triedStep2 && !selectedDate && fieldDate.required ? '#f87171' : undefined, cursor: 'pointer', paddingRight: 36 }}
                        />
                        <CalendarSvg />
                      </div>
                      {triedStep2 && !selectedDate && fieldDate.required && <Err msg="Veuillez choisir une date." />}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary formtestdriveprevstep" style={{ flex: 1 }} onClick={() => setStep(1)}>
                      {cfg.btnBack}
                    </button>
                    <button className="btn btn-primary formtestdrivenextstep" style={{ flex: 2 }} onClick={nextStep2}>
                      {cfg.btnNext}
                    </button>
                  </div>
                </div>
              </div>

              {/* Étape 3: Informations personnelles */}
              <div className={`step ${step === 3 ? 'active' : ''}`} id="step3">
                <div className="step-header">
                  <div className="step-number">Étape 3/3</div>
                  <div className="step-title">{cfg.step3Title}</div>
                  <div className="step-description">{CGT_COPY.step3Desc}</div>
                </div>
                <div className="step-content">
                  <div style={{ display: 'contents' }}>
                    {fieldNom.active && (
                      <div style={{ marginBottom: 12 }}>
                        <label className="form-label">
                          {fieldNom.label} {fieldNom.required && <span style={sReq}>*</span>}
                        </label>
                        <input
                          type="text"
                          id="testdrive_nomprenom"
                          required={fieldNom.required}
                          placeholder={fieldNom.placeholder}
                          className="form-control"
                          value={nom}
                          onChange={e => { setNom(e.target.value); setTriedStep3(false); }}
                          style={{ borderColor: triedStep3 && !nomValid ? '#f87171' : undefined }}
                        />
                        {triedStep3 && !nomValid && <Err msg="Veuillez entrer un nom valide (min. 2 caractères)." />}
                      </div>
                    )}
                    {fieldTel.active && (
                      <div style={{ marginBottom: 16 }}>
                        <label className="form-label">
                          {fieldTel.label} {fieldTel.required && <span style={sReq}>*</span>}
                        </label>
                        <input
                          type="text"
                          id="testdrive_telephone"
                          required={fieldTel.required}
                          placeholder={fieldTel.placeholder}
                          className="form-control phone-number"
                          value={tel}
                          onChange={e => { setTel(e.target.value); setTriedStep3(false); }}
                          style={{ borderColor: triedStep3 && !telValid ? '#f87171' : undefined }}
                        />
                        {triedStep3 && !telValid && <Err msg="Format invalide — ex : 0612345678." />}
                      </div>
                    )}
                    {fieldEmail.active && (
                      <div style={{ marginBottom: 16 }}>
                        <label className="form-label">
                          {fieldEmail.label} {fieldEmail.required && <span style={sReq}>*</span>}
                        </label>
                        <input
                          type="text"
                          id="testdrive_email"
                          required={fieldEmail.required}
                          placeholder={fieldEmail.placeholder}
                          className="form-control"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setTriedStep3(false); }}
                          style={{ borderColor: triedStep3 && !emailValid ? '#f87171' : undefined }}
                        />
                        {triedStep3 && !emailValid && <Err msg="Veuillez entrer une adresse email valide." />}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-secondary formtestdriveprevstep" style={{ flex: 1 }} onClick={() => setStep(2)}>
                        {cfg.btnBack}
                      </button>
                      <button type="button" className="btn btn-primary formtestdrivenextstep" style={{ flex: 2 }} onClick={handleSubmit}>
                        {cfg.btnSubmit}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 4: Confirmation Épurée */}
              <div className={`step ${step === 4 ? 'active' : ''}`} id="step4">
                <div className="success-container">
                  <div className="success-icon">✓</div>
                  <div className="success-title">{CGT_COPY.successMessage}</div>

                  {editorMode && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep(1)}
                      style={{ marginTop: 12, padding: '6px 12px', fontSize: 12 }}
                    >
                      ↺ Réinitialiser (Aperçu)
                    </button>
                  )}
                </div>
              </div>

              <div className="powered-by">© 2026 Auto Hall</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
