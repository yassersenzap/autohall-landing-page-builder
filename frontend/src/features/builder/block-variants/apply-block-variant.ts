import { sanitizeBlockTypographyPatch } from '@/features/builder/block-typography';
import { sanitizeSectionStylePatch } from '@/features/builder/section-style/section-style.registry';
import { sanitizeBlockVisualPatch } from '@/features/builder/block-visual';
import type { BlockVariantDefinition } from './block-variant.types';
import { getBlockVariantById } from './block-variant.registry';

const EXPORT_FORBIDDEN_KEYS = new Set([
  'formProviderType',
  'exportTarget',
  'formProviderPreviewMode',
  'formExternalIframeSrc',
  'symfonyFormIncludeKey',
]);

const MEDIA_URL_KEYS = new Set([
  'primaryImage',
  'secondaryImage',
  'mobileImage',
  'heroImage',
  'imageUrl',
  'imageAssetId',
  'videoUrl',
  'posterUrl',
]);

const CONTENT_KEYS_BY_BLOCK: Record<string, ReadonlySet<string>> = {
  campaign_lead_hero: new Set([
    'brandId',
    'campaignTitle',
    'campaignSubtitle',
    'offerBadge',
    'primaryImage',
    'primaryImageAlt',
    'secondaryImage',
    'secondaryImageAlt',
    'mobileImage',
    'formTitle',
    'formSubtitle',
    'formStepLabel',
    'formPrimaryFieldLabel',
    'formCtaLabel',
    'legalText',
    'footerText',
    ...EXPORT_FORBIDDEN_KEYS,
  ]),
  hero_vehicle_offer: new Set([
    'brandId',
    'modelName',
    'headline',
    'subheadline',
    'offerLabel',
    'priceText',
    'primaryCtaLabel',
    'secondaryCtaLabel',
    'heroImage',
    'heroImageAlt',
    'mobileImage',
  ]),
  faq: new Set(['heading', 'subtitle', 'items']),
  cta_band: new Set(['title', 'subtitle', 'buttonText', 'buttonHref', 'buttonTarget']),
  trust_bar: new Set(['metrics', 'trustItems', 'reassurance']),
  footer_legal: new Set(['legalText', 'links']),
};

const VISUAL_PROPS_BY_BLOCK: Record<string, ReadonlySet<string>> = {
  campaign_lead_hero: new Set([
    'layoutVariant',
    'contentPlacement',
    'overlayIntensity',
    'imageFit',
    'imagePosition',
    'cropPreset',
    'focalPointX',
    'focalPointY',
  ]),
  hero_vehicle_offer: new Set([
    'layoutVariant',
    'overlayIntensity',
    'imageFit',
    'imagePosition',
    'cropPreset',
    'focalPointX',
    'focalPointY',
  ]),
};

const CAMPAIGN_LEAD_HERO_DESIGN_KEYS = new Set([
  'tone',
  'showOfferBadge',
  'showProgressBar',
  'formTheme',
]);

const HERO_VEHICLE_OFFER_DESIGN_KEYS = new Set([
  'tone',
  'density',
  'ctaStyle',
  'showOfferBadge',
  'alignContent',
]);

const SECTION_DESIGN_KEYS = new Set([
  'variant',
  'tone',
  'density',
  'mediaPosition',
  'imageShape',
  'ctaStyle',
  'alignment',
]);

const LAYOUT_ENUMS: Record<string, Set<string>> = {
  campaign_lead_hero: new Set([
    'media_left_form_right',
    'form_left_media_right',
    'background_media_form_right',
    'background_media_form_left',
    'dual_media_form_right',
    'dual_media_form_left',
  ]),
  hero_vehicle_offer: new Set([
    'split-media-right',
    'split-media-left',
    'full-bleed-overlay',
    'stacked-mobile',
  ]),
};

function isBlobOrStudioUrl(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:') ||
    lower.includes('/studio/') ||
    lower.includes('localhost')
  );
}

function sanitizeVisualPropValue(
  blockType: string,
  key: string,
  value: unknown,
): unknown | undefined {
  if (EXPORT_FORBIDDEN_KEYS.has(key) || MEDIA_URL_KEYS.has(key)) return undefined;

  if (typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim().slice(0, 120);
  if (!trimmed || isBlobOrStudioUrl(trimmed)) return undefined;

  if (key === 'layoutVariant') {
    const allowed = LAYOUT_ENUMS[blockType];
    return allowed?.has(trimmed) ? trimmed : undefined;
  }

  return trimmed;
}

function sanitizeVisualPropsPatch(
  blockType: string,
  raw: Record<string, unknown> | undefined,
  safeApplyMode: BlockVariantDefinition['safeApplyMode'],
): Record<string, unknown> {
  if (!raw) return {};

  const contentKeys = CONTENT_KEYS_BY_BLOCK[blockType] ?? new Set<string>();
  const visualKeys = VISUAL_PROPS_BY_BLOCK[blockType] ?? new Set<string>();
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (EXPORT_FORBIDDEN_KEYS.has(key) || MEDIA_URL_KEYS.has(key)) continue;
    if (key === 'blockVisual') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sanitized = sanitizeBlockVisualPatch(
          blockType,
          value as Record<string, unknown>,
        );
        if (Object.keys(sanitized).length > 0) {
          out.blockVisual = sanitized;
        }
      }
      continue;
    }
    if (key === 'typography') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sanitized = sanitizeBlockTypographyPatch(
          blockType,
          value as Record<string, unknown>,
        );
        if (Object.keys(sanitized).length > 0) {
          out.typography = sanitized;
        }
      }
      continue;
    }
    if (safeApplyMode !== 'content_optional' && contentKeys.has(key)) continue;
    if (!visualKeys.has(key)) continue;

    const sanitized = sanitizeVisualPropValue(blockType, key, value);
    if (sanitized !== undefined) {
      out[key] = sanitized;
    }
  }

  return out;
}

function sanitizeDesignPatch(
  blockType: string,
  raw: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!raw) return {};

  let allowed: Set<string>;
  if (blockType === 'campaign_lead_hero') {
    allowed = CAMPAIGN_LEAD_HERO_DESIGN_KEYS;
  } else if (blockType === 'hero_vehicle_offer') {
    allowed = HERO_VEHICLE_OFFER_DESIGN_KEYS;
  } else {
    allowed = SECTION_DESIGN_KEYS;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!allowed.has(key)) continue;
    if (key === 'showOfferBadge' || key === 'showProgressBar') {
      if (typeof value === 'boolean') out[key] = value;
      continue;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, 64);
      if (trimmed) out[key] = trimmed;
    }
  }

  return out;
}

export function buildVariantPatchFromDefinition(
  variant: BlockVariantDefinition,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  const propsPatch = sanitizeVisualPropsPatch(
    variant.blockType,
    variant.propsPatch,
    variant.safeApplyMode,
  );
  Object.assign(patch, propsPatch);

  const designPatch = sanitizeDesignPatch(variant.blockType, variant.designPatch);
  if (Object.keys(designPatch).length > 0) {
    patch.design = designPatch;
  }

  if (variant.sectionStylePatch) {
    const sectionStyle = sanitizeSectionStylePatch(variant.sectionStylePatch);
    if (Object.keys(sectionStyle).length > 0) {
      patch.sectionStyle = sectionStyle;
    }
  }

  if (variant.blockVisualPatch) {
    const blockVisual = sanitizeBlockVisualPatch(variant.blockType, variant.blockVisualPatch);
    if (Object.keys(blockVisual).length > 0) {
      patch.blockVisual = blockVisual;
    }
  }

  if (variant.typographyPatch) {
    const typography = sanitizeBlockTypographyPatch(variant.blockType, variant.typographyPatch);
    if (Object.keys(typography).length > 0) {
      patch.typography = typography;
    }
  }

  return patch;
}

export function mergeVariantPatchIntoProps(
  currentProps: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...currentProps, ...patch };

  if (patch.design && typeof patch.design === 'object' && !Array.isArray(patch.design)) {
    const prev =
      currentProps.design &&
      typeof currentProps.design === 'object' &&
      !Array.isArray(currentProps.design)
        ? (currentProps.design as Record<string, unknown>)
        : {};
    merged.design = { ...prev, ...(patch.design as Record<string, unknown>) };
  }

  if (
    patch.sectionStyle &&
    typeof patch.sectionStyle === 'object' &&
    !Array.isArray(patch.sectionStyle)
  ) {
    const prev =
      currentProps.sectionStyle &&
      typeof currentProps.sectionStyle === 'object' &&
      !Array.isArray(currentProps.sectionStyle)
        ? (currentProps.sectionStyle as Record<string, unknown>)
        : {};
    merged.sectionStyle = { ...prev, ...(patch.sectionStyle as Record<string, unknown>) };
  }

  if (
    patch.blockVisual &&
    typeof patch.blockVisual === 'object' &&
    !Array.isArray(patch.blockVisual)
  ) {
    const prev =
      currentProps.blockVisual &&
      typeof currentProps.blockVisual === 'object' &&
      !Array.isArray(currentProps.blockVisual)
        ? (currentProps.blockVisual as Record<string, unknown>)
        : {};
    merged.blockVisual = { ...prev, ...(patch.blockVisual as Record<string, unknown>) };
  }

  if (
    patch.typography &&
    typeof patch.typography === 'object' &&
    !Array.isArray(patch.typography)
  ) {
    const prev =
      currentProps.typography &&
      typeof currentProps.typography === 'object' &&
      !Array.isArray(currentProps.typography)
        ? (currentProps.typography as Record<string, unknown>)
        : {};
    merged.typography = { ...prev, ...(patch.typography as Record<string, unknown>) };
  }

  return merged;
}

/**
 * Builds a safe props patch for a block variant.
 * Returns null when the variant id is unknown or mismatched to blockType.
 */
export function applyBlockVariantSafely(
  blockType: string,
  _currentProps: Record<string, unknown>,
  variantId: string,
): Record<string, unknown> | null {
  const variant = getBlockVariantById(variantId);
  if (!variant || variant.blockType !== blockType) return null;

  const patch = buildVariantPatchFromDefinition(variant);
  if (Object.keys(patch).length === 0) return null;

  return patch;
}
