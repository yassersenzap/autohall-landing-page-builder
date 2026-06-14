/** Bloc landing métier — tier archive UI, sémantique métier conservée pour readiness/export. */
export const CORE_BUSINESS_BLOCK_TYPES = new Set(['core_campaign_form_landing']);

/** Sections optionnelles autour de la landing métier (sans doublons hero/form/CTA). */
export const COMPLEMENTARY_SECTION_BLOCK_TYPES = new Set([
  'footer_legal',
  'faq',
  'benefits',
  'trust_bar',
  'testimonials',
  'vehicle_features',
  'gallery',
  'vehicle_range',
  'pricing_trim',
  'cta_band',
]);

/**
 * Anciens blocs hero / conversion — masqués du parcours marketeur principal,
 * regroupés dans « Blocs archivés », rendu/export conservés pour pages JSON existantes.
 */
export const LEGACY_BLOCK_TYPES = new Set([
  'campaign_lead_hero',
  'lead_form',
  'hero_form_campaign',
  'sticky_lead_cta',
  'hero_campaign',
  'promo_autohall',
  'hero_vehicle_offer',
  'vehicle_offer',
  'final_cta',
]);

/** Blocs atomiques et premium — tier archive UI. */
export const ARCHIVED_BASIC_BLOCK_TYPES = new Set([
  'rich_text',
  'media_only',
  'spacer_divider',
  'video_embed',
]);

export const ARCHIVED_PREMIUM_BLOCK_TYPES = new Set([
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'campaign_timeline_steps',
]);

/**
 * Palette archive complète — insertable via panneau « Blocs archivés ».
 */
export const ARCHIVED_CATALOG_BLOCK_TYPES = new Set([
  ...CORE_BUSINESS_BLOCK_TYPES,
  ...COMPLEMENTARY_SECTION_BLOCK_TYPES,
  ...LEGACY_BLOCK_TYPES,
  ...ARCHIVED_BASIC_BLOCK_TYPES,
  ...ARCHIVED_PREMIUM_BLOCK_TYPES,
]);

/** @deprecated use LEGACY_BLOCK_TYPES */
export const MAIN_CATALOG_HIDDEN_BLOCK_TYPES = LEGACY_BLOCK_TYPES;

export function isLegacyBlockType(blockType: string): boolean {
  return LEGACY_BLOCK_TYPES.has(blockType);
}

/** @deprecated use isLegacyBlockType */
export function isMainCatalogHidden(blockType: string): boolean {
  return isLegacyBlockType(blockType);
}

export function isCoreBusinessBlock(blockType: string): boolean {
  return CORE_BUSINESS_BLOCK_TYPES.has(blockType);
}

export function isComplementaryBlockType(blockType: string): boolean {
  return COMPLEMENTARY_SECTION_BLOCK_TYPES.has(blockType);
}

export function isArchivedCatalogBlock(blockType: string): boolean {
  return ARCHIVED_CATALOG_BLOCK_TYPES.has(blockType);
}

export function isActiveCatalogBlock(_blockType: string): boolean {
  return false;
}
