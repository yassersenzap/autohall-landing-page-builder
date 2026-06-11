/** Catégories métier du catalogue builder (orientées marketing Auto Hall). */
export const BUILDER_BUSINESS_CATEGORIES = [
  {
    id: 'acquisition',
    label: 'Acquisition / lead capture',
    description: 'Hero, formulaires et bandeaux de conversion.',
  },
  {
    id: 'vehicle',
    label: 'Véhicule / offre',
    description: 'Offres modèle, gammes, galeries et caractéristiques.',
  },
  {
    id: 'sav',
    label: 'SAV / service',
    description: 'Services après-vente et avantages client.',
  },
  {
    id: 'financing',
    label: 'Financement',
    description: 'Finitions, mensualités et offres financement.',
  },
  {
    id: 'event',
    label: 'Événement',
    description: 'Mise en avant temporaire et essais.',
  },
  {
    id: 'social_proof',
    label: 'Preuve sociale',
    description: 'Avis clients, chiffres clés et réassurance.',
  },
  {
    id: 'faq_legal',
    label: 'FAQ / légal',
    description: 'Questions fréquentes et mentions légales.',
  },
  {
    id: 'layout',
    label: 'Mise en page',
    description: 'Texte, visuels, vidéo et espacements.',
  },
] as const;

export type BuilderBusinessCategoryId =
  (typeof BUILDER_BUSINESS_CATEGORIES)[number]['id'];

/** Mapping bloc → catégorie métier (source unique pour le catalogue UI). */
export const BLOCK_BUSINESS_CATEGORY: Record<string, BuilderBusinessCategoryId> = {
  promo_autohall: 'acquisition',
  hero_campaign: 'acquisition',
  hero_form_campaign: 'acquisition',
  hero_vehicle_offer: 'acquisition',
  campaign_lead_hero: 'acquisition',
  lead_form: 'acquisition',
  cta_band: 'acquisition',
  final_cta: 'acquisition',
  vehicle_offer: 'vehicle',
  vehicle_features: 'vehicle',
  vehicle_range: 'vehicle',
  gallery: 'vehicle',
  pricing_trim: 'financing',
  benefits: 'sav',
  testimonials: 'social_proof',
  trust_bar: 'social_proof',
  faq: 'faq_legal',
  footer_legal: 'faq_legal',
  rich_text: 'layout',
  media_only: 'layout',
  spacer_divider: 'layout',
  video_embed: 'layout',
};

export function getBusinessCategoryForBlock(
  blockType: string,
): BuilderBusinessCategoryId {
  return BLOCK_BUSINESS_CATEGORY[blockType] ?? 'layout';
}
