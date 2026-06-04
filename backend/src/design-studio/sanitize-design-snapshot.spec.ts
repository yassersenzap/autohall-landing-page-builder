import { describe, expect, it } from '@jest/globals';
import {
  DesignSnapshotRejectedError,
  sanitizeDesignCss,
  sanitizeDesignHtml,
} from './sanitize-design-snapshot';

describe('sanitize-design-snapshot', () => {
  it('rejects script tags in HTML', () => {
    expect(() => sanitizeDesignHtml('<div><script>alert(1)</script></div>')).toThrow(
      DesignSnapshotRejectedError,
    );
  });

  it('accepts clean HTML', () => {
    const html = '<main class="lp-page"><h1>Titre</h1></main>';
    expect(sanitizeDesignHtml(html)).toBe(html);
  });

  it('rejects @import in CSS', () => {
    expect(() => sanitizeDesignCss('body { color: red; } @import url(evil.css);')).toThrow(
      DesignSnapshotRejectedError,
    );
  });

  it('accepts clean CSS', () => {
    expect(sanitizeDesignCss('.hero { padding: 2rem; }')).toContain('padding');
  });
});
