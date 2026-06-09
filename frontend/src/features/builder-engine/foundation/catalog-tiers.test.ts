import { describe, expect, it } from 'vitest';
import { getBuilderCatalog } from './builder-catalog';
import {
  BASIC_BLOCK_TYPES,
  COMPLETE_SECTION_BLOCK_TYPES,
  getBasicBlockCatalog,
  getCompleteSectionCatalog,
} from './catalog-tiers';

describe('catalog-tiers', () => {
  it('splits complete sections from basic blocks without overlap', () => {
    const sections = getCompleteSectionCatalog().map((b) => b.type);
    const basics = getBasicBlockCatalog().map((b) => b.type);

    for (const type of sections) {
      expect(BASIC_BLOCK_TYPES.has(type)).toBe(false);
      expect(COMPLETE_SECTION_BLOCK_TYPES.has(type)).toBe(true);
    }
    for (const type of basics) {
      expect(COMPLETE_SECTION_BLOCK_TYPES.has(type)).toBe(false);
      expect(BASIC_BLOCK_TYPES.has(type)).toBe(true);
    }

    const union = new Set([...sections, ...basics]);
    expect(union.size).toBe(sections.length + basics.length);
  });

  it('covers every catalog block exactly once across tiers', () => {
    const catalogTypes = getBuilderCatalog().map((b) => b.type).sort();
    const tierTypes = [
      ...getCompleteSectionCatalog().map((b) => b.type),
      ...getBasicBlockCatalog().map((b) => b.type),
    ].sort();
    expect(tierTypes).toEqual(catalogTypes);
  });
});
