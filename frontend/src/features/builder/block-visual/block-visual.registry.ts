/** Block-specific visual adjustment props — render + export safe. */

import {
  normalizeFormPosition,
  shouldEmitFormPositionVisualClass,
} from '../blocks/campaign-lead-hero/campaign-lead-hero-layout';

export type CampaignLeadHeroBlockVisual = {
  heroHeight: 'compact' | 'default' | 'tall' | 'viewport';
  formWidth: 'sm' | 'md' | 'lg';
  formPosition: 'left' | 'right';
  mediaRatio: 'portrait' | 'square' | 'landscape' | 'cinematic' | 'full';
  mediaEmphasis: 'balanced' | 'media_focus' | 'form_focus';
  contentMaxWidth: 'sm' | 'md' | 'lg';
  formCardStyle: 'flat' | 'elevated' | 'glass' | 'bordered';
  verticalAlignment: 'top' | 'center' | 'bottom';
};

export type HeroVehicleOfferBlockVisual = {
  heroHeight: 'compact' | 'default' | 'tall';
  vehicleImageScale: 'sm' | 'md' | 'lg' | 'xl';
  vehicleImagePosition: 'left' | 'center' | 'right';
  offerCardStyle: 'flat' | 'elevated' | 'bordered' | 'glass';
  priceEmphasis: 'subtle' | 'standard' | 'strong';
  layoutEmphasis: 'vehicle_focus' | 'offer_focus' | 'balanced';
  badgePlacement: 'top' | 'media' | 'content';
};

export type FaqBlockVisual = {
  faqStyle: 'clean' | 'boxed' | 'divided';
  faqDensity: 'compact' | 'comfortable' | 'spacious';
  iconStyle: 'plus' | 'chevron' | 'none';
};

export type CtaBandBlockVisual = {
  ctaLayout: 'inline' | 'stacked' | 'split';
  ctaIntensity: 'subtle' | 'brand' | 'dark';
  ctaAlignment: 'left' | 'center';
};

export type TrustBarBlockVisual = {
  trustLayout: 'row' | 'grid';
  trustDensity: 'compact' | 'comfortable';
  trustStyle: 'minimal' | 'cards' | 'premium';
};

export const BLOCK_VISUAL_SUPPORTED_TYPES = new Set([
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'faq',
  'cta_band',
  'trust_bar',
]);

const SAFE_CLASS_TOKEN = /^[a-z0-9_]+$/;

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function readBlockVisualRaw(
  propsJson: Record<string, unknown>,
): Record<string, unknown> {
  const raw = propsJson.blockVisual;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export const campaignLeadHeroBlockVisualDefaults: CampaignLeadHeroBlockVisual = {
  heroHeight: 'default',
  formWidth: 'md',
  formPosition: 'right',
  mediaRatio: 'landscape',
  mediaEmphasis: 'balanced',
  contentMaxWidth: 'md',
  formCardStyle: 'elevated',
  verticalAlignment: 'center',
};

export const heroVehicleOfferBlockVisualDefaults: HeroVehicleOfferBlockVisual = {
  heroHeight: 'default',
  vehicleImageScale: 'lg',
  vehicleImagePosition: 'right',
  offerCardStyle: 'flat',
  priceEmphasis: 'standard',
  layoutEmphasis: 'balanced',
  badgePlacement: 'top',
};

export const faqBlockVisualDefaults: FaqBlockVisual = {
  faqStyle: 'clean',
  faqDensity: 'comfortable',
  iconStyle: 'chevron',
};

export const ctaBandBlockVisualDefaults: CtaBandBlockVisual = {
  ctaLayout: 'inline',
  ctaIntensity: 'brand',
  ctaAlignment: 'center',
};

export const trustBarBlockVisualDefaults: TrustBarBlockVisual = {
  trustLayout: 'row',
  trustDensity: 'comfortable',
  trustStyle: 'minimal',
};

const CAMPAIGN_LEAD_HERO_KEYS = new Set(Object.keys(campaignLeadHeroBlockVisualDefaults));
const HERO_VEHICLE_OFFER_KEYS = new Set(Object.keys(heroVehicleOfferBlockVisualDefaults));
const FAQ_KEYS = new Set(Object.keys(faqBlockVisualDefaults));
const CTA_BAND_KEYS = new Set(Object.keys(ctaBandBlockVisualDefaults));
const TRUST_BAR_KEYS = new Set(Object.keys(trustBarBlockVisualDefaults));

function allowedKeysForBlock(blockType: string): Set<string> | null {
  switch (blockType) {
    case 'campaign_lead_hero':
      return CAMPAIGN_LEAD_HERO_KEYS;
    case 'hero_vehicle_offer':
      return HERO_VEHICLE_OFFER_KEYS;
    case 'faq':
      return FAQ_KEYS;
    case 'cta_band':
      return CTA_BAND_KEYS;
    case 'trust_bar':
      return TRUST_BAR_KEYS;
    default:
      return null;
  }
}

export function parseCampaignLeadHeroBlockVisual(
  propsJson: Record<string, unknown>,
): CampaignLeadHeroBlockVisual {
  const raw = readBlockVisualRaw(propsJson);
  const d = campaignLeadHeroBlockVisualDefaults;
  const layoutVariant =
    typeof propsJson.layoutVariant === 'string' ? propsJson.layoutVariant : 'media_left_form_right';
  const formPosition = normalizeFormPosition(layoutVariant, raw.formPosition ?? d.formPosition);

  return {
    heroHeight: pickEnum(raw.heroHeight, ['compact', 'default', 'tall', 'viewport'], d.heroHeight),
    formWidth: pickEnum(raw.formWidth, ['sm', 'md', 'lg'], d.formWidth),
    formPosition,
    mediaRatio: pickEnum(
      raw.mediaRatio,
      ['portrait', 'square', 'landscape', 'cinematic', 'full'],
      d.mediaRatio,
    ),
    mediaEmphasis: pickEnum(
      raw.mediaEmphasis,
      ['balanced', 'media_focus', 'form_focus'],
      d.mediaEmphasis,
    ),
    contentMaxWidth: pickEnum(raw.contentMaxWidth, ['sm', 'md', 'lg'], d.contentMaxWidth),
    formCardStyle: pickEnum(
      raw.formCardStyle,
      ['flat', 'elevated', 'glass', 'bordered'],
      d.formCardStyle,
    ),
    verticalAlignment: pickEnum(raw.verticalAlignment, ['top', 'center', 'bottom'], d.verticalAlignment),
  };
}

export function parseHeroVehicleOfferBlockVisual(
  propsJson: Record<string, unknown>,
): HeroVehicleOfferBlockVisual {
  const raw = readBlockVisualRaw(propsJson);
  const d = heroVehicleOfferBlockVisualDefaults;
  return {
    heroHeight: pickEnum(raw.heroHeight, ['compact', 'default', 'tall'], d.heroHeight),
    vehicleImageScale: pickEnum(raw.vehicleImageScale, ['sm', 'md', 'lg', 'xl'], d.vehicleImageScale),
    vehicleImagePosition: pickEnum(
      raw.vehicleImagePosition,
      ['left', 'center', 'right'],
      d.vehicleImagePosition,
    ),
    offerCardStyle: pickEnum(
      raw.offerCardStyle,
      ['flat', 'elevated', 'bordered', 'glass'],
      d.offerCardStyle,
    ),
    priceEmphasis: pickEnum(raw.priceEmphasis, ['subtle', 'standard', 'strong'], d.priceEmphasis),
    layoutEmphasis: pickEnum(
      raw.layoutEmphasis,
      ['vehicle_focus', 'offer_focus', 'balanced'],
      d.layoutEmphasis,
    ),
    badgePlacement: pickEnum(raw.badgePlacement, ['top', 'media', 'content'], d.badgePlacement),
  };
}

export function parseFaqBlockVisual(propsJson: Record<string, unknown>): FaqBlockVisual {
  const raw = readBlockVisualRaw(propsJson);
  const d = faqBlockVisualDefaults;
  return {
    faqStyle: pickEnum(raw.faqStyle, ['clean', 'boxed', 'divided'], d.faqStyle),
    faqDensity: pickEnum(raw.faqDensity, ['compact', 'comfortable', 'spacious'], d.faqDensity),
    iconStyle: pickEnum(raw.iconStyle, ['plus', 'chevron', 'none'], d.iconStyle),
  };
}

export function parseCtaBandBlockVisual(propsJson: Record<string, unknown>): CtaBandBlockVisual {
  const raw = readBlockVisualRaw(propsJson);
  const d = ctaBandBlockVisualDefaults;
  return {
    ctaLayout: pickEnum(raw.ctaLayout, ['inline', 'stacked', 'split'], d.ctaLayout),
    ctaIntensity: pickEnum(raw.ctaIntensity, ['subtle', 'brand', 'dark'], d.ctaIntensity),
    ctaAlignment: pickEnum(raw.ctaAlignment, ['left', 'center'], d.ctaAlignment),
  };
}

export function parseTrustBarBlockVisual(propsJson: Record<string, unknown>): TrustBarBlockVisual {
  const raw = readBlockVisualRaw(propsJson);
  const d = trustBarBlockVisualDefaults;
  return {
    trustLayout: pickEnum(raw.trustLayout, ['row', 'grid'], d.trustLayout),
    trustDensity: pickEnum(raw.trustDensity, ['compact', 'comfortable'], d.trustDensity),
    trustStyle: pickEnum(raw.trustStyle, ['minimal', 'cards', 'premium'], d.trustStyle),
  };
}

function visualMod(prefix: string, key: string, value: string): string | null {
  if (!SAFE_CLASS_TOKEN.test(value)) return null;
  return `${prefix}--bv-${key}-${value}`;
}

export function buildCampaignLeadHeroBlockVisualClasses(
  visual: CampaignLeadHeroBlockVisual,
  layoutVariant = 'media_left_form_right',
): string[] {
  const prefix = 'lp-campaign-lead-hero';
  const classes = [
    visualMod(prefix, 'height', visual.heroHeight),
    visualMod(prefix, 'form-width', visual.formWidth),
    shouldEmitFormPositionVisualClass(layoutVariant)
      ? visualMod(prefix, 'form-position', visual.formPosition)
      : null,
    visualMod(prefix, 'media-ratio', visual.mediaRatio),
    visualMod(prefix, 'media-emphasis', visual.mediaEmphasis),
    visualMod(prefix, 'content-max-width', visual.contentMaxWidth),
    visualMod(prefix, 'form-card', visual.formCardStyle),
    visualMod(prefix, 'vertical-align', visual.verticalAlignment),
  ].filter((c): c is string => c !== null);

  return classes;
}

export function buildHeroVehicleOfferBlockVisualClasses(
  visual: HeroVehicleOfferBlockVisual,
): string[] {
  const prefix = 'lp-hero-vehicle-offer';
  return [
    visualMod(prefix, 'height', visual.heroHeight),
    visualMod(prefix, 'image-scale', visual.vehicleImageScale),
    visualMod(prefix, 'image-position', visual.vehicleImagePosition),
    visualMod(prefix, 'offer-card', visual.offerCardStyle),
    visualMod(prefix, 'price-emphasis', visual.priceEmphasis),
    visualMod(prefix, 'layout-emphasis', visual.layoutEmphasis),
    visualMod(prefix, 'badge-placement', visual.badgePlacement),
  ].filter((c): c is string => c !== null);
}

export function buildFaqBlockVisualClasses(visual: FaqBlockVisual): string[] {
  const prefix = 'lp-faq';
  return [
    visualMod(prefix, 'style', visual.faqStyle),
    visualMod(prefix, 'density', visual.faqDensity),
    visualMod(prefix, 'icon', visual.iconStyle),
  ].filter((c): c is string => c !== null);
}

export function buildCtaBandBlockVisualClasses(visual: CtaBandBlockVisual): string[] {
  const prefix = 'lp-cta-band';
  return [
    visualMod(prefix, 'layout', visual.ctaLayout),
    visualMod(prefix, 'intensity', visual.ctaIntensity),
    visualMod(prefix, 'alignment', visual.ctaAlignment),
  ].filter((c): c is string => c !== null);
}

export function buildTrustBarBlockVisualClasses(visual: TrustBarBlockVisual): string[] {
  const prefix = 'lp-trust-bar';
  return [
    visualMod(prefix, 'layout', visual.trustLayout),
    visualMod(prefix, 'density', visual.trustDensity),
    visualMod(prefix, 'style', visual.trustStyle),
  ].filter((c): c is string => c !== null);
}

export function buildBlockVisualClasses(
  blockType: string,
  propsJson: Record<string, unknown>,
): string[] {
  switch (blockType) {
    case 'campaign_lead_hero':
      return buildCampaignLeadHeroBlockVisualClasses(
        parseCampaignLeadHeroBlockVisual(propsJson),
        typeof propsJson.layoutVariant === 'string' ? propsJson.layoutVariant : undefined,
      );
    case 'hero_vehicle_offer':
      return buildHeroVehicleOfferBlockVisualClasses(parseHeroVehicleOfferBlockVisual(propsJson));
    case 'faq':
      return buildFaqBlockVisualClasses(parseFaqBlockVisual(propsJson));
    case 'cta_band':
      return buildCtaBandBlockVisualClasses(parseCtaBandBlockVisual(propsJson));
    case 'trust_bar':
      return buildTrustBarBlockVisualClasses(parseTrustBarBlockVisual(propsJson));
    default:
      return [];
  }
}

export function appendBlockVisualToClass(
  blockType: string,
  baseClass: string,
  propsJson: Record<string, unknown>,
): string {
  const extra = buildBlockVisualClasses(blockType, propsJson);
  if (extra.length === 0) return baseClass;
  return `${baseClass} ${extra.join(' ')}`;
}

export function sanitizeBlockVisualPatch(
  blockType: string,
  patch: Record<string, unknown> | undefined,
  contextProps?: Record<string, unknown>,
): Record<string, unknown> {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return {};

  const allowed = allowedKeysForBlock(blockType);
  if (!allowed) return {};

  const out: Record<string, unknown> = {};
  const mergeProps = contextProps
    ? {
        ...contextProps,
        blockVisual: {
          ...readBlockVisualRaw(contextProps),
          ...patch,
        },
      }
    : { blockVisual: patch };

  if (blockType === 'campaign_lead_hero') {
    const parsed = parseCampaignLeadHeroBlockVisual(mergeProps);
    for (const key of allowed) {
      if (key in patch) {
        out[key] = parsed[key as keyof CampaignLeadHeroBlockVisual];
      }
    }
    return out;
  }

  if (blockType === 'hero_vehicle_offer') {
    const parsed = parseHeroVehicleOfferBlockVisual({ blockVisual: patch });
    for (const key of allowed) {
      if (key in patch) {
        out[key] = parsed[key as keyof HeroVehicleOfferBlockVisual];
      }
    }
    return out;
  }

  if (blockType === 'faq') {
    const parsed = parseFaqBlockVisual({ blockVisual: patch });
    for (const key of allowed) {
      if (key in patch) {
        out[key] = parsed[key as keyof FaqBlockVisual];
      }
    }
    return out;
  }

  if (blockType === 'cta_band') {
    const parsed = parseCtaBandBlockVisual({ blockVisual: patch });
    for (const key of allowed) {
      if (key in patch) {
        out[key] = parsed[key as keyof CtaBandBlockVisual];
      }
    }
    return out;
  }

  if (blockType === 'trust_bar') {
    const parsed = parseTrustBarBlockVisual({ blockVisual: patch });
    for (const key of allowed) {
      if (key in patch) {
        out[key] = parsed[key as keyof TrustBarBlockVisual];
      }
    }
    return out;
  }

  return out;
}

export function sanitizeBlockVisualPatchUnion(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  for (const blockType of BLOCK_VISUAL_SUPPORTED_TYPES) {
    const sanitized = sanitizeBlockVisualPatch(blockType, patch);
    if (Object.keys(sanitized).length > 0) return sanitized;
  }
  return {};
}

export function hasBlockVisualControls(blockType: string): boolean {
  return BLOCK_VISUAL_SUPPORTED_TYPES.has(blockType);
}
