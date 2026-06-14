import { describe, expect, it } from 'vitest';
import {
  isBlockGloballyHidden,
  isBlockHiddenInStudio,
  isBlockHiddenOnViewport,
  isBlockVisibilitySupported,
  shouldOmitBlockFromPublishedOutput,
} from './block-visibility';
import { readBlockHidden, withBlockHiddenToggle } from '../types/block-props.types';

describe('block-visibility', () => {
  it('supports visibility controls for every block type', () => {
    expect(isBlockVisibilitySupported('core_campaign_form_landing')).toBe(true);
    expect(isBlockVisibilitySupported('rich_text')).toBe(true);
    expect(isBlockVisibilitySupported('hero_campaign')).toBe(true);
    expect(isBlockVisibilitySupported('unknown_block')).toBe(true);
  });

  it('BaseBlockProps helpers toggle hidden immutably', () => {
    const props = { title: 'Demo' };
    expect(readBlockHidden(props)).toBe(false);
    expect(withBlockHiddenToggle(props)).toEqual({ hidden: true });
    expect(withBlockHiddenToggle({ hidden: true })).toEqual({ hidden: false });
  });

  it('detects global hidden flag', () => {
    expect(isBlockGloballyHidden({ hidden: true })).toBe(true);
    expect(isBlockGloballyHidden({ hidden: false })).toBe(false);
    expect(isBlockGloballyHidden({})).toBe(false);
  });

  it('detects viewport-specific sectionStyle hide flags', () => {
    const props = { sectionStyle: { hideOnMobile: true } };
    expect(isBlockHiddenOnViewport(props, 'mobile')).toBe(true);
    expect(isBlockHiddenOnViewport(props, 'desktop')).toBe(false);
  });

  it('studio hidden combines global and responsive flags', () => {
    expect(isBlockHiddenInStudio({ hidden: true }, 'desktop')).toBe(true);
    expect(
      isBlockHiddenInStudio({ sectionStyle: { hideOnDesktop: true } }, 'desktop'),
    ).toBe(true);
  });

  it('omits globally hidden blocks from published output', () => {
    expect(shouldOmitBlockFromPublishedOutput({ hidden: true })).toBe(true);
    expect(shouldOmitBlockFromPublishedOutput({})).toBe(false);
    expect(
      shouldOmitBlockFromPublishedOutput({ sectionStyle: { hideOnMobile: true } }, 'mobile'),
    ).toBe(true);
  });
});
