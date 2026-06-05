import { describe, expect, it } from 'vitest';
import { resolveVideoEmbedUrl } from './video-embed-url';

describe('resolveVideoEmbedUrl', () => {
  it('convertit youtube.com/watch?v=', () => {
    expect(resolveVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('convertit watch?v= avec paramètres supplémentaires', () => {
    expect(
      resolveVideoEmbedUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&t=42',
      ),
    ).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('convertit youtu.be', () => {
    expect(resolveVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('convertit m.youtube.com', () => {
    expect(resolveVideoEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('convertit youtube shorts', () => {
    expect(resolveVideoEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('accepte URL sans protocole', () => {
    expect(resolveVideoEmbedUrl('www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('convertit vimeo.com', () => {
    expect(resolveVideoEmbedUrl('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('convertit vimeo.com/video/', () => {
    expect(resolveVideoEmbedUrl('https://vimeo.com/video/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('conserve les URLs embed déjà valides', () => {
    expect(resolveVideoEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('retourne null pour une URL invalide', () => {
    expect(resolveVideoEmbedUrl('https://example.com/video')).toBeNull();
  });
});
