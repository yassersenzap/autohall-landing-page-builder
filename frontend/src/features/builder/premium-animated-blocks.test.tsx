import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PREMIUM_ANIMATED_BLOCK_TYPES } from './block-motion';
import { getPremiumAnimatedCatalog } from '@/features/builder-engine/foundation/builder-catalog';
import { getDefaultBlockProps } from '@/features/builder-engine/constants/default-block-props';
import {
  getInspectorControlsForBlock,
  getInspectorControlsForTab,
} from './block-registry/inspector-controls-registry';
import { stripStudioOnlyBlockProps } from './block-variants/studio-block-metadata';
import { CAMPAIGN_PAGE_TEMPLATES } from '@/features/builder-engine/foundation/campaign-page-templates';
import { BlocksCatalogPanel } from '@/features/builder-v3/panels/BlocksCatalogPanel';

describe('premium animated blocks library', () => {
  it('catalog renders premium animated group', () => {
    render(<BlocksCatalogPanel />);
    expect(screen.getByTestId('catalog-premium-animated-group')).toBeTruthy();
    expect(getPremiumAnimatedCatalog().length).toBe(PREMIUM_ANIMATED_BLOCK_TYPES.length);
  });

  it.each(PREMIUM_ANIMATED_BLOCK_TYPES)('block %s can be inserted with defaults', (type) => {
    const props = getDefaultBlockProps(type);
    expect(props).toBeTruthy();
    expect(Object.keys(props).length).toBeGreaterThan(0);
  });

  it.each(PREMIUM_ANIMATED_BLOCK_TYPES)(
    'inspector renders content/design/motion controls for %s',
    (type) => {
      const controls = getInspectorControlsForBlock(type);
      expect(controls.length).toBeGreaterThan(0);
      const contentControls = getInspectorControlsForTab(type, 'content');
      const layoutControls = getInspectorControlsForTab(type, 'layout');
      const designControls = getInspectorControlsForTab(type, 'design');
      expect(contentControls.length + layoutControls.length + designControls.length).toBeGreaterThan(
        0,
      );
      expect(designControls.some((c) => c.group === 'Animation')).toBe(true);
    },
  );

  it('vehicle showcase exposes media controls', () => {
    const mediaControls = getInspectorControlsForTab('vehicle_showcase_split', 'media');
    expect(mediaControls.some((c) => c.type === 'asset')).toBe(true);
  });

  it('motion controls emit sanitized patch keys', () => {
    const motionControls = getInspectorControlsForBlock('premium_bento_features').filter(
      (c) => c.group === 'Animation',
    );
    expect(motionControls.map((c) => c.propKey)).toEqual(
      expect.arrayContaining(['motionPreset', 'motionDuration']),
    );
    const safe = stripStudioOnlyBlockProps({
      motionPreset: 'fade_up',
      motionDuration: 'normal',
      title: 'Test',
    });
    expect(safe._studioAppliedVariantId).toBeUndefined();
    expect(safe.motionPreset).toBe('fade_up');
  });

  it('campaign templates include premium blocks', () => {
    const chery = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'chery-campaign-offer')!;
    const ford = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'ford-offer-campaign')!;
    const opel = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'opel-test-drive')!;
    const generic = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'autohall-generic-campaign')!;

    expect(chery.blocks.some((b) => b.type === 'premium_bento_features')).toBe(true);
    expect(chery.blocks.some((b) => b.type === 'animated_stats_strip')).toBe(true);
    expect(ford.blocks.some((b) => b.type === 'vehicle_showcase_split')).toBe(true);
    expect(ford.blocks.some((b) => b.type === 'premium_bento_features')).toBe(true);
    expect(opel.blocks.some((b) => b.type === 'campaign_timeline_steps')).toBe(true);
    expect(opel.blocks.some((b) => b.type === 'sticky_lead_cta')).toBe(true);
    expect(generic.blocks.some((b) => b.type === 'premium_testimonials')).toBe(true);
    expect(generic.blocks.some((b) => b.type === 'animated_stats_strip')).toBe(true);
  });
});
