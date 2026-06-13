import { describe, expect, it } from 'vitest';
import {
  sanitizeCollectionArray,
  sanitizeCollectionItem,
  sanitizeSafeUrl,
} from './collection-sanitizer';
import { getCollectionSchema } from './collection-schemas';

describe('collection sanitizer', () => {
  it('strips unknown fields and studio keys from items', () => {
    const schema = getCollectionSchema('premium_bento_features', 'cards')!;
    const item = sanitizeCollectionItem(schema, {
      title: 'Réseau',
      description: 'National',
      evil: '<script>',
      _studioId: 'hidden',
    });

    expect(item).toEqual({
      title: 'Réseau',
      description: 'National',
      icon: 'star',
    });
    expect(item).not.toHaveProperty('_studioId');
    expect(item).not.toHaveProperty('evil');
  });

  it('limits array length and enforces min items', () => {
    const metrics = sanitizeCollectionArray('animated_stats_strip', 'metrics', [
      { value: '1', label: 'A' },
      { value: '2', label: 'B' },
      { value: '3', label: 'C' },
      { value: '4', label: 'D' },
      { value: '5', label: 'E' },
      { value: '6', label: 'F' },
      { value: '7', label: 'G' },
    ]);

    expect(metrics).toHaveLength(6);
  });

  it('allows empty specs array when minItems is 0', () => {
    const specs = sanitizeCollectionArray('vehicle_showcase_split', 'specs', []);
    expect(specs).toEqual([]);
  });

  it('sanitizes unsafe URLs to fallback', () => {
    expect(sanitizeSafeUrl('javascript:alert(1)')).toBe('#lead-form');
    expect(sanitizeSafeUrl('blob:http://x')).toBe('#lead-form');
    expect(sanitizeSafeUrl('http://localhost:5173/studio')).toBe('#lead-form');
    expect(sanitizeSafeUrl('#offer')).toBe('#offer');
    expect(sanitizeSafeUrl('https://example.com/page')).toBe('https://example.com/page');
  });

  it('drops blob and studio image URLs from gallery items', () => {
    const images = sanitizeCollectionArray('gallery', 'images', [
      {
        url: 'blob:http://local',
        alt: 'Test',
        imageAssetId: 'asset-1',
      },
    ]);

    expect(images[0]?.url).toBeUndefined();
    expect(images[0]?.imageAssetId).toBe('asset-1');
    expect(images[0]?.alt).toBe('Test');
  });

  it('sanitizes FAQ items and strips nested studio keys', () => {
    const items = sanitizeCollectionArray('faq', 'items', [
      {
        question: 'Garantie ?',
        answer: '3 ans',
        _studioRow: 'drop',
      },
      { question: '', answer: '' },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ question: 'Garantie ?', answer: '3 ans' });
    expect(items[0]).not.toHaveProperty('_studioRow');
  });

  it('sanitizes nested pricing trim features', () => {
    const trims = sanitizeCollectionArray('pricing_trim', 'trims', [
      {
        name: 'Style',
        price: '200k',
        features: ['  GPS  ', '', 'Caméra'],
        buttonHref: 'javascript:alert(1)',
      },
    ]);

    expect(trims[0]?.features).toEqual(['GPS', 'Caméra']);
    expect(trims[0]?.buttonHref).toBe('#lead-form');
  });
});
