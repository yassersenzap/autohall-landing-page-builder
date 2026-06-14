import { describe, expect, it } from 'vitest';
import { getInsertablePaletteBlocks } from './block-registry';
import { MARKETING_SECTIONS } from './marketing-sections';

describe('marketing-sections', () => {
  const insertableTypes = new Set(getInsertablePaletteBlocks().map((b) => b.type));

  it('only uses insertable block types', () => {
    for (const section of MARKETING_SECTIONS) {
      for (const type of section.blockTypes) {
        expect(insertableTypes.has(type)).toBe(true);
      }
    }
  });

  it('includes the three V1 marketing sections', () => {
    const ids = MARKETING_SECTIONS.map((s) => s.id);
    expect(ids).toEqual(['test-drive', 'vehicle-offer', 'sav-service']);
  });
});
