import { describe, expect, it } from 'vitest';
import { buildImageElementStyle, buildImageMediaStyle } from './image-style';

describe('image-style helpers', () => {
  it('applies cover and center by default', () => {
    expect(buildImageElementStyle({})).toEqual({
      objectFit: 'cover',
      objectPosition: 'center',
    });
  });

  it('applies aspect ratio and shadow on media wrapper', () => {
    const style = buildImageMediaStyle({
      aspectRatio: '16:9',
      imageRadius: 'lg',
      imageShadow: 'soft',
    });
    expect(style.aspectRatio).toBe('16 / 9');
    expect(style.borderRadius).toBe('0.75rem');
    expect(style.boxShadow).toContain('rgba');
  });
});
