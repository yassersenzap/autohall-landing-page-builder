import { describe, expect, it } from 'vitest';
import { getActivePaletteBlocks } from './block-registry';
import { MARKETING_SECTIONS } from './marketing-sections';

describe('marketing-sections', () => {
  const activeTypes = new Set(getActivePaletteBlocks().map((b) => b.type));

  it('only uses stable active block types', () => {
    for (const section of MARKETING_SECTIONS) {
      for (const type of section.blockTypes) {
        expect(activeTypes.has(type)).toBe(true);
      }
    }
  });

  it('includes test-drive and lead-capture templates', () => {
    const ids = MARKETING_SECTIONS.map((s) => s.id);
    expect(ids).toContain('test-drive');
    expect(ids).toContain('lead-capture');
  });
});
