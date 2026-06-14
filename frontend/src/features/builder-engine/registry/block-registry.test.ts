import { describe, expect, it } from 'vitest';
import { isBackendSupportedBlockType } from './backend-block-types';
import {
  ARCHIVED_CATALOG_BLOCK_TYPES,
  LEGACY_BLOCK_TYPES,
} from '../foundation/catalog-visibility';
import {
  getActivePaletteBlocks,
  getInsertablePaletteBlocks,
  getLegacyPaletteBlocks,
  getRegistryEntry,
  isDeliverableBlockType,
  isInsertableBlockType,
} from './block-registry';

describe('block-registry deliverable palette', () => {
  it('active palette is empty while catalog is fully archived', () => {
    expect(getActivePaletteBlocks().map((b) => b.type)).toEqual([]);
  });

  it('legacy palette matches archived catalog taxonomy', () => {
    const legacyTypes = getLegacyPaletteBlocks().map((b) => b.type).sort();
    const expected = [...ARCHIVED_CATALOG_BLOCK_TYPES]
      .filter((type) => isBackendSupportedBlockType(type))
      .sort();
    expect(legacyTypes).toEqual(expected);
  });

  it('insertable palette matches archived catalog', () => {
    const insertable = getInsertablePaletteBlocks().map((b) => b.type).sort();
    const expected = [...ARCHIVED_CATALOG_BLOCK_TYPES]
      .filter((type) => isBackendSupportedBlockType(type))
      .sort();
    expect(insertable).toEqual(expected);
  });

  it('archived blocks are backend-supported with availability legacy', () => {
    for (const type of ARCHIVED_CATALOG_BLOCK_TYPES) {
      if (!isBackendSupportedBlockType(type)) continue;
      expect(isInsertableBlockType(type)).toBe(true);
      expect(isDeliverableBlockType(type)).toBe(true);
      expect(isBackendSupportedBlockType(type)).toBe(true);
      expect(getRegistryEntry(type)?.availability).toBe('legacy');
      expect(getActivePaletteBlocks().map((b) => b.type)).not.toContain(type);
    }
  });

  it('legacy hero blocks stay in archived palette', () => {
    for (const type of LEGACY_BLOCK_TYPES) {
      expect(getLegacyPaletteBlocks().map((b) => b.type)).toContain(type);
    }
  });

  it('hides disabled blocks from all palettes', () => {
    for (const fn of [getActivePaletteBlocks, getLegacyPaletteBlocks, getInsertablePaletteBlocks]) {
      const types = fn().map((b) => b.type);
      expect(types).not.toContain('layout_section');
      expect(types).not.toContain('text');
      expect(types).not.toContain('image');
      expect(types).not.toContain('financing');
      expect(types).not.toContain('features');
    }
  });
});
