import { describe, expect, it } from '@jest/globals';
import { sanitizeExportHref } from './safe-export-link';

describe('sanitizeExportHref', () => {
  it('allows hash and https links', () => {
    expect(sanitizeExportHref('#lead-form')).toBe('#lead-form');
    expect(sanitizeExportHref('https://autohall.ma/offre')).toBe('https://autohall.ma/offre');
  });

  it('blocks javascript, blob and studio URLs', () => {
    expect(sanitizeExportHref('javascript:alert(1)')).toBe('#lead-form');
    expect(sanitizeExportHref('blob:http://x')).toBe('#lead-form');
    expect(sanitizeExportHref('http://localhost:5173/studio')).toBe('#lead-form');
    expect(sanitizeExportHref('/api/assets/asset-1')).toBe('#lead-form');
  });

  it('uses custom fallback', () => {
    expect(sanitizeExportHref('', '#offer')).toBe('#offer');
  });
});
