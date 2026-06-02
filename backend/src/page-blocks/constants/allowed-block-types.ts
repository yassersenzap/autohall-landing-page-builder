export const ALLOWED_BLOCK_TYPES = [
  'hero',
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
] as const;

export type AllowedBlockType = (typeof ALLOWED_BLOCK_TYPES)[number];
