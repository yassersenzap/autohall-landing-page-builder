import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import type {
  BrandNavbarBlockProps,
  SpecsGridBlockProps,
  ModelShowcaseGalleryBlockProps,
  ConversionFormSplitBlockProps,
  HeroShowroomProps,
  HeroMosaicProps,
  HeroCinematicProps,
  HeroImmersiveFormProps,
  HeroConversionBaseProps,
  CarouselBlockProps,
  SpecsShowroomBlockProps,
  ContactSectionBlockProps,
  ContactFormField,
  ModelsGridBlockProps,
  FinitionOption,
  FinitionIconPresetKey,
  AlternatingShowcaseBlockProps,
} from '../../lib/pro-blocks';
import Carousel from '@/components/ui/carousel';
import { BRAND_THEME_PRESETS, DEFAULT_CONTACT_FIELDS, NEUTRAL_VEHICLE_PLACEHOLDER, AUTOHALL_RGPD_CLAUSE } from '../../lib/pro-blocks';
import { useBuilderV4Store } from '../../store/document.store';
import { apiRequest } from '@/lib/api';
import { getAutoHallBrand } from '@/config/brands';

/** Contexte de landing page courant (page-level, indépendant du bloc) — pilote le nombre d'étapes du formulaire Hero. */
function useLandingPageContext() {
  const landingPageType = useBuilderV4Store((s) => s.document.meta?.landingPageType) ?? 'brand';
  const selectedBrandId = useBuilderV4Store((s) => s.document.meta?.selectedBrandId);
  const selectedModelName = useBuilderV4Store((s) => s.document.meta?.selectedModelName);
  return { landingPageType, selectedBrandId, selectedModelName, isModelLanding: landingPageType === 'model' };
}

export function useActiveTheme() {
  const document = useBuilderV4Store(s => s.document);
  const brand = document.meta?.brandTheme || 'custom';
  const preset = BRAND_THEME_PRESETS[brand] || BRAND_THEME_PRESETS.custom;

  return {
    brand,
    primaryColor: document.meta?.customPrimaryColor || preset.primaryColor,
    secondaryColor: document.meta?.customSecondaryColor || preset.secondaryColor,
    buttonRadius: document.meta?.customButtonRadius || preset.buttonRadius,
    fontFamily: document.meta?.customFontFamily || preset.fontFamily,
    luxMode: preset.luxMode || false,
  };
}

const FONT = "var(--brand-font, 'Outfit', 'Inter', sans-serif)";

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const mdMatch = trimmed.match(/^\[.*\]\((.*)\)$/);
  if (mdMatch) {
    return mdMatch[1].trim();
  }
  return trimmed;
}

/**
 * Wordmark de secours (SVG inline, aucune requête réseau) affiché tant que le fichier logo réel
 * de la marque n'a pas été déposé dans `public/assets/logos/` — jamais d'URL de CDN externe devinée.
 */
function brandWordmarkPlaceholder(name: string, color: string): string {
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#111111';
  const label = (name || 'Marque').replace(/[<>&]/g, '');
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="48" viewBox="0 0 220 48">` +
        `<text x="0" y="33" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="${safeColor}">${label}</text>` +
        `</svg>`,
    )
  );
}

// Helper component to render Lucide icons dynamically
function DynIcon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const IconComp = (Icons as any)[name];
  if (!IconComp) {
    return <Icons.Star size={size} color={color} />;
  }
  return <IconComp size={size} color={color} />;
}

// --------------------------------------------------------------------------------
export function BrandNavbarBlock({ props }: { props: BrandNavbarBlockProps }) {
  const { selectedBrandId } = useLandingPageContext();
  const activeBrand = selectedBrandId ? getAutoHallBrand(selectedBrandId) : null;
  const navLinks = props.navLinks ?? props.links ?? [];
  const logoSrc =
    activeBrand?.logo ||
    props.brandLogo ||
    props.logoUrl ||
    props.logoSrc ||
    '/assets/frontend/images/logo-autohall-header.svg';
  const isSticky = props.sticky ?? true;
  const phoneNumber = props.phoneNumber ?? '0 800 09 28 28';
  const contactHref = props.contactHref ?? '/fr/contact';

  const contactLabel = props.contactLabel ?? 'Contact';
  const contactBgColor = props.contactBgColor ?? (activeBrand?.primaryColor || '#002c6c');
  const contactTextColor = props.contactTextColor ?? '#ffffff';

  const headerStyle: React.CSSProperties = {
    position: isSticky ? 'sticky' : 'relative',
    top: isSticky ? 0 : undefined,
    zIndex: 1000,
    width: '100%',
    height: 75,
    minHeight: 75,
    maxHeight: 75,
    background: '#ffffff',
    borderBottom: '1px solid #f2f2f2',
    fontFamily: FONT,
    padding: '0 24px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ah-nav-link {
          position: relative;
          font-size: 13.5px;
          font-weight: 500;
          color: #334155;
          text-decoration: none;
          padding: 6px 2px;
          white-space: nowrap;
          transition: color 250ms ease;
        }
        .ah-nav-link:hover { color: ${contactBgColor}; }
        .ah-nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: -2px;
          left: 0;
          background: ${contactBgColor};
          transform-origin: bottom right;
          transition: transform 250ms ease;
        }
        .ah-nav-link:hover::after { transform: scaleX(1); transform-origin: bottom left; }
        .ah-btn-phone {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 9999px;
          color: ${contactBgColor};
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 250ms ease;
          font-family: inherit;
          background: transparent;
        }
        .ah-btn-phone:hover {
          border-color: ${contactBgColor};
          background: #f0f4fb;
        }
        .ah-btn-phone svg {
          transition: transform 250ms ease;
        }
        .ah-btn-phone:hover svg {
          transform: scale(1.15) rotate(12deg);
        }
        .ah-btn-contact {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 20px;
          background: ${contactBgColor};
          border: 1px solid ${contactBgColor};
          border-radius: 4px;
          color: ${contactTextColor};
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 250ms ease;
          font-family: inherit;
          box-shadow: 0 2px 6px rgba(0, 44, 108, 0.18);
          letter-spacing: 0.01em;
        }
        .ah-btn-contact:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 44, 108, 0.28);
        }
        .ah-btn-contact:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 44, 108, 0.18);
        }
      `}} />
      {/* Sticky offset compensation: when sticky, the block takes up physical height
          so sections below are NOT hidden under the navbar */}
      <header style={headerStyle} data-block="brand-navbar">
        <div style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}>
          {/* Logo */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <img
              src={logoSrc}
              alt={props.altText || props.brand || 'Auto Hall'}
              style={{ height: '45px', maxHeight: '45px', objectFit: 'contain', display: 'block' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Nav links ? centred, fluid */}
          {navLinks.length > 0 && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {navLinks.map((link, i) => (
                <a key={link.id || i} href={link.href} className="ah-nav-link">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Right actions: phone + Contact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="ah-btn-phone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.82-.82a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {phoneNumber}
            </a>
            <a href={contactHref} className="ah-btn-contact">{contactLabel}</a>
          </div>
        </div>
      </header>
    </>
  );
}

export function SpecsGridBlock({ props }: { props: SpecsGridBlockProps }) {
  const specs = (props.specs ?? []).filter(s => !s.hidden);

  return (
    <section
      style={{
        width: '100%',
        background: '#ffffff',
        fontFamily: FONT,
        padding: '80px 5%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {props.title && (
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 800,
              color: '#0f172a',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              marginBottom: 48,
              margin: '0 0 48px',
            }}
          >
            {props.title}
          </h2>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
            gap: 24,
          }}
        >
          {specs.map((spec, i) => (
            <div
              key={i}
              style={{
                padding: '24px',
                borderRadius: 14,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'transform 200ms, box-shadow 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(40, 143, 227, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#288fe3',
                  flexShrink: 0,
                }}
              >
                <DynIcon name={spec.icon} size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {spec.label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {spec.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------------
// 4. IMMERSIVE GALLERY BLOCK
// --------------------------------------------------------------------------------

function GalleryLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: { src: string; alt: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const active = images[index];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  // Rendered via portal: the canvas has zoom/pan ancestors with a CSS transform,
  // which would otherwise turn `position: fixed` into "fixed to that ancestor"
  // instead of the viewport — clipping the overlay and letting the inspector
  // panel intercept clicks on the nav buttons.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        style={{ position: 'absolute', top: 20, right: 24, background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 8 }}
      >
        <Icons.X size={28} />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Photo précédente"
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icons.ChevronLeft size={24} />
        </button>
      )}

      <img
        src={active?.src}
        alt={active?.alt || `Photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4 }}
      />

      {images.length > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Photo suivante"
          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icons.ChevronRight size={24} />
        </button>
      )}

      <span style={{ color: '#ffffff', fontSize: 13, opacity: 0.8 }}>{index + 1} / {images.length}</span>
    </div>,
    document.body,
  );
}

function GalleryTile({ src, alt, onClick, className }: { src: string; alt: string; onClick: () => void; className: string }) {
  if (!src) {
    return (
      <div
        onClick={onClick}
        className={`${className} flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-slate-300 cursor-pointer`}
      >
        <Icons.ImageOff size={20} />
      </div>
    );
  }
  return <img src={src} alt={alt} onClick={onClick} className={`${className} cursor-pointer`} />;
}

export function ModelShowcaseGalleryBlock({ props }: { props: ModelShowcaseGalleryBlockProps }) {
  const fallbackMain = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80';
  const fallbackThumbs = [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'
  ];

  const mainSrc = (props.mainImage && props.mainImage !== NEUTRAL_VEHICLE_PLACEHOLDER)
    ? props.mainImage
    : fallbackMain;
  const mainAlt = props.mainImageAlt || 'Vue principale du véhicule';

  const images: { src: string; alt: string }[] = [{ src: mainSrc, alt: mainAlt }];

  const thumbKeys: ('thumbImage1' | 'thumbImage2' | 'thumbImage3' | 'thumbImage4')[] = [
    'thumbImage1',
    'thumbImage2',
    'thumbImage3',
    'thumbImage4'
  ];

  thumbKeys.forEach((key, idx) => {
    const val = props[key];
    const alt = props[`${key}Alt` as const] || `Détail du véhicule ${idx + 1}`;
    const src = (val && val !== NEUTRAL_VEHICLE_PLACEHOLDER) ? val : fallbackThumbs[idx];
    images.push({ src, alt });
  });

  const [main, ...rest] = images;
  const smallImages = rest.slice(0, 4);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Radius options mapping
  const radiusClass = {
    sm: 'rounded-md',
    md: 'rounded-xl',
    lg: 'rounded-3xl'
  }[props.borderRadius ?? 'md'] ?? 'rounded-xl';

  // Gap options mapping
  const gapClass = {
    compact: 'gap-1',
    standard: 'gap-2',
    large: 'gap-4'
  }[props.gap ?? 'standard'] ?? 'gap-2';

  const smallGridCols = smallImages.length >= 2 ? 'grid-cols-2' : 'grid-cols-1';
  const smallGridRows = smallImages.length >= 3 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <section
      className="w-full bg-white px-0 py-0 box-border animate-fade-in"
      style={{ fontFamily: FONT }}
    >
      <div className={`grid grid-cols-1 w-full ${gapClass} ${smallImages.length > 0 ? 'md:grid-cols-2' : ''}`}>
        {/* Main Large Image */}
        <div className={`relative overflow-hidden h-[300px] md:h-[480px] w-full ${radiusClass}`}>
          <GalleryTile
            src={main.src}
            alt={main.alt}
            className="w-full h-full object-cover block"
            onClick={() => setLightboxIndex(0)}
          />
          <button
            className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/70 hover:bg-black/85 text-white text-xs px-3 py-2 rounded font-medium border-none cursor-pointer transition-colors duration-200"
            type="button"
            onClick={() => setLightboxIndex(0)}
          >
            <Icons.LayoutGrid size={14} />
            {props.buttonText ?? 'Afficher toutes les photos'}
          </button>
        </div>

        {/* Asymmetric grid on the right — sized to however many secondary images exist (up to 4) */}
        {smallImages.length > 0 && (
          <div className={`grid ${smallGridCols} ${smallGridRows} ${gapClass} h-[300px] md:h-[480px] w-full`}>
            {smallImages.map((img: any, idx: number) => (
              <div key={idx} className={`relative overflow-hidden h-full w-full ${radiusClass}`}>
                <GalleryTile
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover block"
                  onClick={() => setLightboxIndex(idx + 1)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </section>
  );
}

// --------------------------------------------------------------------------------
// 5. CONVERSION FORM SPLIT BLOCK
// --------------------------------------------------------------------------------

export function ConversionFormSplitBlock({ props, editorMode = false }: { props: ConversionFormSplitBlockProps; editorMode?: boolean }) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const accent = props.accentColor ?? '#288fe3';

  // State to hold form inputs
  const [formData, setFormData] = useState({
    model: 'Finition Confort',
    city: 'Casablanca',
    date: '',
    name: '',
    phone: '',
    consent: false,
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editorMode) return;
    setSuccess(true);
  };

  const activeBenefits = (props.benefits ?? []).filter(b => b.enabled);

  return (
    <section
      style={{
        width: '100%',
        background: '#090d16',
        fontFamily: FONT,
        padding: '80px 5%',
        boxSizing: 'border-box',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {/* Left column - benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {props.benefitsTitle}
          </h2>

          {activeBenefits.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeBenefits.map(b => (
                <li key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(40, 143, 227, 0.15)',
                      border: `1.5px solid ${accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: accent,
                      flexShrink: 0,
                    }}
                  >
                    <Icons.Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 15, color: '#e2e8f0', fontWeight: 500, lineHeight: 1.4 }}>
                    {b.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.Shield size={16} color={accent} />
            {props.guaranteeText}
          </p>
        </div>

        {/* Right column - multi-step form */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: 20,
              padding: '32px 28px',
              color: '#0f172a',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              boxSizing: 'border-box',
            }}
          >
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#d1fae5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 24,
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Demande Envoyée !
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Merci pour votre demande. Un conseiller Auto Hall vous contactera sous 24 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stepper Dots */}
                <div style={{ display: 'flex', justifySelf: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: step === 1 ? accent : '#e2e8f0', transition: 'background 200ms' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: step === 2 ? accent : '#e2e8f0', transition: 'background 200ms' }} />
                </div>

                {step === 1 ? (
                  /* Step 1 Fields */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                      Étape 1/2 : Votre Projet
                    </h3>

                    {props.showModel && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Modèle Souhaité
                        </label>
                        <select
                          value={formData.model}
                          onChange={e => setFormData({ ...formData, model: e.target.value })}
                          style={{ height: 42, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                        >
                          <option value="Finition Confort">Finition Confort</option>
                          <option value="Finition Prestige">Finition Prestige</option>
                          <option value="Finition Sport">Finition Sport</option>
                        </select>
                      </div>
                    )}

                    {props.showCity && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Ville
                        </label>
                        <select
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          style={{ height: 42, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                        >
                          <option value="Casablanca">Casablanca</option>
                          <option value="Rabat">Rabat</option>
                          <option value="Marrakech">Marrakech</option>
                          <option value="Tanger">Tanger</option>
                          <option value="Agadir">Agadir</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={nextStep}
                      style={{
                        height: 48, background: accent, color: '#ffffff', border: 'none', borderRadius: 10,
                        fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 10, fontFamily: FONT,
                      }}
                    >
                      Continuer →
                    </button>
                  </div>
                ) : (
                  /* Step 2 Fields */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                      Étape 2/2 : Coordonnées
                    </h3>

                    {props.showDate && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Date souhaitée d'essai
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          style={{ height: 42, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', fontFamily: FONT }}
                        />
                      </div>
                    )}

                    {props.showName && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Nom Complet
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Yasser Benali"
                          required
                          style={{ height: 42, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                        />
                      </div>
                    )}

                    {props.showPhone && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="06 00 00 00 00"
                          required
                          style={{ height: 42, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '4px 0' }}>
                      <input
                        type="checkbox"
                        required
                        checked={formData.consent}
                        onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                        style={{ marginTop: 2, accentColor: accent, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                        {props.gdprConsent || "J'accepte d'être contacté par Auto Hall pour cette offre exclusive."}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={prevStep}
                        style={{
                          height: 48, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10,
                          fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: '0 20px', fontFamily: FONT,
                        }}
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        style={{
                          height: 48, background: accent, color: '#ffffff', border: 'none', borderRadius: 10,
                          fontWeight: 700, fontSize: 14, cursor: 'pointer', flex: 1, fontFamily: FONT,
                        }}
                      >
                        {props.ctaLabel || 'Valider'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildHeroFormStyles(colorPrimary: string, borderRadiusStyle: string, darkTheme: boolean): string {
  const inputBorder = darkTheme ? 'rgba(255,255,255,0.18)' : '#e2e8f0';
  const inputBg = darkTheme ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const inputColor = darkTheme ? '#ffffff' : '#0f172a';
  const inputFocusShadow = darkTheme ? '0 0 0 2px rgba(255,255,255,0.12)' : `0 0 0 2px ${colorPrimary}20`;
  const secondaryBg = darkTheme ? 'rgba(255,255,255,0.1)' : '#f1f5f9';
  const secondaryColor = darkTheme ? '#ffffff' : '#475569';
  const secondaryHover = darkTheme ? 'rgba(255,255,255,0.16)' : '#e2e8f0';

  return `
    .luxury-field-container { display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box; }
    .luxury-input-field { height: 44px; padding: 0 14px; border: 1px solid ${inputBorder}; border-radius: ${borderRadiusStyle}; font-size: 14px; color: ${inputColor}; background-color: ${inputBg}; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
    .luxury-input-field::placeholder { color: ${darkTheme ? 'rgba(255,255,255,0.35)' : '#94a3b8'}; }
    .luxury-input-field:focus { border-color: ${darkTheme ? 'rgba(255,255,255,0.45)' : colorPrimary}; box-shadow: ${inputFocusShadow}; ${darkTheme ? 'background-color: rgba(255,255,255,0.12);' : ''} }
    .luxury-select-field-wrapper { position: relative; width: 100%; box-sizing: border-box; }
    .luxury-select-field { appearance: none; -webkit-appearance: none; height: 44px; padding: 0 14px; padding-right: 36px; border: 1px solid ${inputBorder}; border-radius: ${borderRadiusStyle}; font-size: 14px; color: ${inputColor}; background-color: ${inputBg}; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .luxury-select-field option { color: #0f172a; background: #ffffff; }
    .luxury-select-field:focus { border-color: ${darkTheme ? 'rgba(255,255,255,0.45)' : colorPrimary}; box-shadow: ${inputFocusShadow}; }
    .luxury-select-field-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: ${darkTheme ? 'rgba(255,255,255,0.45)' : '#94a3b8'}; display: flex; align-items: center; justify-content: center; }
    .luxury-btn-primary { display: inline-flex; align-items: center; justify-content: center; height: 44px; background: ${colorPrimary}; color: #ffffff; border: none; border-radius: ${borderRadiusStyle}; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.06); font-family: inherit; transition: opacity 0.2s ease, transform 0.15s ease; width: 100%; }
    .luxury-btn-primary:hover { opacity: 0.92; }
    .luxury-btn-primary:active { transform: scale(0.98); }
    .luxury-btn-secondary { display: inline-flex; align-items: center; justify-content: center; height: 44px; background: ${secondaryBg}; color: ${secondaryColor}; border: none; border-radius: ${borderRadiusStyle}; font-weight: 600; font-size: 14px; padding: 0 18px; cursor: pointer; font-family: inherit; transition: background-color 0.2s ease; }
    .luxury-btn-secondary:hover { background-color: ${secondaryHover}; }
  `;
}

function HeroFormCard({
  props,
  editorMode,
  colorPrimary,
  borderRadiusButtons,
  darkTheme = false,
  cardStyle,
}: {
  props: HeroConversionBaseProps;
  editorMode: boolean;
  colorPrimary: string;
  borderRadiusButtons: number;
  darkTheme?: boolean;
  cardStyle?: React.CSSProperties;
}) {
  const cardBorderRadius = Math.min(24, borderRadiusButtons + 6);

  return (
    <div style={{
      width: '100%',
      maxWidth: 420,
      background: darkTheme ? 'rgba(15, 23, 42, 0.55)' : '#ffffff',
      backdropFilter: darkTheme ? 'blur(12px)' : undefined,
      WebkitBackdropFilter: darkTheme ? 'blur(12px)' : undefined,
      borderRadius: `${cardBorderRadius}px`,
      boxShadow: darkTheme
        ? '0 8px 32px rgba(0,0,0,0.24)'
        : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: darkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
      boxSizing: 'border-box',
      ...cardStyle,
    }}>
      {props.formMode === 'multi-step' && (
        <div style={{ width: '100%', height: 3, background: darkTheme ? 'rgba(255,255,255,0.12)' : '#e2e8f0', position: 'relative' }}>
          <div
            style={{
              width: `${((editorMode ? props.studioPreviewStep : 1) / 3) * 100}%`,
              height: '100%',
              background: darkTheme ? '#ffffff' : colorPrimary,
              transition: 'width 250ms ease',
            }}
          />
        </div>
      )}
      <FormCardContent props={props} editorMode={editorMode} darkTheme={darkTheme} />
    </div>
  );
}

export function FormCardContent({
  props,
  editorMode,
  darkTheme = false,
}: {
  props: HeroConversionBaseProps;
  editorMode: boolean;
  darkTheme?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    civilite: 'M.',
    prenom: '',
    name: '',
    email: '',
    phone: '',
    model: props.modelsList?.[0] ?? '',
    city: props.villesList?.[0] ?? '',
    date: '',
    consent: false,
  });

  const activeStep = editorMode ? props.studioPreviewStep : currentStep;
  const isMultiStep = props.formMode === 'multi-step';

  const handleNext = async () => {
    if (isMultiStep && activeStep < 3) {
      setCurrentStep(activeStep + 1);
    } else {
      if (editorMode) return;
      
      // Validation for direct fields
      if (!isMultiStep) {
        if (!formData.prenom || !formData.name || !formData.phone || !formData.email) {
          alert("Veuillez remplir tous les champs obligatoires (*).");
          return;
        }
        if (!/^0[1-9][0-9]{8}$/.test(formData.phone.replace(/[\s\-]/g, ''))) {
          alert("Veuillez saisir un numéro de téléphone marocain valide (ex: 0612345678).");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          alert("Veuillez saisir une adresse email valide.");
          return;
        }
      } else {
        if (!formData.name || !formData.phone) {
          alert("Veuillez remplir votre nom et numéro de téléphone.");
          return;
        }
      }

      if (!formData.consent) {
        alert("Veuillez accepter les conditions de confidentialité (RGPD).");
        return;
      }
      
      try {
        const campaignId = useBuilderV4Store.getState().campaignId;
        const landingPageId = useBuilderV4Store.getState().landingPageId;
        const pageVersionId = useBuilderV4Store.getState().pageVersionId;
        
        const payload = {
          campaignId: campaignId || undefined,
          landingPageId: landingPageId || undefined,
          pageVersionId: pageVersionId || undefined,
          fullName: isMultiStep ? formData.name : `${formData.civilite} ${formData.prenom} ${formData.name}`.trim(),
          phone: formData.phone,
          email: isMultiStep ? undefined : (formData.email || undefined),
          vehicleModel: formData.model || undefined,
          city: formData.city || undefined,
          message: undefined,
          preferredDate: formData.date || undefined,
          requestType: 'TEST_DRIVE' as const,
          sourceUrl: window.location.href,
          rawPayload: formData,
        };

        // Pipeline 1: Local / Database Save
        try {
          const prevLeads = JSON.parse(localStorage.getItem('ah_leads') ?? '[]');
          localStorage.setItem('ah_leads', JSON.stringify([...prevLeads, { ...payload, submittedAt: new Date().toISOString() }]));
        } catch (e) {
          console.error("Local storage lead save error", e);
        }

        try {
          await apiRequest('/api/public/leads', {
            method: 'POST',
            body: payload,
            auth: false
          });
        } catch (e) {
          console.error("Database lead submission error", e);
        }

        // Pipeline 2: External Webhook (Webhook Synchro Auto Hall)
        if (props.syncToAutoHallBase && props.autoHallApiUrl) {
          try {
            await fetch(props.autoHallApiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch (e) {
            console.error("Auto Hall Webhook Synchro Failure", e);
          }
        }

        setSuccess(true);
      } catch (err) {
        console.error("Submission pipeline error:", err);
        alert("Une erreur s'est produite lors de l'envoi de votre demande.");
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setCurrentStep(activeStep - 1);
    }
  };

  const handleDotClick = (stepVal: number) => {
    setCurrentStep(stepVal);
  };

  const {
    colorPrimary = '#005bc4',
    step1Title = 'Sélectionnez le véhicule',
    step2Title = 'Disponibilité',
    step3Title = 'Coordonnées',
    btnNextLabel = 'Suivant',
    btnBackLabel = 'Retour',
    btnSubmitLabel = 'Valider',
    singleStepTitle = 'Demande de rappel rapide',
  } = props;

  const dotColor = darkTheme ? '#ffffff' : colorPrimary;

  // Theme-based coloring
  const textColor = darkTheme ? '#ffffff' : '#0f172a';
  const labelColor = darkTheme ? 'rgba(255,255,255,0.7)' : '#475569';
  const subtextColor = darkTheme ? 'rgba(255,255,255,0.5)' : '#64748b';
  const successTitleColor = darkTheme ? '#ffffff' : '#1e3a5f';
  const successCardBg = darkTheme ? 'rgba(255,255,255,0.06)' : '#f8fafc';
  const successCardLabel = darkTheme ? 'rgba(255,255,255,0.6)' : '#64748b';
  const successCardValue = darkTheme ? '#ffffff' : '#0f172a';
  const stepTitleColor = darkTheme ? 'rgba(255,255,255,0.7)' : '#475569';
  const stepDotBg = darkTheme ? 'rgba(255,255,255,0.2)' : '#cbd5e1';

  return (
    <div style={{ padding: '20px 22px', color: textColor, display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', minHeight: 'auto' }}>
      {success ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ width: 52, height: 52, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="52" height="52" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="20" stroke={colorPrimary} strokeWidth="2" fill="none"/>
              <path d="M20 28l6 6 10-10" stroke={colorPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontWeight: 600, color: successTitleColor, fontSize: 14, margin: '0 0 14px', lineHeight: 1.6, padding: '0 4px' }}>
            Notre équipe Auto Hall prendra contact avec vous dans les plus brefs délais.
          </p>
          <div style={{ background: successCardBg, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, textAlign: 'left' }}>
            {formData.model ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: successCardLabel }}>Modèle :</span>
                <span style={{ fontWeight: 600, color: successCardValue }}>{formData.model}</span>
              </div>
            ) : null}
            {formData.city ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: successCardLabel }}>Ville :</span>
                <span style={{ fontWeight: 600, color: successCardValue }}>{formData.city}</span>
              </div>
            ) : null}
          </div>
          <p style={{ fontSize: 11, color: subtextColor, margin: 0 }}>© {new Date().getFullYear()} Auto Hall</p>
        </div>
      ) : (
        <div>
          {isMultiStep ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: stepTitleColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Étape {activeStep}/3</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3].map((stepVal) => (
                    <span
                      key={stepVal}
                      onClick={() => handleDotClick(stepVal)}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: activeStep === stepVal ? dotColor : stepDotBg,
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                    />
                  ))}
                </div>
              </div>
              {activeStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: textColor, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>{step1Title}</h3>
                  <div className="luxury-field-container">
                    <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Modèle</label>
                    <div className="luxury-select-field-wrapper">
                      <select value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="luxury-select-field">
                        {props.modelsList?.map((m: string, idx: number) => <option key={idx} value={m}>{m}</option>)}
                      </select>
                      <div className="luxury-select-field-arrow">
                        <Icons.ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleNext} className="luxury-btn-primary" style={{ background: dotColor }}>{btnNextLabel}</button>
                </div>
              )}
              {activeStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: textColor, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>{step2Title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="luxury-field-container">
                      <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ville</label>
                      <div className="luxury-select-field-wrapper">
                        <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="luxury-select-field">
                          {props.villesList?.map((v: string, idx: number) => <option key={idx} value={v}>{v}</option>)}
                        </select>
                        <div className="luxury-select-field-arrow">
                          <Icons.ChevronDown size={16} />
                        </div>
                      </div>
                    </div>
                    <div className="luxury-field-container">
                      <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</label>
                      <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="luxury-input-field" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={handlePrev} className="luxury-btn-secondary">{btnBackLabel}</button>
                    <button type="button" onClick={handleNext} className="luxury-btn-primary" style={{ flex: 1, background: dotColor }}>{btnNextLabel}</button>
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: textColor, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>{step3Title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="luxury-field-container">
                      <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nom complet *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Entrez votre nom" required className="luxury-input-field" />
                    </div>
                    <div className="luxury-field-container">
                      <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Téléphone *</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="06 00 00 00 00" required className="luxury-input-field" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '2px 0' }}>
                    <input type="checkbox" required checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} style={{ marginTop: 2, accentColor: dotColor, cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontSize: 9.5, color: subtextColor, lineHeight: 1.5 }}>{AUTOHALL_RGPD_CLAUSE}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={handlePrev} className="luxury-btn-secondary">{btnBackLabel}</button>
                    <button
                      type="submit"
                      onClick={handleNext}
                      className="luxury-btn-primary"
                      disabled={!formData.consent}
                      style={{
                        flex: 1,
                        background: dotColor,
                        opacity: formData.consent ? 1 : 0.45,
                        cursor: formData.consent ? 'pointer' : 'not-allowed',
                        transition: 'opacity 200ms',
                      }}
                    >{btnSubmitLabel}</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: textColor, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>{singleStepTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* Civilité & Prénom in flex row */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="luxury-field-container" style={{ width: 80, flexShrink: 0 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Civilité</label>
                    <div className="luxury-select-field-wrapper">
                      <select value={formData.civilite} onChange={e => setFormData({ ...formData, civilite: e.target.value })} className="luxury-select-field">
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                        <option value="Mlle">Mlle</option>
                      </select>
                      <div className="luxury-select-field-arrow">
                        <Icons.ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="luxury-field-container" style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prénom *</label>
                    <input type="text" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} placeholder="Prénom" required className="luxury-input-field" />
                  </div>
                </div>

                <div className="luxury-field-container">
                  <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nom *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nom" required className="luxury-input-field" />
                </div>

                <div className="luxury-field-container">
                  <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Ex: vous@exemple.com" required className="luxury-input-field" />
                </div>

                <div className="luxury-field-container">
                  <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Téléphone *</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Ex: 06 12 34 56 78" required className="luxury-input-field" />
                </div>

                {props.villesList && props.villesList.length > 0 && (
                  <div className="luxury-field-container">
                    <label style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ville *</label>
                    <div className="luxury-select-field-wrapper">
                      <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="luxury-select-field">
                        {props.villesList.map((v: string, idx: number) => <option key={idx} value={v}>{v}</option>)}
                      </select>
                      <div className="luxury-select-field-arrow">
                        <Icons.ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '2px 0' }}>
                <input type="checkbox" required checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} style={{ marginTop: 2, accentColor: dotColor, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, color: subtextColor, lineHeight: 1.5 }}>{AUTOHALL_RGPD_CLAUSE}</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="luxury-btn-primary"
                disabled={!formData.consent}
                style={{
                  background: dotColor,
                  opacity: formData.consent ? 1 : 0.45,
                  cursor: formData.consent ? 'pointer' : 'not-allowed',
                  transition: 'opacity 200ms',
                }}
              >{btnSubmitLabel}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeroTextStack({
  props,
  colorPrimary,
  darkText = false,
}: {
  props: HeroConversionBaseProps;
  colorPrimary: string;
  darkText?: boolean;
}) {
  const { selectedBrandId, selectedModelName } = useLandingPageContext();
  const activeBrand = selectedBrandId ? getAutoHallBrand(selectedBrandId) : null;
  const brandName = activeBrand?.name || '[Marque]';
  const modelName = selectedModelName || '[Nom du Modèle]';

  let displayTitle = props.title || 'Découvrez le Nouveau Modèle';
  if (displayTitle.includes('[Marque]') || displayTitle.includes('[Modèle]')) {
    displayTitle = displayTitle
      .replace('[Marque]', brandName)
      .replace('[Modèle]', modelName)
      .replace('[Slogan]', props.badgeText || 'Offre Spéciale');
  } else if (displayTitle === 'Découvrez le Nouveau Modèle') {
    displayTitle = `Découvrez le Nouveau ${modelName}`;
  }

  const titleColor = darkText ? '#ffffff' : (props.colorText ?? '#0f172a');
  const descColor = darkText ? 'rgba(255,255,255,0.72)' : '#64748b';
  const badgeColor = darkText ? '#ffffff' : colorPrimary;

  let displayPrice = props.priceAppel;
  if (displayPrice) {
    displayPrice = displayPrice.replace('[Prix]', '[Prix de départ]');
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      {props.badgeText ? (
        <span
          className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
          style={{
            color: badgeColor,
            border: `1px solid ${darkText ? 'rgba(255,255,255,0.18)' : `${colorPrimary}25`}`,
            background: darkText ? 'rgba(255,255,255,0.06)' : `${colorPrimary}08`,
          }}
        >
          {props.badgeText}
        </span>
      ) : null}
      <h1
        className="text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
        style={{ margin: 0, color: titleColor }}
      >
        {displayTitle}
      </h1>
      <p className="max-w-xl text-base leading-relaxed md:text-lg" style={{ margin: 0, color: descColor }}>
        {props.description || 'Une élégance technologique alliée à une performance remarquable sur route.'}
      </p>
      {displayPrice ? (
        <div className="flex flex-col gap-0.5 pt-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">À partir de</span>
          <span className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: darkText ? '#ffffff' : colorPrimary }}>
            {displayPrice}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function HeroMosaicGallery({
  vehicleImage,
  detailImage1,
  detailImage2,
  detailImage3,
}: {
  vehicleImage: string;
  detailImage1: string;
  detailImage2: string;
  detailImage3: string;
}) {
  return (
    <div className="grid h-[300px] w-full grid-cols-12 gap-2.5 overflow-hidden rounded-2xl md:h-[380px] md:gap-3">
      <div className="col-span-8 overflow-hidden rounded-l-2xl bg-slate-900/40">
        <img src={vehicleImage} alt="Vue principale" className="block h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]" />
      </div>
      <div className="col-span-4 grid h-full grid-rows-3 gap-2.5 md:gap-3">
        {[detailImage1, detailImage2, detailImage3].map((src, idx) => (
          <div
            key={idx}
            className={`overflow-hidden bg-slate-900/40 ${idx === 0 ? 'rounded-tr-2xl' : ''} ${idx === 2 ? 'rounded-br-2xl' : ''}`}
          >
            <img src={src} alt={`Détail ${idx + 1}`} className="block h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroShowroomBlock({ props, editorMode = false }: { props: HeroShowroomProps; editorMode?: boolean }) {
  const colorPrimary = props.colorPrimary ?? '#002C6C';
  const colorBgSection = props.colorBgSection ?? '#ffffff';
  const borderRadiusButtons = props.borderRadiusButtons ?? 32;
  const borderRadiusStyle = `${borderRadiusButtons}px`;
  const cleanVehicleImage = sanitizeUrl(props.vehicleImage) || 'https://www.autohall.ma/uploads/medias/901c3ac73d6a19a48168dca3b5d2e76e38d23267.jpg';

  return (
    <section
      className="relative w-full box-border"
      style={{
        backgroundColor: colorBgSection,
        fontFamily: FONT,
        paddingTop: `${props.paddingTop ?? 96}px`,
        paddingBottom: `${props.paddingBottom ?? 96}px`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: buildHeroFormStyles(colorPrimary, borderRadiusStyle, false) }} />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <HeroTextStack props={props} colorPrimary={colorPrimary} />
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 shadow-sm">
            <img
              src={cleanVehicleImage}
              alt={props.title || 'Véhicule'}
              className="mx-auto block h-auto max-h-[420px] w-full object-contain p-6 md:p-8"
            />
          </div>
        </div>
        <div className="flex items-start justify-center lg:col-span-5 lg:justify-end">
          <HeroFormCard
            props={props}
            editorMode={editorMode}
            colorPrimary={colorPrimary}
            borderRadiusButtons={borderRadiusButtons}
          />
        </div>
      </div>
    </section>
  );
}

export function HeroMosaicBlock({ props, editorMode = false }: { props: HeroMosaicProps; editorMode?: boolean }) {
  const colorPrimary = props.colorPrimary ?? '#8C1D40';
  const colorBgSection = props.colorBgSection ?? '#090d16';
  const borderRadiusButtons = props.borderRadiusButtons ?? 12;
  const borderRadiusStyle = `${borderRadiusButtons}px`;
  const formLayout = props.mosaicFormLayout ?? 'side';

  const cleanVehicleImage = sanitizeUrl(props.vehicleImage) || 'https://www.autohall.ma/uploads/medias/901c3ac73d6a19a48168dca3b5d2e76e38d23267.jpg';
  const cleanDetail1 = sanitizeUrl(props.detailImage1) || 'https://www.autohall.ma/uploads/medias/ac5e4ae6f22ffc86e2497b5fdb0813fefcaf2e39.jpg';
  const cleanDetail2 = sanitizeUrl(props.detailImage2) || 'https://www.autohall.ma/uploads/medias/3740d647da5eddb0d4f4f8a2ff55a406e589f98e.jpg';
  const cleanDetail3 = sanitizeUrl(props.detailImage3) || 'https://www.autohall.ma/uploads/medias/6c89f4691f16c3ff7aef475a2e155f77413b1406.jpg';

  const gallery = (
    <HeroMosaicGallery
      vehicleImage={cleanVehicleImage}
      detailImage1={cleanDetail1}
      detailImage2={cleanDetail2}
      detailImage3={cleanDetail3}
    />
  );

  const formCard = (
    <HeroFormCard
      props={props}
      editorMode={editorMode}
      colorPrimary={colorPrimary}
      borderRadiusButtons={borderRadiusButtons}
    />
  );

  return (
    <section
      className="relative w-full box-border text-white"
      style={{
        backgroundColor: colorBgSection,
        fontFamily: FONT,
        paddingTop: `${props.paddingTop ?? 96}px`,
        paddingBottom: `${props.paddingBottom ?? 96}px`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: buildHeroFormStyles(colorPrimary, borderRadiusStyle, false) }} />
      {formLayout === 'below' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 md:px-8">
          <HeroTextStack props={props} colorPrimary={colorPrimary} darkText />
          {gallery}
          <div className="mx-auto w-full max-w-md">{formCard}</div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <HeroTextStack props={props} colorPrimary={colorPrimary} darkText />
            {gallery}
          </div>
          <div className="flex items-start justify-center lg:col-span-5 lg:justify-end lg:pt-2">
            {formCard}
          </div>
        </div>
      )}
    </section>
  );
}

export function HeroCinematicBlock({ props, editorMode = false }: { props: HeroCinematicProps; editorMode?: boolean }) {
  const colorPrimary = props.colorPrimary ?? '#002C6C';
  const colorText = props.colorText ?? '#ffffff';
  const colorBgSection = props.colorBgSection ?? '#000000';
  const borderRadiusButtons = props.borderRadiusButtons ?? 8;
  const borderRadiusStyle = `${borderRadiusButtons}px`;
  const bgOverlayOpacity = props.bgOverlayOpacity ?? 60;
  const minHeight = props.cinematicMinHeight === 'screen' ? '100vh' : '80vh';
  const useGlassForm = (props.formCardStyle ?? 'glass') === 'glass';
  const cleanVehicleImage = sanitizeUrl(props.vehicleImage) || 'https://www.autohall.ma/uploads/medias/901c3ac73d6a19a48168dca3b5d2e76e38d23267.jpg';
  const overlayGradient = `linear-gradient(180deg, rgba(0,0,0,${(bgOverlayOpacity / 100 * 0.35).toFixed(2)}) 0%, rgba(0,0,0,${(bgOverlayOpacity / 100).toFixed(2)}) 100%)`;

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden box-border"
      style={{
        backgroundColor: colorBgSection,
        minHeight,
        fontFamily: FONT,
        paddingTop: `${props.paddingTop ?? 96}px`,
        paddingBottom: `${props.paddingBottom ?? 96}px`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: buildHeroFormStyles(colorPrimary, borderRadiusStyle, useGlassForm) }} />

      <div className="absolute inset-0 z-0">
        {props.bgVideoUrl ? (
          <video autoPlay loop muted playsInline className="block h-full w-full object-cover" src={props.bgVideoUrl} />
        ) : (
          <img src={cleanVehicleImage} alt="Arrière-plan cinématique" className="block h-full w-full object-cover" />
        )}
      </div>

      <div className="absolute inset-0 z-[1]" style={{ backgroundImage: overlayGradient }} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7" style={{ color: colorText }}>
          <HeroTextStack props={props} colorPrimary={colorPrimary} darkText />
        </div>
        <div className="flex items-start justify-center lg:col-span-5 lg:justify-end">
          <HeroFormCard
            props={props}
            editorMode={editorMode}
            colorPrimary={colorPrimary}
            borderRadiusButtons={borderRadiusButtons}
            darkTheme={useGlassForm}
            cardStyle={useGlassForm ? undefined : {
              background: '#ffffff',
              backdropFilter: undefined,
              WebkitBackdropFilter: undefined,
              border: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          />
        </div>
      </div>
    </section>
  );
}

export function HeroImmersiveFormBlock({ props, editorMode = false }: { props: HeroImmersiveFormProps; editorMode?: boolean }) {
  const { selectedBrandId, selectedModelName } = useLandingPageContext();
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  React.useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    fetch(`${apiBaseUrl}/api/brands`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.brands)) {
          setDbBrands(data.brands);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch brands from API:', err);
      });
  }, []);

  const activeBrand =
    (selectedBrandId && (dbBrands.find((b) => b.id === selectedBrandId) || getAutoHallBrand(selectedBrandId))) ||
    (props.brandKey && (dbBrands.find((b) => b.id === props.brandKey) || getAutoHallBrand(props.brandKey))) ||
    null;
  const primaryColor = activeBrand?.primaryColor || props.colorPrimary || '#002C6C';

  // State for step logic (only used when not in editor mode)
  const [currentStep, setCurrentStep] = useState(1);
  const activeStep = editorMode ? (props.studioPreviewStep || 1) : currentStep;

  // Form State
  const modelsList = React.useMemo(() => activeBrand?.models || ['[Modèle 1]', '[Modèle 2]', '[Modèle 3]'], [activeBrand]);
  const [formData, setFormData] = useState({
    model: selectedModelName || modelsList[0] || '',
    city: props.villesList?.[0] || 'Casablanca',
    date: '',
    name: '',
    phone: '',
    consent: false,
  });

  // Make sure model is updated if modelsList changes or brand changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, model: selectedModelName || modelsList[0] || '' }));
  }, [modelsList, selectedModelName]);

  // Handle next step / submission
  const handleNext = async () => {
    if (activeStep === 1) {
      if (!formData.model || !formData.city || !formData.date) {
        alert("Veuillez remplir tous les champs obligatoires de l'étape 1.");
        return;
      }
      setCurrentStep(2);
    } else if (activeStep === 2) {
      if (!formData.name || !formData.phone) {
        alert("Veuillez remplir votre nom et numéro de téléphone.");
        return;
      }
      if (!formData.consent) {
        alert("Veuillez accepter les conditions de traitement de données.");
        return;
      }

      if (editorMode) {
        setCurrentStep(3);
        return;
      }

      try {
        const campaignId = useBuilderV4Store.getState().campaignId;
        const landingPageId = useBuilderV4Store.getState().landingPageId;
        const pageVersionId = useBuilderV4Store.getState().pageVersionId;

        const payload = {
          campaignId: campaignId || undefined,
          landingPageId: landingPageId || undefined,
          pageVersionId: pageVersionId || undefined,
          fullName: formData.name,
          phone: formData.phone,
          email: undefined,
          vehicleModel: formData.model || undefined,
          city: formData.city || undefined,
          message: undefined,
          preferredDate: formData.date || undefined,
          requestType: 'TEST_DRIVE' as const,
          sourceUrl: window.location.href,
          rawPayload: formData,
        };

        // Save locally
        try {
          const prevLeads = JSON.parse(localStorage.getItem('ah_leads') ?? '[]');
          localStorage.setItem('ah_leads', JSON.stringify([...prevLeads, { ...payload, submittedAt: new Date().toISOString() }]));
        } catch (e) {
          console.error("Local storage lead save error", e);
        }

        // POST to backend API
        try {
          await apiRequest('/api/public/leads', {
            method: 'POST',
            body: payload,
            auth: false
          });
        } catch (e) {
          console.error("Database lead submission error", e);
        }

        // Webhook sync if enabled
        if (props.syncToAutoHallBase && props.autoHallApiUrl) {
          try {
            await fetch(props.autoHallApiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch (e) {
            console.error("Auto Hall Webhook Synchro Failure", e);
          }
        }

        setCurrentStep(3);
      } catch (err) {
        console.error("Submission error:", err);
        alert("Une erreur s'est produite lors de la soumission.");
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setCurrentStep(activeStep - 1);
    }
  };

  // Progress bar calculation
  let progressWidth = '33.3%';
  if (activeStep === 2) progressWidth = '66.6%';
  else if (activeStep === 3) progressWidth = '100%';

  const bgImage = sanitizeUrl(props.bgImage) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80';
  const todayStr = new Date().toISOString().split('T')[0];

  const overlayOpacity = props.overlayOpacity !== undefined ? props.overlayOpacity : 50;
  const bgBlur = props.bgBlur || 'none';
  const cardPosition = props.cardPosition || 'right';

  // Apply scale to prevent white borders on blurred absolute layer
  const blurStyle: React.CSSProperties = bgBlur !== 'none' ? {
    filter: `blur(${bgBlur})`,
    transform: 'scale(1.05)',
  } : {};

  return (
    <section 
      className="relative overflow-hidden w-full min-h-[600px] md:h-[650px] flex items-center box-border"
      style={{ fontFamily: FONT }}
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300 z-0"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          ...blurStyle
        }}
      />
      {/* Dark Overlay Layer */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300 z-10"
        style={{ opacity: overlayOpacity / 100 }}
      />

      <div className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14">
        {/* Left side text column (Swaps position on large screens if cardPosition is left) */}
        <div className={`hero-content flex flex-col lg:col-span-7 ${cardPosition === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
          <h1 className="text-white font-bold text-3xl md:text-4xl tracking-tight max-w-xl leading-tight">
            {props.title || 'Faites l’expérience d’une conduite d’exception avec Auto Hall'}
          </h1>
        </div>

        {/* Right side form column (Swaps position on large screens if cardPosition is left) */}
        <div className={`flex items-start justify-center lg:col-span-5 w-full ${cardPosition === 'left' ? 'lg:order-1 lg:justify-start' : 'lg:order-2 lg:justify-end'}`}>
          <div 
            className={`form_test_drive bg-white shadow-2xl rounded-2xl p-6 max-w-md w-full border border-zinc-100 box-border ${cardPosition === 'left' ? 'mr-auto' : 'ml-auto'}`}
            style={{ color: '#27272a', backgroundColor: '#ffffff' }}
          >
            
            <div className="progress-bar-custom w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6 relative">
              <div 
                className="h-full transition-all duration-300 ease-out bg-blue-600"
                style={{ 
                  width: progressWidth,
                  backgroundColor: primaryColor || undefined
                }}
              />
            </div>

            {activeStep === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 
                    className="text-zinc-800 font-bold text-xl tracking-tight mb-1 text-center leading-snug"
                    style={{ color: '#27272a' }}
                  >
                    {props.step1Title || 'Commençons par confirmer votre disponibilité'}
                  </h3>
                  {props.step1Subtitle && (
                    <p 
                      className="text-zinc-500 text-sm mb-4 text-center"
                      style={{ color: '#71717a' }}
                    >
                      {props.step1Subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    className="text-zinc-700 font-medium text-xs uppercase tracking-wider mb-1.5 block"
                    style={{ color: '#3f3f46' }}
                  >
                    MODÈLE
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.model} 
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {modelsList.length > 0 ? (
                        modelsList.map((m: string, idx: number) => (
                          <option key={idx} value={m}>{m}</option>
                        ))
                      ) : (
                        <option value="">Aucun modèle disponible</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <Icons.ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    className="text-zinc-700 font-medium text-xs uppercase tracking-wider mb-1.5 block"
                    style={{ color: '#3f3f46' }}
                  >
                    VILLE
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.city} 
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {(props.villesList || []).map((v, idx) => (
                        <option key={idx} value={v}>{v}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <Icons.ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    className="text-zinc-700 font-medium text-xs uppercase tracking-wider mb-1.5 block"
                    style={{ color: '#3f3f46' }}
                  >
                    DATE D'ESSAI SOUHAITÉE
                  </label>
                  <input 
                    type="date" 
                    id="testdrivemodele_dateessai"
                    name="testdrivemodele_dateessai"
                    min={todayStr}
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <button 
                  type="button" 
                  onClick={handleNext}
                  className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] mt-2 text-sm border-none cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {props.btnNextLabel || 'Suivant'}
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 
                    className="text-zinc-800 font-bold text-xl tracking-tight mb-1 text-center leading-snug"
                    style={{ color: '#27272a' }}
                  >
                    {props.step2Title || 'Enfin, Fournir votre nom et téléphone'}
                  </h3>
                  {props.step2Subtitle && (
                    <p 
                      className="text-zinc-500 text-sm mb-4 text-center"
                      style={{ color: '#71717a' }}
                    >
                      {props.step2Subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    className="text-zinc-700 font-medium text-xs uppercase tracking-wider mb-1.5 block"
                    style={{ color: '#3f3f46' }}
                  >
                    NOM COMPLET *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Entrez votre nom"
                    required
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label 
                    className="text-zinc-700 font-medium text-xs uppercase tracking-wider mb-1.5 block"
                    style={{ color: '#3f3f46' }}
                  >
                    TÉLÉPHONE *
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 00 00 00 00"
                    required
                    className="w-full h-11 border border-zinc-200 bg-zinc-50 rounded-xl px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-2.5 items-start mt-2">
                  <input 
                    type="checkbox" 
                    id="consent_immersive"
                    checked={formData.consent} 
                    onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                    required
                    className="mt-1 cursor-pointer w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    style={{ accentColor: primaryColor }}
                  />
                  <label htmlFor="consent_immersive" className="text-xs text-zinc-500 leading-normal cursor-pointer select-none">
                    J'accepte que mes données personnelles soient traitées par Auto Hall afin de planifier mon essai routier.
                  </label>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={handlePrev}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-xl transition-colors text-sm border-none cursor-pointer"
                  >
                    {props.btnBackLabel || 'Retour'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="flex-1 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] text-sm border-none cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {props.btnSubmitLabel || 'Valider'}
                  </button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col gap-4 text-center items-center py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Icons.CheckCircle2 size={36} style={{ color: primaryColor }} />
                </div>

                <h3 
                  className="text-zinc-800 text-xl font-bold leading-snug"
                  style={{ color: '#27272a' }}
                >
                  {props.step3Title || 'Demande Enregistrée !'}
                </h3>
                {props.step3Subtitle && (
                  <p 
                    className="text-sm text-zinc-600 leading-relaxed max-w-xs"
                    style={{ color: '#4b5563' }}
                  >
                    {props.step3Subtitle}
                  </p>
                )}

                <div className="w-full bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-left flex flex-col gap-2.5 mt-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200/60 pb-1.5">Récapitulatif</span>
                  
                  {activeBrand?.name && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Marque</span>
                      <span className="font-semibold text-zinc-800" style={{ color: '#27272a' }}>{activeBrand.name}</span>
                    </div>
                  )}

                  {formData.model && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Modèle</span>
                      <span className="font-semibold text-zinc-800" style={{ color: '#27272a' }}>{formData.model}</span>
                    </div>
                  )}

                  {formData.date && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Date d'essai</span>
                      <span className="font-semibold text-zinc-800" style={{ color: '#27272a' }}>{formData.date}</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-zinc-400 mt-6">© {new Date().getFullYear()} Auto Hall. Tous droits réservés.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

export function CarouselBlock({ props }: { props: CarouselBlockProps }) {
  return (
    <section
      style={{
        width: '100%',
        background: '#090d16',
        fontFamily: FONT,
        padding: '80px 5%',
        boxSizing: 'border-box',
        color: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em', color: '#ffffff' }}>
          Découvrez notre Sélection
        </h2>
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Carousel items={props.items} />
        </div>
      </div>
    </section>
  );
}

/** Ancre fixe vers la section Hero + Formulaire d'essai routier — pas de lien libre. */
const SPECS_SHOWROOM_FORM_ANCHOR = '#form_test_drive_modele';

const FINITION_ICON_COMPONENTS: Record<FinitionIconPresetKey, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Zap: Icons.Zap,
  ShipWheel: Icons.ShipWheel,
  Shield: Icons.Shield,
  Monitor: Icons.Monitor,
  Armchair: Icons.Armchair,
  Leaf: Icons.Leaf,
  Gauge: Icons.Gauge,
  Calendar: Icons.Calendar,
  Cpu: Icons.Cpu,
  Battery: Icons.Battery,
  Thermometer: Icons.Thermometer,
};

function renderFinitionOptionIcon(opt: FinitionOption) {
  if (opt.icon) {
    return <img src={opt.icon} alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} />;
  }
  const IconComp = opt.iconPreset ? FINITION_ICON_COMPONENTS[opt.iconPreset] : undefined;
  if (IconComp) {
    return <IconComp size={12} strokeWidth={2.5} />;
  }
  return <Icons.Check size={12} strokeWidth={3} />;
}

export function ModelIdentityShowroom({ props }: { props: SpecsShowroomBlockProps }) {
  const finitions = props.finitions ?? [];
  const [activeFinitionIdx, setActiveFinitionIdx] = useState(0);
  const activeFinition = finitions[activeFinitionIdx] ?? finitions[0];
  const { selectedBrandId, selectedModelName } = useLandingPageContext();
  
  // Dynamic brands state to fetch brands.json dynamically from backend
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  React.useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    fetch(`${apiBaseUrl}/api/brands`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.brands)) {
          setDbBrands(data.brands);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch brands from API:', err);
      });
  }, []);

  const activeBrand =
    (selectedBrandId && (dbBrands.find((b) => b.id === selectedBrandId) || getAutoHallBrand(selectedBrandId))) ||
    null;

  /** Priorité : marque active de la page (contexte global) > override manuel du bloc > défaut neutre. */
  const primaryColor = activeBrand?.primaryColor || props.colorPrimary || '#002C6C';
  const rawLogo = activeBrand?.logo || props.logoUrl;

  // Tant que l'asset réel n'est pas déposé dans /public/assets/logos, la balise <img> bascule
  // sur un wordmark généré localement (nom de la marque dans sa couleur officielle) plutôt que
  // de deviner une URL de CDN externe non vérifiée — évite un logo cassé ou invisible.
  const [logoFailed, setLogoFailed] = useState(false);
  React.useEffect(() => setLogoFailed(false), [rawLogo]);

  const logoSrc = !logoFailed && rawLogo
    ? rawLogo
    : activeBrand
      ? brandWordmarkPlaceholder(activeBrand.name, primaryColor)
      : '';

  const modelTitle = selectedModelName || (props.title && props.title !== '[Modèle]' ? props.title : '[Nom du Modèle]');
  const priceAppelValue = props.priceAppel && props.priceAppel !== '420 000 DH*' ? props.priceAppel : '[Prix de départ] DH*';
  const keyFeatures = props.keyFeatures ?? [];
  const showPriceCard = props.showPriceCard !== false;
  const legalMentions = props.legalMentions ?? [];

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target =
      document.querySelector(SPECS_SHOWROOM_FORM_ANCHOR) ||
      document.querySelector('#form_test_drive') ||
      document.querySelector('#hero-lead-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="header-section-modele w-full py-16 px-4 md:px-8 lg:px-12 bg-white"
      style={{
        fontFamily: FONT,
      }}
    >
      <div
        className={`grid grid-cols-1 ${
          showPriceCard ? 'lg:grid-cols-12 gap-8' : 'max-w-4xl'
        } items-start max-w-7xl mx-auto`}
      >
        {/* Column Info / Left */}
        <div
          className={`${
            showPriceCard ? 'lg:col-span-7' : 'w-full'
          } flex flex-col gap-6`}
        >
          {logoSrc && (
            <img
              src={logoSrc}
              alt={activeBrand ? `Logo ${activeBrand.name}` : 'Logo Marque'}
              className="max-h-12 object-contain self-start mb-2"
              onError={() => setLogoFailed(true)}
            />
          )}

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            {modelTitle}
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed max-w-2xl">
            {props.description}
          </p>

          {/* badges horizontaux discrets (Icône + Label) */}
          {keyFeatures.length > 0 && (
            <div className="flex flex-wrap gap-6 my-2">
              {keyFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="text-xs font-semibold text-zinc-500 flex items-center gap-2 bg-transparent"
                >
                  {(feature.iconPreset || feature.icon) && (
                    <span
                      className="w-4.5 h-4.5 flex items-center justify-center flex-shrink-0"
                      style={{ color: primaryColor }}
                    >
                      {renderFinitionOptionIcon(feature as any)}
                    </span>
                  )}
                  {feature.text}
                </div>
              ))}
            </div>
          )}

          {/* Onglets de finitions et contenu (Bas) */}
          {finitions.length > 0 && (
            <div className="w-full mt-6 flex flex-col gap-6">
              {/* tabs_liste_model_versions */}
              <div className="flex border-b border-zinc-200 gap-6 w-full tabs_liste_model_versions">
                {finitions.map((fin, idx) => {
                  const isActive = activeFinitionIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveFinitionIdx(idx)}
                      className="pb-3 bg-transparent border-b-2 font-bold text-sm cursor-pointer transition-all duration-200 focus:outline-none"
                      style={{
                        borderColor: isActive ? primaryColor : 'transparent',
                        color: isActive ? primaryColor : '#a1a1aa',
                      }}
                    >
                      {fin.name}
                    </button>
                  );
                })}
              </div>

              {activeFinition && (
                <div className="flex flex-col gap-6 p-6 border border-zinc-100 rounded-2xl bg-zinc-50/50 shadow-sm transition-all">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {activeFinition.desc}
                  </p>

                  {activeFinition.options && activeFinition.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeFinition.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-semibold text-zinc-800">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor,
                            }}
                          >
                            {renderFinitionOptionIcon(opt)}
                          </span>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeFinition.pdfUrl && (
                    <div className="pt-4 border-t border-zinc-100 flex">
                      <a
                        href={activeFinition.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-85"
                        style={{ color: primaryColor }}
                      >
                        <Icons.Download size={16} />
                        Télécharger la fiche technique
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column Price Card / Right */}
        {showPriceCard && (
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-md bg-white border border-zinc-100 shadow-xl rounded-2xl p-6 flex flex-col gap-6 transition-all hover:shadow-2xl">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  À partir de
                </span>
                <span
                  className="text-3.5xl font-extrabold tracking-tight leading-none"
                  style={{ color: primaryColor }}
                >
                  {priceAppelValue}
                </span>
              </div>

              {legalMentions.length > 0 && (
                <div className="text-xxs text-zinc-400 leading-relaxed flex flex-col gap-1 border-t border-zinc-50 pt-4">
                  {legalMentions.map((mention, i) => (
                    <span key={i}>{mention}</span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 px-6 text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border-none"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 14px ${primaryColor}40`,
                }}
              >
                {props.ctaLabel || 'Me faire rappeler →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function getContactField(fields: ContactFormField[] | undefined, id: ContactFormField['id']): ContactFormField {
  return fields?.find(f => f.id === id) ?? DEFAULT_CONTACT_FIELDS.find(f => f.id === id)!;
}

export function ContactSectionBlock({ props, editorMode = false }: { props: ContactSectionBlockProps; editorMode?: boolean }) {
  const [success, setSuccess] = useState(false);
  const accent = props.accentColor ?? '#002C6C';
  const bg = props.bgColor ?? '#ffffff';

  const fNom = getContactField(props.fields, 'nom');
  const fEmail = getContactField(props.fields, 'email');
  const fTelephone = getContactField(props.fields, 'telephone');
  const fVille = getContactField(props.fields, 'ville');
  const fMessage = getContactField(props.fields, 'message');

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    ville: props.villesList?.[0] ?? 'Casablanca',
    message: '',
    contactMethod: 'Par téléphone',
    consent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editorMode) return;
    setSuccess(true);
  };

  const inputStyle: React.CSSProperties = {
    height: 44,
    padding: '0 12px',
    border: '1px solid #e4e4e7',
    borderRadius: 8,
    outline: 'none',
    fontSize: 14,
    fontFamily: FONT,
    width: '100%',
    background: '#ffffff',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <section
      style={{
        width: '100%',
        background: bg,
        fontFamily: FONT,
        padding: '80px 5%',
        boxSizing: 'border-box',
        color: '#0f172a',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 flex flex-col gap-6" style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#002C6C', margin: 0, letterSpacing: '-0.02em' }}>
              {props.title || 'Nous Contacter'}
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
              {props.subtitle || 'Nous sommes là pour répondre à vos questions.'}
            </p>
          </div>

          {success ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '24px 20px', color: '#166534' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 'bold' }}>✓</span>
                <strong style={{ fontSize: 16 }}>Message envoyé !</strong>
              </div>
              <p style={{ fontSize: 14, margin: 0, color: '#166534', opacity: 0.9 }}>
                Merci pour votre message. Notre équipe prendra contact avec vous dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: 0 }}>
              {(fNom.enabled || fEmail.enabled) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {fNom.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={labelStyle}>
                        {fNom.label}{fNom.required && <span style={{ color: '#ef4444' }}> *</span>}
                      </label>
                      <input
                        type="text"
                        required={fNom.required}
                        value={formData.nom}
                        onChange={e => setFormData({ ...formData, nom: e.target.value })}
                        placeholder={fNom.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  )}
                  {fEmail.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={labelStyle}>
                        {fEmail.label}{fEmail.required && <span style={{ color: '#ef4444' }}> *</span>}
                      </label>
                      <input
                        type="email"
                        required={fEmail.required}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder={fEmail.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>
              )}

              {(fTelephone.enabled || fVille.enabled) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {fTelephone.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={labelStyle}>
                        {fTelephone.label}{fTelephone.required && <span style={{ color: '#ef4444' }}> *</span>}
                      </label>
                      <input
                        type="tel"
                        required={fTelephone.required}
                        value={formData.telephone}
                        onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                        placeholder={fTelephone.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  )}
                  {fVille.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={labelStyle}>
                        {fVille.label}{fVille.required && <span style={{ color: '#ef4444' }}> *</span>}
                      </label>
                      <select
                        value={formData.ville}
                        required={fVille.required}
                        onChange={e => setFormData({ ...formData, ville: e.target.value })}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        {props.villesList?.map((v, i) => (
                          <option key={i} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {fMessage.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={labelStyle}>
                    {fMessage.label}{fMessage.required && <span style={{ color: '#ef4444' }}> *</span>}
                  </label>
                  <textarea
                    required={fMessage.required}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder={fMessage.placeholder}
                    style={{ ...inputStyle, height: 90, padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>
              )}

              {/* Contact preferences */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>Comment souhaitez-vous être contacté ?</span>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, contactMethod: 'Par téléphone' })}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      transition: 'all 200ms',
                      ...(formData.contactMethod === 'Par téléphone'
                        ? { backgroundColor: accent, color: '#ffffff', borderColor: accent }
                        : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }),
                    }}
                  >
                    Par téléphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, contactMethod: 'Par email' })}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      transition: 'all 200ms',
                      ...(formData.contactMethod === 'Par email'
                        ? { backgroundColor: accent, color: '#ffffff', borderColor: accent }
                        : { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }),
                    }}
                  >
                    Par email
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                  style={{ marginTop: 2, accentColor: accent, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                  J'accepte les Conditions de Service et Politique de Confidentialité.
                </span>
              </div>

              <button
                type="submit"
                style={{
                  height: 44,
                  background: accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginTop: 10,
                  fontFamily: FONT,
                  transition: 'opacity 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {props.submitLabel || 'Soumettre'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Image aligned to form height */}
        {props.imageUrl && (
          <div className="lg:col-span-5 flex justify-center w-full">
            <img
              src={props.imageUrl}
              alt="Nous Contacter"
              className="w-full h-[400px] object-cover rounded-2xl shadow-md"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function ModelsGridBlock({ props }: { props: ModelsGridBlockProps }) {
  const { selectedBrandId } = useLandingPageContext();
  const activeBrand = selectedBrandId ? getAutoHallBrand(selectedBrandId) : null;

  const title = React.useMemo(() => {
    if (activeBrand) return `Modèles ${activeBrand.name}`;
    if (!props.title || props.title === '[Modèles de la Marque]') return '[Modèles de la Marque]';
    return props.title;
  }, [activeBrand, props.title]);

  const subtitle = React.useMemo(() => {
    if (activeBrand) return `Retrouvez ici tous les modèles ${activeBrand.name} actuellement proposés par Auto Hall au Maroc.`;
    return props.subtitle ?? 'Retrouvez ici la gamme complète proposée par Auto Hall au Maroc.';
  }, [activeBrand, props.subtitle]);

  const models = React.useMemo(() => {
    if (activeBrand && activeBrand.models) {
      return activeBrand.models.map((m, idx) => ({
        id: `m-${idx}`,
        name: m,
        price: 'Sur demande',
        badge: 'Neuf',
        image: '',
        link: `/fr/marque/${activeBrand.id}/modele/${m.toLowerCase().replace(/ /g, '-')}`
      }));
    }
    return props.models ?? [];
  }, [activeBrand, props.models]);

  return (
    <section
      style={{
        width: '100%',
        background: '#ffffff',
        fontFamily: FONT,
        padding: '48px 0',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 800,
              color: '#002C6C',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 16, color: '#4b5563', margin: 0, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {models.map((model) => (
            <div
              key={model.id}
              className="model-card-premium"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Image Container */}
              <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
                <img
                  src={model.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'}
                  alt={model.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {model.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(0, 44, 108, 0.9)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 20,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {model.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                    {model.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      À partir de
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#002C6C' }}>
                      {model.price}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                  <a
                    href={model.link || '#'}
                    className="model-card-btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: 42,
                      background: '#002c6c',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'all 200ms ease',
                    }}
                  >
                    Voir plus
                    <Icons.ArrowRight size={14} />
                  </a>
                  <a
                    href="#form_test_drive"
                    className="model-card-btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: 42,
                      background: '#f4f6f8',
                      color: '#374151',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'all 200ms ease',
                    }}
                  >
                    Réserver un essai
                    <Icons.Calendar size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .model-card-premium:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
          border-color: #d1d5db;
        }
        .model-card-btn-primary:hover {
          opacity: 0.9;
        }
        .model-card-btn-secondary:hover {
          background-color: #e5e7eb;
        }
      `}} />
    </section>
  );
}


export { CampaignGammeThermiqueBlock } from './CampaignGammeThermique';



const useStateAlias = useState;

export type FAQBlockProps = {
  blockType: 'faq-block';
  title?: string;
  subtitle?: string;
  accentColor?: string;
  items: { id: string; question: string; answer: string; }[];
};

export type GalleryBlockProps = {
  blockType: 'gallery-block';
  title?: string;
  columns?: number;
  gap?: number;
  borderRadius?: number;
  images: { src: string; alt?: string; caption?: string; }[];
};

export type TestimonialsBlockProps = {
  blockType: 'testimonials-block';
  title?: string;
  columns?: number;
  background?: string;
  items: { rating?: number; text: string; author: string; role?: string; }[];
};

export type LocalFooterBlockProps = {
  background?: string;
  accentColor?: string;
  columns: { heading: string; links: { label: string; href: string; }[] }[];
  brand: string;
  tagline?: string;
  copyright: string;
};

// ── FAQ Block ─────────────────────────────────────────────────────────────────

export function FAQBlock({ props }: { props: FAQBlockProps }) {
  const [openId, setOpenId] = useStateAlias<string | null>(null);
  const accent = props.accentColor ?? '#e85d04';
  return (
    <section style={{ padding: '72px 48px', background: '#fff' }}>
      {(props.title || props.subtitle) ? (
        <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          {props.title ? <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '0 0 12px', letterSpacing: '-0.025em' }}>{props.title}</h2> : null}
          {props.subtitle ? <p style={{ fontSize: 17, color: '#6b7280', margin: 0 }}>{props.subtitle}</p> : null}
        </div>
      ) : null}
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {props.items.map((item: any) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} style={{ border: `1.5px solid ${isOpen ? accent : '#f3f4f6'}`, borderRadius: 14, overflow: 'hidden', background: isOpen ? `${accent}08` : '#fff', transition: 'all 150ms ease' }}>
              <button type="button" onClick={() => setOpenId(isOpen ? null : item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', flex: 1 }}>{item.question}</span>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: isOpen ? accent : '#f3f4f6', color: isOpen ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.65, margin: 0 }}>{item.answer}</p></div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Gallery Block ─────────────────────────────────────────────────────────────

export function GalleryBlock({ props }: { props: GalleryBlockProps }) {
  const cols = props.columns ?? 3;
  return (
    <section style={{ padding: '64px 48px', background: '#fff' }}>
      {props.title ? <h2 style={{ fontSize: 34, fontWeight: 800, color: '#111827', margin: '0 0 36px', textAlign: 'center' }}>{props.title}</h2> : null}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: props.gap ?? 12, maxWidth: 1200, margin: '0 auto' }}>
        {props.images.map((img: any, i: number) => (
          <div key={i} style={{ borderRadius: props.borderRadius ?? 12, overflow: 'hidden', aspectRatio: '4 / 3', background: '#f3f4f6', position: 'relative' }}>
            <img src={img.src} alt={img.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {img.caption ? <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', color: '#fff', fontSize: 12 }}>{img.caption}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials Block ────────────────────────────────────────────────────────

export function TestimonialsBlock({ props }: { props: TestimonialsBlockProps }) {
  const cols = props.columns ?? 2;
  return (
    <section style={{ padding: '72px 48px', background: props.background ?? '#f9fafb' }}>
      {props.title ? <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '0 0 48px', textAlign: 'center' }}>{props.title}</h2> : null}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20, maxWidth: 1100, margin: '0 auto' }}>
        {props.items.map((item: any, i: number) => (
          <div key={i} style={{ padding: 28, borderRadius: 16, background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {item.rating ? <div style={{ display: 'flex', gap: 3 }}>{Array.from({ length: item.rating }).map((_, s) => <span key={s} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}</div> : null}
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, margin: 0, flex: 1 }}>"{item.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #e85d04, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{item.author[0]}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{item.author}</p>
                {item.role ? <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{item.role}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Footer Block ──────────────────────────────────────────────────────────────

export function FooterBlock({ props }: { props: LocalFooterBlockProps }) {
  const bg = props.background ?? '#111827';
  const accent = props.accentColor ?? '#e85d04';
  return (
    <footer style={{ padding: '56px 48px 36px', background: bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `240px ${props.columns.map(() => '1fr').join(' ')}`, gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}><span style={{ color: accent }}>{props.brand}</span></div>
            {props.tagline ? <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{props.tagline}</p> : null}
          </div>
          {props.columns.map((col: any, i: number) => (
            <div key={i}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', margin: '0 0 14px' }}>{col.heading}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((link: any, j: number) => <li key={j}><a href={link.href} style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none' }}>{link.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{props.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

// ── AlternatingShowcase Block ───────────────────────────────────────────────

function DynamicIcon({ name, className, size = 20 }: { name: string; className?: string; size?: number }) {
  const IconComponent = name ? ((Icons as any)[name] || Icons.HelpCircle) : Icons.HelpCircle;
  if (!IconComponent) {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    );
  }
  return <IconComponent className={className} size={size} />;
}

export function AlternatingShowcaseBlock({ props }: { props: AlternatingShowcaseBlockProps }) {
  const { primaryColor } = useActiveTheme();

  return (
    <div className="reverse-mobile">
      {(props.items || []).map((item: any, index: number) => {
        const isOdd = index % 2 !== 0;
        return (
          <section key={item.id || index} className="w-full py-16 bg-white box-border">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <div className={`flex flex-col md:flex-row gap-8 items-center justify-center ${isOdd ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Text Content Column */}
                <div className="flex-1 w-full md:max-w-xl">
                  {item.badge && (
                    <span 
                      className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                  
                  <h4 
                    className="text-zinc-800 font-bold text-2xl md:text-3xl mb-4 leading-tight"
                    style={{ color: '#27272a' }}
                  >
                    {item.title}
                  </h4>
                  
                  <p 
                    className="text-zinc-600 text-sm leading-relaxed mb-6"
                    style={{ color: '#52525b' }}
                  >
                    {item.description}
                  </p>

                  {/* Micro-features Sub-grid */}
                  <div className="flex gap-4 mt-4">
                    {/* Micro-feature 1 */}
                    <div className="flex gap-3 items-start flex-1">
                      <div 
                        className="p-2.5 rounded-xl flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                      >
                        <DynamicIcon name={item.feature1Icon} size={20} />
                      </div>
                      <div>
                        <h6 className="font-semibold text-zinc-800 text-base mb-1" style={{ color: '#27272a' }}>
                          {item.feature1Title}
                        </h6>
                        <p className="text-zinc-500 text-xs leading-normal" style={{ color: '#71717a' }}>
                          {item.feature1Desc}
                        </p>
                      </div>
                    </div>

                    {/* Micro-feature 2 */}
                    <div className="flex gap-3 items-start flex-1">
                      <div 
                        className="p-2.5 rounded-xl flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                      >
                        <DynamicIcon name={item.feature2Icon} size={20} />
                      </div>
                      <div>
                        <h6 className="font-semibold text-zinc-800 text-base mb-1" style={{ color: '#27272a' }}>
                          {item.feature2Title}
                        </h6>
                        <p className="text-zinc-500 text-xs leading-normal" style={{ color: '#71717a' }}>
                          {item.feature2Desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Explorer Button */}
                  <div className="mt-8">
                    <a
                      href={item.linkUrl || '#'}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.linkLabel || 'Explorer'}
                    </a>
                  </div>
                </div>

                {/* Image Column */}
                <div className="flex-1 flex justify-center w-full">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full max-w-md h-[380px] object-cover rounded-2xl shadow-sm"
                  />
                </div>

              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export { MultiStepTestDriveBlock } from './MultiStepTestDrive';
