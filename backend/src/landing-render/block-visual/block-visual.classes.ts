/**
 * Backend mirror of frontend block-visual class builders.
 * Keep in sync with frontend/src/features/builder/block-visual/block-visual.registry.ts
 */

import { normalizeFormPosition } from '../campaign-lead-hero-layout';

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

function visualMod(prefix: string, key: string, value: string): string | null {
  if (!SAFE_CLASS_TOKEN.test(value)) return null;
  return `${prefix}--bv-${key}-${value}`;
}

function parseCampaignLeadHeroBlockVisual(propsJson: Record<string, unknown>) {
  const raw = readBlockVisualRaw(propsJson);
  const layoutVariant =
    typeof propsJson.layoutVariant === 'string' ? propsJson.layoutVariant : 'media_left_form_right';
  return {
    heroHeight: pickEnum(raw.heroHeight, ['compact', 'default', 'tall', 'viewport'] as const, 'default'),
    formWidth: pickEnum(raw.formWidth, ['sm', 'md', 'lg'] as const, 'md'),
    formPosition: normalizeFormPosition(layoutVariant, raw.formPosition),
    mediaRatio: pickEnum(
      raw.mediaRatio,
      ['portrait', 'square', 'landscape', 'cinematic', 'full'] as const,
      'landscape',
    ),
    mediaEmphasis: pickEnum(
      raw.mediaEmphasis,
      ['balanced', 'media_focus', 'form_focus'] as const,
      'balanced',
    ),
    contentMaxWidth: pickEnum(raw.contentMaxWidth, ['sm', 'md', 'lg'] as const, 'md'),
    formCardStyle: pickEnum(
      raw.formCardStyle,
      ['flat', 'elevated', 'glass', 'bordered'] as const,
      'elevated',
    ),
    verticalAlignment: pickEnum(raw.verticalAlignment, ['top', 'center', 'bottom'] as const, 'center'),
  };
}

function parseHeroVehicleOfferBlockVisual(raw: Record<string, unknown>) {
  return {
    heroHeight: pickEnum(raw.heroHeight, ['compact', 'default', 'tall'] as const, 'default'),
    vehicleImageScale: pickEnum(raw.vehicleImageScale, ['sm', 'md', 'lg', 'xl'] as const, 'lg'),
    vehicleImagePosition: pickEnum(
      raw.vehicleImagePosition,
      ['left', 'center', 'right'] as const,
      'right',
    ),
    offerCardStyle: pickEnum(
      raw.offerCardStyle,
      ['flat', 'elevated', 'bordered', 'glass'] as const,
      'flat',
    ),
    priceEmphasis: pickEnum(raw.priceEmphasis, ['subtle', 'standard', 'strong'] as const, 'standard'),
    layoutEmphasis: pickEnum(
      raw.layoutEmphasis,
      ['vehicle_focus', 'offer_focus', 'balanced'] as const,
      'balanced',
    ),
    badgePlacement: pickEnum(raw.badgePlacement, ['top', 'media', 'content'] as const, 'top'),
  };
}

function parseFaqBlockVisual(raw: Record<string, unknown>) {
  return {
    faqStyle: pickEnum(raw.faqStyle, ['clean', 'boxed', 'divided'] as const, 'clean'),
    faqDensity: pickEnum(raw.faqDensity, ['compact', 'comfortable', 'spacious'] as const, 'comfortable'),
    iconStyle: pickEnum(raw.iconStyle, ['plus', 'chevron', 'none'] as const, 'chevron'),
  };
}

function parseCtaBandBlockVisual(raw: Record<string, unknown>) {
  return {
    ctaLayout: pickEnum(raw.ctaLayout, ['inline', 'stacked', 'split'] as const, 'inline'),
    ctaIntensity: pickEnum(raw.ctaIntensity, ['subtle', 'brand', 'dark'] as const, 'brand'),
    ctaAlignment: pickEnum(raw.ctaAlignment, ['left', 'center'] as const, 'center'),
  };
}

function parseTrustBarBlockVisual(raw: Record<string, unknown>) {
  return {
    trustLayout: pickEnum(raw.trustLayout, ['row', 'grid'] as const, 'row'),
    trustDensity: pickEnum(raw.trustDensity, ['compact', 'comfortable'] as const, 'comfortable'),
    trustStyle: pickEnum(raw.trustStyle, ['minimal', 'cards', 'premium'] as const, 'minimal'),
  };
}

function buildCampaignLeadHeroClasses(
  visual: ReturnType<typeof parseCampaignLeadHeroBlockVisual>,
): string[] {
  const prefix = 'lp-campaign-lead-hero';
  return [
    visualMod(prefix, 'height', visual.heroHeight),
    visualMod(prefix, 'form-width', visual.formWidth),
    visualMod(prefix, 'media-ratio', visual.mediaRatio),
    visualMod(prefix, 'media-emphasis', visual.mediaEmphasis),
    visualMod(prefix, 'content-max-width', visual.contentMaxWidth),
    visualMod(prefix, 'form-card', visual.formCardStyle),
    visualMod(prefix, 'vertical-align', visual.verticalAlignment),
  ].filter((c): c is string => c !== null);
}

function buildHeroVehicleOfferClasses(visual: ReturnType<typeof parseHeroVehicleOfferBlockVisual>): string[] {
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

function buildFaqClasses(visual: ReturnType<typeof parseFaqBlockVisual>): string[] {
  const prefix = 'lp-faq';
  return [
    visualMod(prefix, 'style', visual.faqStyle),
    visualMod(prefix, 'density', visual.faqDensity),
    visualMod(prefix, 'icon', visual.iconStyle),
  ].filter((c): c is string => c !== null);
}

function buildCtaBandClasses(visual: ReturnType<typeof parseCtaBandBlockVisual>): string[] {
  const prefix = 'lp-cta-band';
  return [
    visualMod(prefix, 'layout', visual.ctaLayout),
    visualMod(prefix, 'intensity', visual.ctaIntensity),
    visualMod(prefix, 'alignment', visual.ctaAlignment),
  ].filter((c): c is string => c !== null);
}

function buildTrustBarClasses(visual: ReturnType<typeof parseTrustBarBlockVisual>): string[] {
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
  const raw = readBlockVisualRaw(propsJson);
  switch (blockType) {
    case 'campaign_lead_hero':
      return buildCampaignLeadHeroClasses(parseCampaignLeadHeroBlockVisual(propsJson));
    case 'hero_vehicle_offer':
      return buildHeroVehicleOfferClasses(parseHeroVehicleOfferBlockVisual(raw));
    case 'faq':
      return buildFaqClasses(parseFaqBlockVisual(raw));
    case 'cta_band':
      return buildCtaBandClasses(parseCtaBandBlockVisual(raw));
    case 'trust_bar':
      return buildTrustBarClasses(parseTrustBarBlockVisual(raw));
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
