import { useState } from 'react';
import type { BuilderNode } from '../../types/nodes.types';
import { useBuilderV4Store } from '../../store/document.store';
import { HeroFormRenderer } from '../HeroFormRenderer';
import { resolveFormSteps, getFieldsForStep, stepNumberLabel } from '../../lib/form-steps';

// ── Shared Field Mockup for Editor Mode ──────────────────────────────────────────

function EditorFieldMockup({ field }: { field: any }) {
  const type = field.type ?? 'text';
  const isConsent = type === 'checkbox' || field.id === 'consent';

  if (isConsent) {
    return (
      <label className="hfr-consent" data-form-field-id={field.id} style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
        <span className="hfr-consent__check-mock" style={{ width: 16, height: 16, border: '1px solid #d1d5db', borderRadius: 4, display: 'inline-block' }} />
        <span className="hfr-consent__text" style={{ fontSize: 13, color: '#4b5563' }}>
          {field.label}
          {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </span>
      </label>
    );
  }

  const previewText = field.placeholder || (type === 'select' ? 'Sélectionner…' : '');

  return (
    <div className="hfr-field" style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <label className="hfr-field__label" data-form-field-id={field.id} style={{ fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
        {field.label}
        {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      <div
        className="hfr-field__input hfr-field__input--mock"
        style={{
          height: 42,
          padding: '0 12px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          color: '#9ca3af',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {previewText || field.label}
      </div>
    </div>
  );
}

// ── 1. Hero Block ──────────────────────────────────────────────────────────────

export function HeroBlock({ props }: { props: any }) {
  const bgStyle = props.backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, ${props.gradientFrom || 'rgba(0,44,95,0.7)'} 0%, ${props.gradientTo || 'rgba(0,0,0,0.85)'} 100%), url(${props.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: `linear-gradient(135deg, ${props.gradientFrom || '#002c5f'} 0%, ${props.gradientTo || '#000000'} 100%)`,
      };

  const align = props.layout === 'center' ? 'center' : props.layout === 'right' ? 'flex-end' : 'flex-start';
  const textAlign = props.layout === 'center' ? 'center' : props.layout === 'right' ? 'right' : 'left';

  return (
    <section
      className="lp-hero-block"
      style={{
        ...bgStyle,
        minHeight: props.minHeight || '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align,
        padding: '80px 5%',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          textAlign: textAlign as any,
          alignItems: align,
          color: '#ffffff',
          fontFamily: 'Outfit, Inter, sans-serif',
        }}
      >
        {props.title && (
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            {props.title}
          </h1>
        )}
        {props.subtitle && (
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              fontWeight: 400,
            }}
          >
            {props.subtitle}
          </p>
        )}
        {props.ctaText && (
          <a
            href={props.ctaUrl || '#'}
            style={{
              marginTop: 12,
              padding: '14px 36px',
              backgroundColor: '#e85d04',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 50,
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(232,93,4,0.3)',
              transition: 'all 200ms ease',
              display: 'inline-block',
            }}
          >
            {props.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// ── Icon mini-renderer (subset of Lucide paths for canvas preview) ─────────────

const ICON_PATHS: Record<string, string> = {
  Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  Percent: 'M19 5L5 19M7 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0M13 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  Truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  Star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  Award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  CheckCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  Zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  Gift: 'M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  Car: 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9h-2M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  Wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  Lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  Heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  Phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.82-.82a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
};

function BenefitIcon({ name, color, size = 18 }: { name: string; color: string; size?: number }) {
  const d = ICON_PATHS[name] ?? ICON_PATHS['CheckCircle'];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

// ── 2. Hero Form Block — 6 layout variants (split-right, split-left, floating, centered, fullbg, overlay) ─

export function HeroFormBlock({ node, props, editorMode }: { node: BuilderNode; props: any; editorMode: boolean }) {
  const previewMode = useBuilderV4Store((s) => s.previewMode);

  // Layout
  // variant: 'split-right' | 'split-left' | 'floating' | 'centered' | 'fullbg' | 'overlay'
  // backward compat: 'split' → 'split-right'
  const rawVariant = props.variant ?? 'split-right';
  const variant = rawVariant === 'split' ? 'split-right' : rawVariant;

  // Commented out unused vars to comply with strict noUnusedLocals TS rules
  // const HEIGHT_MAP: Record<string, string> = { S: '60vh', M: '75vh', L: '90vh', full: '100vh' };
  // const _minHeight = HEIGHT_MAP[props.sectionHeight ?? 'M'] ?? '75vh';
  // const VALIGN: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
  // const _verticalAlign = VALIGN[props.verticalAlign ?? 'center'] ?? 'center';
  // const SPLIT_MAP: Record<string, string> = { '50/50': '1fr 1fr', '60/40': '1.5fr 1fr', '40/60': '1fr 1.5fr' };
  // const _gridColumns = SPLIT_MAP[props.contentSplit ?? '60/40'] ?? '1.5fr 1fr';

  // Background
  const bgImg = props.backgroundImage as string | undefined;
  // const _bgX = props.backgroundPositionX ?? 50;
  // const _bgY = props.backgroundPositionY ?? 50;
  // const _bgZoom = props.backgroundZoom ?? 110;
  // const _bgBrightness = (props.backgroundBrightness ?? 85) / 100;
  const overlayOpacity = (props.overlayOpacity ?? 60) / 100;
  const gradientFrom = props.gradientFrom ?? 'rgba(0,28,61,0.82)';
  const gradientTo = props.gradientTo ?? 'rgba(0,0,0,0.65)';
  const backdropBlur = props.backdropBlur ?? 0;

  // Colors / Typography
  const accentColor = props.accentColor ?? '#e85d04';
  const textColor = props.textColor ?? '#ffffff';
  const textColorSecondary = props.textColorSecondary ?? 'rgba(255,255,255,0.82)';
  const FONT = "'Outfit', Inter, system-ui, sans-serif";

  // Benefits — support rich array OR legacy bullets string array
  type Benefit = { id: string; icon?: string; title: string; description?: string; color?: string; enabled?: boolean };
  const rawBenefits = props.benefits as Benefit[] | undefined;
  const legacyBullets = (props.bullets as string[] | undefined) ?? [];
  const benefits: Benefit[] = rawBenefits ?? legacyBullets.map((b, i) => ({ id: `b${i}`, title: b }));
  const activeBenefits = benefits.filter(b => b.enabled !== false);

  const isCentered = variant === 'centered' || variant === 'fullbg';

  // Form logic
  const showInteractiveForm = previewMode || !editorMode;
  const steps = resolveFormSteps(props);
  const editorStepIndex = props.previewStepIndex ?? 0;
  const currentStep = steps[editorStepIndex] || steps[0];
  const visibleFields = currentStep ? getFieldsForStep(props.fields || [], currentStep) : (props.fields || []);

  // ── Hero content (left column / top area) ───────────────────────────────────
  const heroContent = (
    <div style={{
      color: textColor,
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      textAlign: isCentered ? 'center' : 'left',
      alignItems: isCentered ? 'center' : 'flex-start',
    }}>
      {/* Badge */}
      {props.badge ? (
        <span style={{
          display: 'inline-flex', width: 'fit-content',
          padding: '5px 14px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 24,
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
        }}>
          {props.badge}
        </span>
      ) : null}

      {/* Title */}
      {props.title ? (
        <h1 style={{
          fontSize: 'clamp(1.9rem, 3.8vw, 3rem)',
          fontWeight: 900, lineHeight: 1.1, margin: 0,
          letterSpacing: '-0.03em', color: textColor,
          whiteSpace: 'pre-line',
        }}>
          {props.title}
        </h1>
      ) : null}

      {/* Subtitle */}
      {props.subtitle ? (
        <p style={{ fontSize: 'clamp(0.95rem,1.6vw,1.1rem)', lineHeight: 1.7, color: textColorSecondary, margin: 0, maxWidth: '52ch' }}>
          {props.subtitle}
        </p>
      ) : null}

      {/* Price */}
      {props.showPrice && props.price ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {props.priceLabel ? (
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: textColorSecondary }}>
              {props.priceLabel}
            </span>
          ) : null}
          <span style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: accentColor, letterSpacing: '-0.02em' }}>
            {props.price}
          </span>
        </div>
      ) : null}

      {/* Benefits */}
      {activeBenefits.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeBenefits.map((b) => (
            <li key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: `${b.color ?? accentColor}18`,
                border: `1.5px solid ${b.color ?? accentColor}40`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BenefitIcon name={b.icon ?? 'CheckCircle'} color={b.color ?? accentColor} size={16} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{b.title}</span>
                {b.description ? (
                  <span style={{ fontSize: 12, color: textColorSecondary, lineHeight: 1.5 }}>{b.description}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  // ── Form card (static editor preview) ───────────────────────────────────────
  const staticFormCard = (
    <div
      className="hfr-card"
      style={{
        borderRadius: props.cardRadius ?? 20,
        background: props.cardBackground ?? '#ffffff',
        padding: props.cardSpacing ?? 28,
        color: '#111827',
        width: '100%',
        maxWidth: 440,
        boxSizing: 'border-box' as const,
        boxShadow: (props.cardShadow ?? true) ? '0 10px 40px rgba(0,0,0,0.15)' : 'none',
        backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : undefined,
      }}
    >
      {steps.length > 1 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          {steps.map((_, i) => (
            <span key={i} style={{
              width: i === editorStepIndex ? 12 : 8,
              height: i === editorStepIndex ? 12 : 8,
              borderRadius: '50%',
              background: i <= editorStepIndex ? accentColor : '#e5e7eb',
              flexShrink: 0,
              transition: 'all 200ms',
            }} />
          ))}
        </div>
      ) : null}
      {steps.length > 1 ? (
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accentColor }}>
          {stepNumberLabel(editorStepIndex, steps.length)}
        </p>
      ) : null}
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#111827', letterSpacing: '-0.02em', fontFamily: FONT }}>
        {currentStep?.title || props.formTitle || 'Réservez votre essai'}
      </h2>
      {currentStep?.description ? (
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px', lineHeight: 1.55 }}>{currentStep.description}</p>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        {visibleFields.map((f: any) => (
          <EditorFieldMockup key={f.id} field={f} />
        ))}
      </div>
      <button
        type="button"
        style={{
          width: (props.buttonWidth ?? 'full') === 'full' ? '100%' : 'auto',
          height: 50,
          borderRadius: props.buttonRadius ?? 12,
          backgroundColor: props.buttonColor ?? accentColor,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 14px ${(props.buttonColor ?? accentColor)}40`,
          fontFamily: FONT,
        }}
      >
        {currentStep?.nextLabel || props.submitLabel || 'Valider ma demande'}
      </button>
    </div>
  );

  const formEl = showInteractiveForm
    ? <HeroFormRenderer node={node} props={props} />
    : staticFormCard;

  const CHERY_BANNER = 'https://www.autohall.ma/sites/default/files/styles/brand_landing_hero/public/chery-brand-banner.jpg';
  const effectiveBg = bgImg || CHERY_BANNER;

  return (
    <section
      className="lp-hero-form-block w-full min-h-[85vh] bg-cover bg-center relative flex items-center"
      style={{
        backgroundImage: `url('${effectiveBg}')`,
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        opacity: overlayOpacity,
        zIndex: 0,
      }} />

      {/* Content container — 12-col grid, text 7 cols / form 5 cols */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* ── split-right (default): text left 7 cols, form right 5 cols ── */}
        {(variant === 'split-right' || variant === 'floating') ? (
          <>
            <div className="lg:col-span-7">{heroContent}</div>
            <div className="lg:col-span-5 flex justify-end">{formEl}</div>
          </>
        ) : null}

        {/* ── split-left: form left 5 cols, text right 7 cols ── */}
        {variant === 'split-left' ? (
          <>
            <div className="lg:col-span-5 flex justify-start">{formEl}</div>
            <div className="lg:col-span-7">{heroContent}</div>
          </>
        ) : null}

        {/* ── centered / fullbg: full width, stacked ── */}
        {(variant === 'centered' || variant === 'fullbg') ? (
          <div className="lg:col-span-12 flex flex-col items-center gap-10">
            <div style={{ maxWidth: variant === 'fullbg' ? 760 : 680, width: '100%', textAlign: 'center' }}>{heroContent}</div>
            <div style={{ width: '100%', maxWidth: 460 }}>{formEl}</div>
          </div>
        ) : null}

        {/* ── overlay: hero text left, form card absolutely right ── */}
        {variant === 'overlay' ? (
          <>
            <div className="lg:col-span-7">{heroContent}</div>
            <div className="lg:col-span-5 flex justify-end">{formEl}</div>
          </>
        ) : null}
      </div>
    </section>
  );
}

// ── 3. Text Block ──────────────────────────────────────────────────────────────

export function TextBlock({ props }: { props: any }) {
  const align = props.alignment ?? 'left';
  const maxW = props.maxWidth ?? 780;
  const accent = props.accentColor ?? '#e85d04';

  return (
    <section
      style={{
        background: props.background ?? '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
        padding: `${props.paddingTop ?? 80}px 5% ${props.paddingBottom ?? 80}px`,
      }}
    >
      <div
        style={{
          maxWidth: maxW,
          width: '100%',
          margin: '0 auto',
          textAlign: align as 'left' | 'center' | 'right',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          fontFamily: "'Outfit', Inter, system-ui, sans-serif",
        }}
      >
        {props.eyebrow ? (
          <p style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accent,
          }}>
            {props.eyebrow}
          </p>
        ) : null}

        {props.heading ? (
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            color: props.textColor ?? '#111827',
          }}>
            {props.heading}
          </h2>
        ) : null}

        {props.subheading ? (
          <h3 style={{
            margin: 0,
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            fontWeight: 600,
            lineHeight: 1.35,
            color: props.textColor ?? '#111827',
            opacity: 0.75,
          }}>
            {props.subheading}
          </h3>
        ) : null}

        {props.body ? (
          <p style={{
            margin: 0,
            fontSize: props.fontSize ?? 17,
            lineHeight: 1.72,
            color: props.bodyColor ?? props.textColor ?? '#4b5563',
            maxWidth: align === 'center' ? '75ch' : '68ch',
            marginLeft: align === 'center' ? 'auto' : undefined,
            marginRight: align === 'center' ? 'auto' : undefined,
          }}>
            {props.body}
          </p>
        ) : null}

        {props.ctaLabel ? (
          <div style={{ marginTop: 8 }}>
            <a
              href={props.ctaUrl ?? '#'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                background: accent,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 10,
                textDecoration: 'none',
                boxShadow: `0 4px 16px ${accent}40`,
              }}
            >
              {props.ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ── 4. Image Block ─────────────────────────────────────────────────────────────

export function ImageBlock({ props }: { props: any }) {
  const radius = props.borderRadius ?? 0;
  const isFullBleed = props.fullBleed ?? false;
  const maxW = props.maxWidth ?? 1200;

  return (
    <section
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: props.background ?? '#f9fafb',
        padding: isFullBleed ? 0 : `${props.paddingY ?? 40}px ${props.paddingX ?? '5%'}`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isFullBleed ? '100%' : maxW,
          margin: '0 auto',
          aspectRatio: props.imageAspectRatio ?? '16/9',
          overflow: 'hidden',
          borderRadius: radius,
          boxShadow: props.shadow
            ? '0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.1)'
            : 'none',
        }}
      >
        <img
          src={props.imageSrc ?? 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1400&q=85'}
          alt={props.imageAlt ?? ''}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: props.imageFit ?? 'cover',
            objectPosition: props.focalPoint ?? 'center center',
            display: 'block',
          }}
        />
        {props.imageOverlayEnabled ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: props.imageOverlayColor ?? 'rgba(0,0,0,0.3)',
            opacity: (props.imageOverlayOpacity ?? 35) / 100,
          }} />
        ) : null}
        {props.caption ? (
          <figcaption style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '12px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
          }}>
            {props.caption}
          </figcaption>
        ) : null}
      </div>
    </section>
  );
}

// ── 5. Video Block ─────────────────────────────────────────────────────────────

export function VideoBlock({ props }: { props: any }) {
  const [playing, setPlaying] = useState(false);

  // Parse embed URL
  let embedUrl = props.videoUrl || '';
  if (embedUrl.includes('youtube.com/watch?v=')) {
    const id = embedUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  } else if (embedUrl.includes('youtu.be/')) {
    const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  return (
    <section
      style={{
        padding: '40px 5%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          aspectRatio: props.videoAspectRatio || '16/9',
          borderRadius: props.videoRadius ?? 16,
          boxShadow: props.videoShadow ? '0 12px 30px rgba(0,0,0,0.12)' : 'none',
          overflow: 'hidden',
          background: '#000000',
          position: 'relative',
        }}
      >
        {playing ? (
          <iframe
            src={embedUrl}
            title="Video Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${props.videoCover || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setPlaying(true)}
          >
            {/* Play Button Icon */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'rgba(232,93,4,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 200ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill="#ffffff" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 6. Button Block ────────────────────────────────────────────────────────────

export function ButtonBlock({ props }: { props: any }) {
  const align = props.buttonAlignment === 'left' ? 'flex-start' : props.buttonAlignment === 'right' ? 'flex-end' : 'center';

  return (
    <div
      style={{
        padding: '24px 5%',
        display: 'flex',
        justifyContent: align,
        width: '100%',
        boxSizing: 'border-box',
        background: '#ffffff',
      }}
    >
      <a
        href={props.buttonUrl || '#'}
        style={{
          padding: '14px 36px',
          backgroundColor: props.buttonVariant === 'outline' ? 'transparent' : (props.accentColor || '#e85d04'),
          border: `2px solid ${props.accentColor || '#e85d04'}`,
          color: props.buttonVariant === 'outline' ? (props.accentColor || '#e85d04') : '#ffffff',
          fontWeight: 700,
          fontSize: 15,
          borderRadius: 8,
          textDecoration: 'none',
          transition: 'all 150ms ease',
        }}
      >
        {props.buttonLabel || 'Bouton'}
      </a>
    </div>
  );
}

// ── 7. Form Block ──────────────────────────────────────────────────────────────

export function FormBlock({ node, props, editorMode }: { node: BuilderNode; props: any; editorMode: boolean }) {
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const steps = resolveFormSteps(props);
  const editorStepIndex = props.previewStepIndex ?? 0;
  const currentStep = steps[editorStepIndex] || steps[0];
  const visibleFields = currentStep ? getFieldsForStep(props.fields || [], currentStep) : (props.fields || []);

  const showInteractiveForm = previewMode || !editorMode;

  return (
    <section
      style={{
        padding: '60px 5%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        background: '#f9fafb',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {showInteractiveForm ? (
          <HeroFormRenderer node={node} props={props} />
        ) : (
          <div
            className="hfr-card v4-autohall-form"
            style={{
              borderRadius: props.cardRadius ?? 16,
              background: props.cardBackground ?? '#ffffff',
              padding: props.cardSpacing ?? 24,
              color: props.textColor ?? '#111827',
              boxShadow: props.cardShadow ? '0 10px 25px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {steps.length > 1 ? (
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: props.accentColor ?? '#e85d04' }}>
                {stepNumberLabel(editorStepIndex, steps.length)}
              </p>
            ) : null}
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#111827', letterSpacing: '-0.02em' }}>
              {currentStep?.title || props.formTitle || 'Réservez votre essai'}
            </h2>
            {currentStep?.description ? (
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px', lineHeight: 1.55 }}>{currentStep.description}</p>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              {visibleFields.map((f: any) => (
                <EditorFieldMockup key={f.id} field={f} />
              ))}
            </div>
            <button
              type="button"
              style={{
                width: '100%',
                height: 50,
                borderRadius: 12,
                backgroundColor: props.accentColor ?? '#e85d04',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${(props.accentColor ?? '#e85d04')}40`,
              }}
            >
              {currentStep?.nextLabel || props.submitLabel || 'Suivant →'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
