import { ALLOWED_BLOCK_TYPES } from './allowed-block-types';

describe('ALLOWED_BLOCK_TYPES', () => {
  it('includes V3 studio block types required for API persistence', () => {
    const v3Stable = [
      'promo_autohall',
      'vehicle_features',
      'gallery',
      'rich_text',
      'media_only',
      'spacer_divider',
      'video_embed',
      'cta_band',
      'pricing_trim',
      'hero_campaign',
      'lead_form',
      'final_cta',
    ];

    for (const type of v3Stable) {
      expect(ALLOWED_BLOCK_TYPES).toContain(type);
    }
  });
});
