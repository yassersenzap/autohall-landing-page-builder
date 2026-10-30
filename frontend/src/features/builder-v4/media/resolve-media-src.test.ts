import { describe, expect, it } from 'vitest';
import { HERO_FIXTURE_PATHS } from './media-constants';
import { resolveMediaSrc } from './resolve-media-src';
import type { MediaAsset } from '../types/assets.types';

const cheryAsset: MediaAsset = {
  id: 'autohall-gamme-thermique',
  name: 'Chery',
  src: HERO_FIXTURE_PATHS.chery,
  mimeType: 'image/webp',
  source: 'builtin',
  tags: [],
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('resolveMediaSrc', () => {
  it('resolves from assetId when asset exists', () => {
    const result = resolveMediaSrc(
      { assetId: 'autohall-gamme-thermique', src: 'stale-url' },
      (id) => (id === 'autohall-gamme-thermique' ? cheryAsset : undefined),
    );
    expect(result.status).toBe('resolved');
    expect(result.src).toBe(HERO_FIXTURE_PATHS.chery);
  });

  it('returns orphan when assetId missing but src present', () => {
    const result = resolveMediaSrc(
      { assetId: 'deleted-upload', src: '/old-data-url' },
      () => undefined,
    );
    expect(result.status).toBe('orphan');
    expect(result.src).toBe('/old-data-url');
  });

  it('returns placeholder when asset and src missing', () => {
    const result = resolveMediaSrc({ assetId: 'gone', src: '' }, () => undefined);
    expect(result.status).toBe('missing');
    expect(result.src).toBe(HERO_FIXTURE_PATHS.placeholder);
  });

  it('resolves src-only nodes without assetId', () => {
    const result = resolveMediaSrc({ src: HERO_FIXTURE_PATHS.jeep }, () => undefined);
    expect(result.status).toBe('resolved');
    expect(result.src).toBe(HERO_FIXTURE_PATHS.jeep);
  });
});
