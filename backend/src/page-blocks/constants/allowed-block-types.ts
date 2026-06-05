export const ALLOWED_BLOCK_TYPES = [
  'hero_campaign',
  'hero_form_campaign',
  'vehicle_offer',
  'hero',
  'trust_bar',
  'text',
  'image',
  'button',
  'lead_form',
  'benefits',
  'offer_highlights',
  'features',
  'financing',
  'after_sales',
  'testimonials',
  'faq',
  'final_cta',
  'footer_legal',
  'vehicle_range',
] as const;

export type AllowedBlockType = (typeof ALLOWED_BLOCK_TYPES)[number];
