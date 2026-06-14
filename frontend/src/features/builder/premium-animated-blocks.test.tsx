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
import { getAdvancedSectionCatalog } from '@/features/builder-engine/foundation/catalog-tiers';

describe('premium animated blocks library', () => {
  it('catalog no longer shows premium as primary tier', () => {
    render(<BlocksCatalogPanel />);
    expect(screen.queryByTestId('catalog-premium-animated-group')).toBeNull();
    expect(screen.queryByTestId('catalog-advanced-group')).toBeNull();
    expect(screen.getByTestId('catalog-core-business-group')).toBeTruthy();
    expect(screen.getByTestId('catalog-archived-blocks-section')).toBeTruthy();
    expect(getAdvancedSectionCatalog().length).toBeGreaterThan(PREMIUM_ANIMATED_BLOCK_TYPES.length);
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

  it('premium blocks remain available in archived catalog', () => {
    const advancedTypes = getAdvancedSectionCatalog().map((b) => b.type);
    expect(advancedTypes).toEqual(expect.arrayContaining([...PREMIUM_ANIMATED_BLOCK_TYPES]));
    expect(getPremiumAnimatedCatalog().length).toBe(PREMIUM_ANIMATED_BLOCK_TYPES.length);
    expect(advancedTypes).toContain('sticky_lead_cta');
  });

  it('extended campaign templates still include premium blocks', () => {
    const chery = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'chery-campaign-offer')!;
    const ford = CAMPAIGN_PAGE_TEMPLATES.find((t) => t.id === 'ford-offer-campaign')!;
    expect(chery.blocks.some((b) => b.type === 'premium_bento_features')).toBe(true);
    expect(ford.blocks.some((b) => b.type === 'vehicle_showcase_split')).toBe(true);
  });
});
