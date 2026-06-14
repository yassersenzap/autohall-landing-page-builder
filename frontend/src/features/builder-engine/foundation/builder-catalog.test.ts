import { describe, expect, it } from 'vitest';
import { isBackendSupportedBlockType } from '../registry/backend-block-types';
import { getActivePaletteBlocks, getInsertablePaletteBlocks } from '../registry/block-registry';
import {
  countArchivedCatalogBlocks,
  countCatalogBlocks,
  getArchivedBuilderCatalog,
  getBuilderCatalog,
  getCatalogItem,
} from './builder-catalog';
import { ARCHIVED_CATALOG_BLOCK_TYPES } from './catalog-visibility';

describe('builder-catalog', () => {
  it('includes every active palette block', () => {
    const activeTypes = getActivePaletteBlocks().map((b) => b.type);
    const catalogTypes = getBuilderCatalog().map((b) => b.type);
    expect(catalogTypes.sort()).toEqual(activeTypes.sort());
  });

  it('assigns a business category and sidebar label to each archived block', () => {
    for (const item of getArchivedBuilderCatalog()) {
      expect(item.businessCategory).toBeTruthy();
      expect(item.sidebarLabel.length).toBeGreaterThan(0);
      expect(item.icon).toBeTruthy();
    }
  });

  it('resolves catalog items by block type including archived', () => {
    expect(getCatalogItem('hero_campaign')?.sidebarLabel).toContain('Bannière');
    expect(getCatalogItem('core_campaign_form_landing')?.sidebarLabel).toContain('Landing');
    expect(getCatalogItem('unknown_block')).toBeUndefined();
  });

  it('archived catalog mirrors ARCHIVED_CATALOG_BLOCK_TYPES', () => {
    const archivedTypes = getArchivedBuilderCatalog().map((b) => b.type).sort();
    const expected = [...ARCHIVED_CATALOG_BLOCK_TYPES]
      .filter((type) => isBackendSupportedBlockType(type))
      .sort();
    expect(archivedTypes).toEqual(expected);
    expect(getBuilderCatalog().map((b) => b.type)).toEqual([]);
  });

  it('counts catalog blocks', () => {
    expect(countCatalogBlocks()).toBe(0);
    expect(countArchivedCatalogBlocks()).toBe(getArchivedBuilderCatalog().length);
    expect(countCatalogBlocks() + countArchivedCatalogBlocks()).toBe(
      getInsertablePaletteBlocks().length,
    );
  });
});
