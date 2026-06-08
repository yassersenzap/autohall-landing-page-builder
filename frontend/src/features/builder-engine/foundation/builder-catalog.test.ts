import { describe, expect, it } from 'vitest';
import { getActivePaletteBlocks } from '../registry/block-registry';
import {
  countCatalogBlocks,
  getBuilderCatalog,
  getCatalogByBusinessCategory,
  getCatalogItem,
} from './builder-catalog';
import { BUILDER_BUSINESS_CATEGORIES } from './business-categories';

describe('builder-catalog', () => {
  it('includes every active palette block', () => {
    const activeTypes = getActivePaletteBlocks().map((b) => b.type);
    const catalogTypes = getBuilderCatalog().map((b) => b.type);
    expect(catalogTypes.sort()).toEqual(activeTypes.sort());
  });

  it('assigns a business category and sidebar label to each block', () => {
    for (const item of getBuilderCatalog()) {
      expect(item.businessCategory).toBeTruthy();
      expect(item.sidebarLabel.length).toBeGreaterThan(0);
      expect(item.icon).toBeTruthy();
    }
  });

  it('groups blocks by business category without empty groups', () => {
    const groups = getCatalogByBusinessCategory();
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.blocks.length).toBeGreaterThan(0);
      expect(BUILDER_BUSINESS_CATEGORIES.some((c) => c.id === group.category.id)).toBe(true);
    }
  });

  it('resolves catalog items by block type', () => {
    expect(getCatalogItem('hero_campaign')?.sidebarLabel).toContain('Bannière');
    expect(getCatalogItem('unknown_block')).toBeUndefined();
  });

  it('counts catalog blocks', () => {
    expect(countCatalogBlocks()).toBe(getBuilderCatalog().length);
  });
});
