/** Bloc métier principal — visible en tête du catalogue. */
export const CORE_BUSINESS_BLOCK_TYPES = new Set(['core_campaign_form_landing']);

/** Blocs complémentaires utiles (hors doublons formulaire/CTA). */
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
  'final_cta',
  'hero_vehicle_offer',
  'vehicle_offer',
  'promo_autohall',
]);

/** Doublons ou patterns legacy — masqués du parcours principal, rendu conservé. */
export const MAIN_CATALOG_HIDDEN_BLOCK_TYPES = new Set([
  'campaign_lead_hero',
  'lead_form',
  'hero_form_campaign',
  'sticky_lead_cta',
  'hero_campaign',
]);

export function isMainCatalogHidden(blockType: string): boolean {
  return MAIN_CATALOG_HIDDEN_BLOCK_TYPES.has(blockType);
}

export function isCoreBusinessBlock(blockType: string): boolean {
  return CORE_BUSINESS_BLOCK_TYPES.has(blockType);
}
