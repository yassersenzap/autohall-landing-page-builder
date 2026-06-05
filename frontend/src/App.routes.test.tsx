import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';

describe('App routes', () => {
  it('exposes Landing Studio as the official editor route', () => {
    const source = appSource;

    expect(source).toContain('/page-versions/:pageVersionId/studio');
    expect(source).toContain('/page-versions/:pageVersionId/studio/preview');
    expect(source).toContain('VisualStudioV2Page');
    expect(source).toContain('lazy');
  });

  it('redirects legacy blocks route away from the old builder', () => {
    const source = appSource;

    expect(source).toContain('/page-versions/:pageVersionId/blocks');
    expect(source).toContain('LandingStudioLegacyRedirect');
    expect(source).not.toContain('PageVersionBlocksPage');
  });

  it('does not mount the legacy blocks page component', () => {
    const source = appSource;

    expect(source).not.toMatch(/Builder V1/i);
    expect(source).not.toContain('PageVersionBlocksPage');
  });
});
