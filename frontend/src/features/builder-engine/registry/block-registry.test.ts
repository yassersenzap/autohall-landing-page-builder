import { describe, expect, it } from 'vitest';
import { isBackendSupportedBlockType } from './backend-block-types';
import { getActivePaletteBlocks, getRegistryEntry } from './block-registry';

describe('block-registry', () => {
  it('active palette blocks are backend-supported', () => {
    for (const block of getActivePaletteBlocks()) {
      expect(isBackendSupportedBlockType(block.type)).toBe(true);
      expect(block.availability).toBe('stable');
    }
  });

  it('includes hero and lead_form as stable', () => {
    expect(getRegistryEntry('hero')?.availability).toBe('stable');
    expect(getRegistryEntry('lead_form')?.availability).toBe('stable');
  });

  it('marks gallery as disabled', () => {
    expect(getRegistryEntry('gallery')?.availability).toBe('disabled');
  });
});
