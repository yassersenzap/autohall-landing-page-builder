/**
 * TacticalFlashCampaign.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bloc standalone pour les campagnes Flash Promo type fordpromo.myautohall.ma.
 * Layout : grille 12 colonnes (image=8 | formulaire=4) — aucun Navbar/Footer.
 * La colonne gauche affiche une dropzone premium si aucune image n est uploadee.
 * Le formulaire capture : Civilite, Prenom, Nom, Telephone, Email, Ville
 * avec validation regex marocaine et clause RGPD loi 09-08.
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { TacticalFlashCampaignBlockProps } from '../../lib/pro-blocks';
import { AUTOHALL_RGPD_CLAUSE } from '../../lib/pro-blocks';
import { useBuilderV4Store } from '../../store/document.store';
import { getAutoHallBrand } from '@/config/brands';
import { isDarkColor } from '../../lib/color-utils';

// -- Types --------------------------------------------------------------------

interface FormState {
  civilite: 'M.' | 'Mme' | 'Mlle';
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  consent: boolean;
}

// -- Helpers ------------------------------------------------------------------

function fieldStyle(_dark: boolean, borderRadius: number, extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: '100%',
    height: 46,
    padding: '12px 16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius,
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#ffffff',
    fontWeight: 500,
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'Outfit', system-ui, sans-serif",
    transition: 'all 200ms ease-out',
    ...extra,
  };
}

function labelStyle(_dark?: boolean): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    marginBottom: 8,
    display: 'block',
  };
}

// -- Sub-Components -----------------------------------------------------------

interface CampaignBadgeProps {
  text?: string;
  primaryColor?: string;
}
function CampaignBadge({ text, primaryColor: _primaryColor }: CampaignBadgeProps) {
  if (!text) return null;
  return (
    <span
      className="tfc-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 16px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        background: 'rgba(255, 255, 255, 0.8)',
        color: '#0051a3',
        border: '1px solid rgba(0, 81, 163, 0.1)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        marginBottom: '8px',
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      {text}
    </span>
  );
}

interface CampaignPricingCardProps {
  priceValue?: string;
  priceLabel?: string;
  priceSuffix?: string;
  primaryColor: string;
}
function CampaignPricingCard({ priceValue, priceLabel, priceSuffix, primaryColor }: CampaignPricingCardProps) {
  if (!priceValue) return null;
  return (
    <div
      className="tfc-price-card"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        borderLeft: `4px solid ${primaryColor}`,
        marginTop: 4,
        transition: 'all 200ms ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {priceLabel && (
          <span style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 2
          }}>
            {priceLabel}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: primaryColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {priceValue}
          </span>
          {priceSuffix && (
            <span style={{ fontSize: 11, fontWeight: 800, color: primaryColor, textTransform: 'uppercase', lineHeight: 1 }}>
              {priceSuffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CampaignEmptyStateProps {
  primaryColor: string;
  borderRadius: string;
}
function CampaignEmptyState({ primaryColor, borderRadius }: CampaignEmptyStateProps) {
  return (
    <div
      className="tfc-empty-state-card"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 320,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1.5px dashed #cbd5e1',
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
      }} />
      
      <div style={{
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${primaryColor}0d 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      
      <div className="tfc-empty-state-icon-wrap" style={{
        width: 64,
        height: 64,
        borderRadius: 20,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px -4px rgba(148, 163, 184, 0.12)',
        marginBottom: 16,
        transition: 'all 300ms ease',
        position: 'relative',
        zIndex: 1,
      }}>
        <Icons.ImagePlus size={28} color={primaryColor} strokeWidth={1.5} />
      </div>
      
      <p style={{
        margin: '0 0 4px',
        fontSize: 14,
        fontWeight: 700,
        color: '#1e293b',
        textAlign: 'center',
        fontFamily: "var(--brand-font, 'Outfit', 'Inter', sans-serif)",
        position: 'relative',
        zIndex: 1,
      }}>
        Glisser-déposer le visuel de l'offre
      </p>
      
      <p style={{
        margin: '0 0 20px',
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        Format recommandé : Carré ou 4:3
      </p>
      
      <span className="tfc-empty-state-btn" style={{
        fontSize: 12,
        fontWeight: 600,
        color: primaryColor,
        border: `1.5px solid ${primaryColor}20`,
        borderRadius: 8,
        background: '#ffffff',
        padding: '6px 18px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        transition: 'all 200ms ease',
        position: 'relative',
        zIndex: 1,
      }}>
        Parcourir les médias
      </span>
    </div>
  );
}

interface CampaignMediaCardProps {
  imageUrl?: string | null;
  imageAlt?: string;
  imageFit?: string;
  visualFitMode?: string;
  maxHeight: string;
  maxVisualHeight?: number | string;
  borderRadius: string;
  primaryColor: string;
}
function CampaignMediaCard({
  imageUrl,
  imageAlt,
  imageFit,
  visualFitMode,
  maxHeight,
  maxVisualHeight,
  borderRadius,
  primaryColor
}: CampaignMediaCardProps) {
  if (!imageUrl) {
    return <CampaignEmptyState primaryColor={primaryColor} borderRadius={borderRadius} />;
  }
  const fitMode = visualFitMode || imageFit || 'cover';
  const isContain = fitMode === 'contain';
  const containerMaxH = maxVisualHeight ? `${maxVisualHeight}px` : (maxHeight || '600px');

  return (
    <div
      className="tfc-visual-container relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: containerMaxH,
        position: 'relative',
        overflow: 'hidden',
        borderRadius,
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        background: isContain ? '#09090b' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isContain && (
        <div
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
          className="tfc-visual-backdrop bg-cover bg-center"
        />
      )}
      <img
        src={imageUrl}
        alt={imageAlt || 'Visuel de campagne'}
        className="tfc-visual-img relative z-10"
        style={{
          objectFit: isContain ? ('contain' as any) : ('cover' as any),
          width: isContain ? 'auto' : '100%',
          height: isContain ? 'auto' : '100%',
          maxWidth: '100%',
          maxHeight: isContain ? containerMaxH : '100%',
          display: 'block',
          transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          borderRadius: isContain ? '0px' : borderRadius,
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}

// -- Component ----------------------------------------------------------------

export function TacticalFlashCampaignBlock({
  props,
}: {
  props: TacticalFlashCampaignBlockProps;
  editorMode?: boolean;
}) {
  const pageSelectedBrandId = useBuilderV4Store(s => s.document.meta?.selectedBrandId);
  const activeBrand = (props.brandKey && getAutoHallBrand(props.brandKey))
    || (pageSelectedBrandId ? getAutoHallBrand(pageSelectedBrandId) : null);

  const primaryColor   = activeBrand?.primaryColor   || props.colorPrimary   || '#0051a3';
  const secondaryColor = activeBrand?.secondaryColor || props.colorSecondary || '#1b7ac8';
  const bgSection      = props.colorBgSection || '#b1dbd8';
  const formBg         = (props.formBgColor && props.formBgColor !== '#ffffff' && props.formBgColor !== '#011625' && props.formBgColor !== '#00364b' && props.formBgColor !== '#011222' && props.formBgColor !== '#010b14' && props.formBgColor !== '#010b18' && props.formBgColor !== '#020c1b') ? props.formBgColor : '#030914';
  const formIsDark     = isDarkColor(formBg);
  const fieldInputClass = formIsDark ? 'tfc-field-input tfc-field-input--dark' : 'tfc-field-input';
  const radius         = props.borderRadius ?? 16;
  const villesList     = props.villesList;

  const imageRadiusMapped = props.imageRadius === 'none' ? '0px'
    : props.imageRadius === 'md' ? '8px'
    : props.imageRadius === 'lg' ? '8px'
    : props.imageRadius === 'xl' ? '12px'
    : props.imageRadius === '2xl' ? '16px'
    : props.imageRadius === '3xl' ? '24px'
    : props.imageRadius === 'full' ? '9999px'
    : '16px';

  const maxHVal = props.maxVisualHeight || props.imageMaxHeight || 360;
  const properties = {
    ...props,
    styles: {
      borderRadius: imageRadiusMapped,
      maxVisualHeight: `${maxHVal}px`,
    }
  };

  const [form, setForm] = useState<FormState>({
    civilite: 'M.',
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    ville: villesList?.[0] ?? '',
    consent: false,
  });

  const globalGap = typeof props.globalPadding === 'number' ? `${props.globalPadding}px` : (typeof props.sectionPadding === 'number' ? `${props.sectionPadding}px` : '32px');
  const paddingVal = typeof props.globalPadding === 'number' ? `${props.globalPadding}px 32px` : (typeof props.sectionPadding === 'number' ? `${props.sectionPadding}px 32px` : (props.sectionPadding === 'compact' ? '40px 32px' : props.sectionPadding === 'generous' ? '128px 32px' : '80px 32px'));

  // -- Main layout -------------------------------------------------------------

  return (
    <section
      className="tfc-section"
      style={{
        width: '100%',
        backgroundColor: bgSection,
        fontFamily: "var(--brand-font, 'Outfit', 'Inter', sans-serif)",
        minHeight: '100vh',
        padding: paddingVal,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
      }}
      data-block="tactical-flash-campaign"
    >
      <div
        className="tfc-grid-container"
        style={{
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          gap: globalGap,
        }}
      >
        {/* Left: 7/12 — Marketing copy + Promo visual */}
        <div
          className="tfc-marketing-col"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            boxSizing: 'border-box',
            gap: 24,
            width: '100%',
          }}
        >
          {!props.hideMarketingText && (props.badgeText || props.headline || props.description || props.priceValue) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, maxWidth: 640 }}>
              <CampaignBadge text={props.badgeText} primaryColor={primaryColor} />
              
              {props.headline && (
                <h1
                  className="font-black tracking-tighter text-[#00364b] leading-[1.1] text-5xl mb-6"
                  style={{
                    margin: '0 0 16px',
                    fontSize: '46px',
                    fontWeight: '900',
                    color: '#00364b',
                    letterSpacing: '-0.04em',
                    lineHeight: '1.1',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {props.headline}
                </h1>
              )}

              {props.description && (
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.625',
                  fontWeight: 400,
                  maxWidth: '576px',
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}>
                  {props.description}
                </p>
              )}

              <CampaignPricingCard
                priceValue={props.priceValue}
                priceLabel={props.priceLabel}
                priceSuffix={props.priceSuffix}
                primaryColor={primaryColor}
              />
            </div>
          )}

          <CampaignMediaCard
            imageUrl={props.promoImageUrl}
            imageAlt={props.promoImageAlt}
            imageFit={props.imageFit}
            visualFitMode={props.visualFitMode}
            maxHeight={properties.styles?.maxVisualHeight}
            maxVisualHeight={props.maxVisualHeight || props.imageMaxHeight}
            borderRadius={properties.styles?.borderRadius || '24px'}
            primaryColor={primaryColor}
          />
        </div>

        {/* Right: 5/12 — Compact form, floating card */}
        <div
          className="tfc-form-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <div
            className={['tfc-form-col bg-[#030914] border-[0.5px] border-white/[0.08] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl', formIsDark ? 'tfc-form-col--dark' : ''].filter(Boolean).join(' ')}
            style={{
              width: '100%',
              background: formBg,
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: `${radius}px`,
              boxSizing: 'border-box',
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
              ['--tfc-accent' as string]: props.colorAccent || primaryColor,
            }}
          >
            {/* Top accent bar — solid, flush with the card's top edge (clipped by overflow:hidden above) */}
            <div aria-hidden className="tfc-top-accent" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 4,
              background: '#1b7ac8',
              borderRadius: `${radius}px ${radius}px 0 0`,
            }} />

            {/* Form Container */}
            <form
              id="tfc-form-main"
              action="save_lead.php"
              method="POST"
              style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}
            >
              {props.brandLogoUrl && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
                  <img
                    src={props.brandLogoUrl}
                    alt="Logo marque"
                    style={{ maxHeight: 36, maxWidth: 120, objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              <h2 className="tfc-form-title" style={{
                display: 'block',
                margin: '0 0 4px',
                color: formIsDark ? '#ffffff' : '#18181b',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}>
                {props.formTitle || 'CONTACTEZ-MOI'}
              </h2>

              {/* Civilite + Prenom */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16, width: '100%' }}>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <label style={labelStyle(formIsDark)}>Civilite</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="civility"
                      className={fieldInputClass}
                      value={form.civilite}
                      onChange={e => setForm(f => ({ ...f, civilite: e.target.value as FormState['civilite'] }))}
                      style={{ ...fieldStyle(formIsDark, radius), appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
                    >
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                      <option value="Mlle">Mlle</option>
                    </select>
                    <Icons.ChevronDown size={13} color={formIsDark ? 'rgba(255, 255, 255, 0.5)' : '#71717a'} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  <label style={labelStyle(formIsDark)}>Prenom *</label>
                  <input
                    name="firstname"
                    className={fieldInputClass}
                    type="text"
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    placeholder="Prenom"
                    required
                    style={fieldStyle(formIsDark, radius)}
                  />
                </div>
              </div>

              {/* Nom */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <label style={labelStyle(formIsDark)}>Nom *</label>
                <input
                  name="lastname"
                  className={fieldInputClass}
                  type="text"
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Nom de famille"
                  required
                  style={fieldStyle(formIsDark, radius)}
                />
              </div>

              {/* Telephone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <label style={labelStyle(formIsDark)}>Telephone *</label>
                <input
                  name="phone"
                  className={fieldInputClass}
                  type="tel"
                  value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="ex : 06xxxxxxxx *"
                  maxLength={10}
                  pattern="0[1-9][0-9]{8}"
                  required
                  style={fieldStyle(formIsDark, radius)}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <label style={labelStyle(formIsDark)}>Email *</label>
                <input
                  name="email"
                  className={fieldInputClass}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="machine@gmail.com *"
                  required
                  style={fieldStyle(formIsDark, radius)}
                />
              </div>

              {/* Ville */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <label style={labelStyle(formIsDark)}>Ville *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="city"
                    className={fieldInputClass}
                    value={form.ville}
                    onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                    style={{ ...fieldStyle(formIsDark, radius), appearance: 'none', paddingRight: 28, cursor: 'pointer' }}
                  >
                    {villesList?.map((v: string, i: number) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                  <Icons.ChevronDown size={13} color={formIsDark ? 'rgba(255, 255, 255, 0.5)' : '#71717a'} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* RGPD */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
                <input
                  name="privacy"
                  type="checkbox"
                  id="tfc-consent"
                  checked={form.consent}
                  onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                  required
                  style={{ marginTop: 2, accentColor: props.colorAccent || secondaryColor, cursor: 'pointer', flexShrink: 0 }}
                />
                <label htmlFor="tfc-consent" style={{ fontSize: 11, color: formIsDark ? '#d4d4d8' : '#71717a', lineHeight: 1.625, cursor: 'pointer' }}>
                  {AUTOHALL_RGPD_CLAUSE}
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="tfc-submit-btn bg-[#1b7ac8] hover:bg-[#156cb4] text-white font-black py-4 px-8 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(27,122,200,0.3)] w-full flex items-center justify-center cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  background: props.colorAccent || secondaryColor || '#1b7ac8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: `${radius}px`,
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '16px 32px',
                  transition: 'all 300ms ease-out',
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  boxShadow: '0 10px 20px -5px rgba(27, 122, 200, 0.3)',
                  boxSizing: 'border-box',
                }}
              >
                {props.btnSubmitLabel || 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
