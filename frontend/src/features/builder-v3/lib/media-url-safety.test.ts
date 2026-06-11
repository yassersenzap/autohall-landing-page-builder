import { describe, expect, it } from 'vitest';
import {
  isUnsafePersistedMediaUrl,
  sanitizeMediaFieldPatch,
  sanitizePersistedMediaUrl,
} from './media-url-safety';

describe('media-url-safety', () => {
  it('flags blob, localhost and studio URLs as unsafe', () => {
    expect(isUnsafePersistedMediaUrl('blob:http://localhost/abc')).toBe(true);
    expect(isUnsafePersistedMediaUrl('http://localhost:5173/assets/x.jpg')).toBe(true);
    expect(isUnsafePersistedMediaUrl('https://127.0.0.1:3000/file')).toBe(true);
    expect(isUnsafePersistedMediaUrl('/studio/preview/asset')).toBe(true);
    expect(isUnsafePersistedMediaUrl('https://cdn.example.com/hero.jpg')).toBe(false);
  });

  it('sanitizes unsafe URLs to empty string', () => {
    expect(sanitizePersistedMediaUrl('blob:http://localhost/x')).toBe('');
    expect(sanitizePersistedMediaUrl('http://localhost:5173/x')).toBe('');
    expect(sanitizePersistedMediaUrl('https://assets.example.com/a.jpg')).toBe(
      'https://assets.example.com/a.jpg',
    );
  });

  it('strips unsafe URL keys from media patches', () => {
    expect(
      sanitizeMediaFieldPatch({
        heroImage: 'asset-1',
        heroImageUrl: 'blob:http://localhost/dead',
      }),
    ).toEqual({
      heroImage: 'asset-1',
      heroImageUrl: '',
    });
  });
});
