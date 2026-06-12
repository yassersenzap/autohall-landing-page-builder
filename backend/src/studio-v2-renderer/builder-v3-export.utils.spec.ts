import { describe, expect, it } from '@jest/globals';
import { buildBuilderV3ZipEntries } from './builder-v3-export.utils';

describe('buildBuilderV3ZipEntries', () => {
  it('includes landing stylesheet for premium export parity', () => {
    const entries = buildBuilderV3ZipEntries({
      indexHtml: '<html></html>',
      landingConfigJs: 'window.LANDING_CONFIG = {};',
      assetMap: {},
    });

    expect(entries.some((e) => e.kind === 'text' && e.path === 'assets/style.css')).toBe(
      true,
    );
    expect(
      entries.find((e) => e.kind === 'text' && e.path === 'assets/style.css')?.content,
    ).toContain('.lp-promo-autohall');
    expect(entries.some((e) => e.kind === 'text' && e.path === 'js/motion-runtime.js')).toBe(
      true,
    );
  });
});
