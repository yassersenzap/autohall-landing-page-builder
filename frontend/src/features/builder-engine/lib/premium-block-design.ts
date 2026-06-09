/** Mirror of backend/src/landing-render/premium-block-design.ts */

export type PremiumVariant = 'split-form' | 'media-focus' | 'compact';
export type PremiumTone = 'light' | 'dark' | 'brand';
export type PremiumMediaPosition = 'left' | 'right';
export type PremiumDensity = 'compact' | 'comfortable' | 'immersive';
export type PremiumImageShape = 'rounded-card' | 'full-bleed' | 'simple';
export type PremiumCtaStyle = 'primary' | 'outline' | 'white';

export type NormalizedPremiumDesign = {
  variant: PremiumVariant;
  tone: PremiumTone;
  mediaPosition: PremiumMediaPosition;
  density: PremiumDensity;
  imageShape: PremiumImageShape;
  ctaStyle: PremiumCtaStyle;
};

const VARIANTS = new Set<PremiumVariant>(['split-form', 'media-focus', 'compact']);
const TONES = new Set<PremiumTone>(['light', 'dark', 'brand']);
const POSITIONS = new Set<PremiumMediaPosition>(['left', 'right']);
const DENSITIES = new Set<PremiumDensity>(['compact', 'comfortable', 'immersive']);
const SHAPES = new Set<PremiumImageShape>(['rounded-card', 'full-bleed', 'simple']);
const CTA_STYLES = new Set<PremiumCtaStyle>(['primary', 'outline', 'white']);

function pick<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

export function normalizePremiumDesign(
  props: Record<string, unknown>,
  defaults: Partial<NormalizedPremiumDesign> = {},
): NormalizedPremiumDesign {
  const raw =
    props.design && typeof props.design === 'object' && !Array.isArray(props.design)
      ? (props.design as Record<string, unknown>)
      : {};

  const legacyMedia =
    typeof raw.mediaPosition === 'string'
      ? raw.mediaPosition
      : typeof raw.imagePosition === 'string' && raw.imagePosition !== 'none'
        ? raw.imagePosition
        : undefined;

  return {
    variant: pick(raw.variant, VARIANTS, defaults.variant ?? 'split-form'),
    tone: pick(raw.tone, TONES, defaults.tone ?? 'light'),
    mediaPosition: pick(
      legacyMedia ?? raw.mediaPosition,
      POSITIONS,
      defaults.mediaPosition ?? 'right',
    ),
    density: pick(raw.density, DENSITIES, defaults.density ?? 'comfortable'),
    imageShape: pick(raw.imageShape, SHAPES, defaults.imageShape ?? 'rounded-card'),
    ctaStyle: pick(raw.ctaStyle, CTA_STYLES, defaults.ctaStyle ?? 'primary'),
  };
}

export function buildPremiumSectionClasses(
  baseClass: string,
  design: NormalizedPremiumDesign,
): string {
  return [
    baseClass,
    `${baseClass}--variant-${design.variant}`,
    `${baseClass}--tone-${design.tone}`,
    `${baseClass}--density-${design.density}`,
    `${baseClass}--media-${design.mediaPosition}`,
    `${baseClass}--shape-${design.imageShape}`,
    `${baseClass}--cta-${design.ctaStyle}`,
  ].join(' ');
}

export function resolveHeroFormLayoutVariant(design: NormalizedPremiumDesign): string {
  if (design.variant === 'media-focus') {
    return design.mediaPosition === 'left' ? 'image_left_form_right' : 'text_left_form_right';
  }
  if (design.variant === 'compact') return 'text_left_form_right';
  return design.mediaPosition === 'left' ? 'form_left_text_right' : 'text_left_form_right';
}

export function resolveHeroFormImagePosition(
  design: NormalizedPremiumDesign,
): 'left' | 'right' | 'none' {
  if (design.variant === 'compact') return 'none';
  if (design.variant === 'media-focus') return design.mediaPosition;
  return design.mediaPosition;
}

export function buildPremiumCtaClass(
  design: NormalizedPremiumDesign,
  base = 'lp-btn lp-btn--lg',
): string {
  if (design.ctaStyle === 'outline') return `${base} lp-btn--secondary`;
  if (design.ctaStyle === 'white') return `${base} lp-btn--white`;
  return `${base} lp-btn--primary`;
}

export function parseTrustItems(props: Record<string, unknown>): string[] {
  const raw = props.trustItems ?? props.reassurance;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, 4);
}

export function patchPremiumDesign(
  propsJson: Record<string, unknown>,
  patch: Partial<NormalizedPremiumDesign>,
): Record<string, unknown> {
  const current = normalizePremiumDesign(propsJson);
  return {
    design: { ...current, ...patch },
  };
}
