import { describe, expect, it } from 'vitest';
import { isBackendSupportedBlockType } from './backend-block-types';
import {
  getActivePaletteBlocks,
  getRegistryEntry,
  isDeliverableBlockType,
} from './block-registry';

/** Types stables exposés via getActivePaletteBlocks (store.addBlock). */
const DELIVERABLE_TYPES = [
  'hero_vehicle_offer',
  'campaign_lead_hero',
  'promo_autohall',
  'vehicle_features',
  'gallery',
  'rich_text',
  'media_only',
  'spacer_divider',
  'video_embed',
  'cta_band',
  'pricing_trim',
  'testimonials',
  'hero_campaign',
  'hero_form_campaign',
  'lead_form',
  'vehicle_offer',
  'vehicle_range',
  'benefits',
  'trust_bar',
  'faq',
  'final_cta',
  'footer_legal',
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'sticky_lead_cta',
  'campaign_timeline_steps',
];

describe('block-registry deliverable palette', () => {
  it('active palette exposes only deliverable campaign blocks', () => {
    const activeTypes = getActivePaletteBlocks().map((b) => b.type).sort();
    expect(activeTypes).toEqual([...DELIVERABLE_TYPES].sort());
  });

  it('deliverable blocks are backend-supported and stable', () => {
    for (const type of DELIVERABLE_TYPES) {
      expect(isDeliverableBlockType(type)).toBe(true);
      expect(isBackendSupportedBlockType(type)).toBe(true);
      expect(getRegistryEntry(type)?.availability).toBe('stable');
    }
  });

  it('hides non-campaign blocks from palette', () => {
    const activeTypes = getActivePaletteBlocks().map((b) => b.type);
    expect(activeTypes).not.toContain('layout_section');
    expect(activeTypes).not.toContain('text');
    expect(activeTypes).not.toContain('image');
    expect(activeTypes).not.toContain('financing');
    expect(activeTypes).not.toContain('features');
  });
});
