/**
 * Shared controlled design props for all Builder V3 section blocks.
 * Frontend mirror: frontend/src/features/builder-engine/lib/block-design-system.ts
 */
import {
  buildPremiumCtaClass,
  buildPremiumSectionClasses,
  normalizePremiumDesign,
  type NormalizedPremiumDesign,
  type PremiumCtaStyle,
  type PremiumDensity,
  type PremiumImageShape,
  type PremiumMediaPosition,
} from './premium-block-design';

export type BlockTone = 'light' | 'dark' | 'brand' | 'neutral';
export type BlockAlignment = 'left' | 'center' | 'split';

export type NormalizedBlockDesign = {
  variant: string;
  tone: BlockTone;
  density: PremiumDensity;
  mediaPosition: PremiumMediaPosition;
  imageShape: PremiumImageShape;
  ctaStyle: PremiumCtaStyle;
  alignment: BlockAlignment;
};

const TONES = new Set<BlockTone>(['light', 'dark', 'brand', 'neutral']);
const ALIGNMENTS = new Set<BlockAlignment>(['left', 'center', 'split']);

const VARIANTS_BY_BLOCK: Record<string, readonly string[]> = {
  hero_form_campaign: ['split-form', 'media-focus', 'compact'],
  vehicle_offer: ['split-form', 'media-focus', 'compact'],
  hero_campaign: ['standard', 'media-focus', 'minimal'],
  promo_autohall: ['standard', 'centered'],
  lead_form: ['split', 'stacked'],
  final_cta: ['standard', 'band'],
  cta_band: ['standard', 'compact'],
  vehicle_range: ['grid', 'cards'],
  benefits: ['grid', 'cards'],
  faq: ['standard', 'compact'],
};

const DEFAULTS_BY_BLOCK: Record<string, Partial<NormalizedBlockDesign>> = {
  hero_campaign: { variant: 'standard', tone: 'brand', mediaPosition: 'right', alignment: 'left' },
  hero_form_campaign: { variant: 'split-form', tone: 'light', mediaPosition: 'right', alignment: 'split' },
  promo_autohall: { variant: 'standard', tone: 'dark', alignment: 'left' },
  lead_form: { variant: 'split', tone: 'light', alignment: 'split' },
  cta_band: { variant: 'standard', tone: 'brand', alignment: 'split', ctaStyle: 'white' },
  final_cta: { variant: 'standard', tone: 'brand', alignment: 'center', ctaStyle: 'white' },
  vehicle_offer: { variant: 'split-form', tone: 'light', mediaPosition: 'left', alignment: 'split' },
  vehicle_range: { variant: 'grid', tone: 'light', alignment: 'center' },
  vehicle_features: { variant: 'grid', tone: 'neutral', alignment: 'center' },
  gallery: { variant: 'grid', tone: 'neutral', alignment: 'center' },
  pricing_trim: { variant: 'cards', tone: 'light', alignment: 'center' },
  benefits: { variant: 'grid', tone: 'light', alignment: 'center' },
  trust_bar: { variant: 'standard', tone: 'neutral', alignment: 'center' },
  testimonials: { variant: 'grid', tone: 'neutral', alignment: 'center' },
  faq: { variant: 'standard', tone: 'light', alignment: 'center' },
  footer_legal: { variant: 'standard', tone: 'neutral', alignment: 'center' },
  rich_text: { variant: 'standard', tone: 'light', alignment: 'center' },
  media_only: { variant: 'standard', tone: 'neutral', alignment: 'center', imageShape: 'rounded-card' },
  spacer_divider: { variant: 'standard', tone: 'neutral', alignment: 'center', density: 'comfortable' },
  video_embed: { variant: 'standard', tone: 'neutral', alignment: 'center', imageShape: 'rounded-card' },
};

function pick<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

function pickVariant(blockType: string, value: unknown, fallback: string): string {
  const allowed = VARIANTS_BY_BLOCK[blockType];
  if (!allowed) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

export function getDefaultDesignForBlock(
  blockType: string,
): Partial<NormalizedBlockDesign> {
  return {
    variant: 'standard',
    tone: 'light',
    density: 'comfortable',
    mediaPosition: 'right',
    imageShape: 'rounded-card',
    ctaStyle: 'primary',
    alignment: 'left',
    ...DEFAULTS_BY_BLOCK[blockType],
  };
}

export function normalizeSectionDesign(
  blockType: string,
  props: Record<string, unknown>,
): NormalizedBlockDesign {
  const blockDefaults = getDefaultDesignForBlock(blockType);
  const premium = normalizePremiumDesign(props, blockDefaults as Partial<NormalizedPremiumDesign>);

  const raw =
    props.design && typeof props.design === 'object' && !Array.isArray(props.design)
      ? (props.design as Record<string, unknown>)
      : {};

  const tone = pick(raw.tone, TONES, blockDefaults.tone ?? 'light');
  const alignment = pick(raw.alignment, ALIGNMENTS, blockDefaults.alignment ?? 'left');
  const variant = pickVariant(
    blockType,
    raw.variant,
    blockDefaults.variant ?? 'standard',
  );

  return {
    variant,
    tone,
    density: premium.density,
    mediaPosition: premium.mediaPosition,
    imageShape: premium.imageShape,
    ctaStyle: premium.ctaStyle,
    alignment,
  };
}

export function buildBlockDesignClasses(
  baseClass: string,
  design: NormalizedBlockDesign,
): string {
  const premiumLike = {
    ...design,
    variant: design.variant as NormalizedPremiumDesign['variant'],
    tone: (design.tone === 'neutral' ? 'light' : design.tone) as NormalizedPremiumDesign['tone'],
  };
  const classes = [
    buildPremiumSectionClasses(baseClass, premiumLike),
    `${baseClass}--align-${design.alignment}`,
  ];
  if (design.tone === 'neutral') {
    classes.push(`${baseClass}--tone-neutral`);
  }
  return classes.join(' ');
}

export function buildBlockCtaClass(
  design: NormalizedBlockDesign,
  base = 'lp-btn lp-btn--lg',
): string {
  return buildPremiumCtaClass(
    {
      ...design,
      variant: design.variant as NormalizedPremiumDesign['variant'],
      tone: (design.tone === 'neutral' ? 'light' : design.tone) as NormalizedPremiumDesign['tone'],
    },
    base,
  );
}

export const ACTIVE_V3_BLOCK_TYPES = [
  'hero_campaign',
  'hero_form_campaign',
  'hero_vehicle_offer',
  'campaign_lead_hero',
  'promo_autohall',
  'lead_form',
  'cta_band',
  'final_cta',
  'vehicle_offer',
  'vehicle_range',
  'vehicle_features',
  'gallery',
  'pricing_trim',
  'benefits',
  'trust_bar',
  'testimonials',
  'faq',
  'footer_legal',
  'rich_text',
  'media_only',
  'spacer_divider',
  'video_embed',
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'sticky_lead_cta',
  'campaign_timeline_steps',
] as const;
