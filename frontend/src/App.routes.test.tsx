import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';

describe('App routes', () => {
  it('keeps V1 blocks route and adds studio-v2 without replacing blocks', () => {
    const source = appSource;

    expect(source).toContain('/page-versions/:pageVersionId/blocks');
    expect(source).toContain('PageVersionBlocksPage');
    expect(source).toContain('/page-versions/:pageVersionId/studio-v2');
    expect(source).toContain('VisualStudioV2Page');
    expect(source).toContain('/page-versions/:pageVersionId/studio-v2-preview');
    expect(source).toContain('lazy');
  });
});
