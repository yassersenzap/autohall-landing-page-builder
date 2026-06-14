import { describe, expect, it } from 'vitest';
import { getInsertablePaletteBlocks } from '../registry/block-registry';
import { getBuilderCatalog, getArchivedBuilderCatalog } from './builder-catalog';
import { ARCHIVED_BASIC_BLOCK_TYPES } from './catalog-visibility';
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
      expect(ARCHIVED_BASIC_BLOCK_TYPES.has(type)).toBe(true);
    }

    const union = new Set([...sections, ...basics]);
    expect(union.size).toBe(sections.length + basics.length);
  });

  it('covers every insertable block across active and archived tiers', () => {
    const activeTypes = getBuilderCatalog().map((b) => b.type);
    const archivedTypes = getArchivedBuilderCatalog().map((b) => b.type);
    const insertableTypes = getInsertablePaletteBlocks().map((b) => b.type).sort();
    expect([...activeTypes, ...archivedTypes].sort()).toEqual(insertableTypes);
  });
});
