import { describe, expect, it } from 'vitest';
import { BLOCK_LIBRARY } from './block-library';
import { SECTION_LIBRARY } from './section-library';
import { STUDIO_V2_STARTERS } from './starters';

describe('Creative Landing Engine', () => {
  it('exposes eight distinct starters', () => {
    expect(STUDIO_V2_STARTERS).toHaveLength(8);
    const ids = STUDIO_V2_STARTERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(8);
  });

  it('starters produce structurally different pages', () => {
    const signatures = STUDIO_V2_STARTERS.map((s) => {
      const doc = s.build();
      const types = JSON.stringify(doc);
      return {
        id: s.id,
        theme: (doc.root?.props as { themePreset?: string })?.themePreset,
        hasStats: types.includes('StatsBlock'),
        hasEvent: types.includes('EventScheduleBlock'),
        hasFinancing: types.includes('FinancingHighlightBlock'),
        hasStack: types.includes('StackBlock'),
        sectionCount: doc.content?.length ?? 0,
      };
    });

    const minimal = signatures.find((s) => s.id === 'minimal-landing');
    const racing = signatures.find((s) => s.id === 'racing-sport-campaign');
    const event = signatures.find((s) => s.id === 'event-landing');

    expect(minimal?.hasStack).toBe(true);
    expect(racing?.hasStats).toBe(true);
    expect(event?.hasEvent).toBe(true);
    expect(minimal?.sectionCount).toBeLessThan(racing?.sectionCount ?? 99);
  });

  it('section library has hero and conversion entries', () => {
    expect(SECTION_LIBRARY.some((s) => s.category === 'hero')).toBe(true);
    expect(SECTION_LIBRARY.some((s) => s.category === 'conversion')).toBe(true);
  });

  it('block library has atomic blocks without technical labels', () => {
    expect(BLOCK_LIBRARY.length).toBeGreaterThan(8);
    for (const block of BLOCK_LIBRARY) {
      expect(block.name).not.toContain('imageAssetId');
      expect(block.description.length).toBeGreaterThan(5);
    }
  });
});
