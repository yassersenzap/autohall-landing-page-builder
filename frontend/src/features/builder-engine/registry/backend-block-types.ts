/** Types de blocs réellement rendus par landing-render (preview + export). */
export const BACKEND_SUPPORTED_BLOCK_TYPES = new Set([
  'hero',
  'lead_form',
  'trust_bar',
  'features',
  'final_cta',
  'footer_legal',
  'text',
  'image',
  'faq',
  'benefits',
  'offer_highlights',
  'financing',
  'after_sales',
  'testimonials',
  'button',
]);

export function isBackendSupportedBlockType(type: string): boolean {
  return BACKEND_SUPPORTED_BLOCK_TYPES.has(type.toLowerCase());
}
