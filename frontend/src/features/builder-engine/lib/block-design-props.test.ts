import { describe, expect, it } from 'vitest';
import { sanitizeBlockDesignProps } from './block-design-props';

describe('sanitizeBlockDesignProps', () => {
  it('keeps whitelisted design keys with valid enum values', () => {
    const out = sanitizeBlockDesignProps({
      layoutVariant: 'split_image_right',
      backgroundMode: 'dark',
      mediaPosition: 'right',
      paddingTop: 'normal',
      evil: 'drop',
    });
    expect(out).toEqual({
      layoutVariant: 'split_image_right',
      backgroundMode: 'dark',
      mediaPosition: 'right',
      paddingTop: 'normal',
    });
  });

  it('rejects invalid layout and data URLs', () => {
    const out = sanitizeBlockDesignProps({
      layoutVariant: 'freeform_hack',
      backgroundColor: 'data:text/html,hack',
    });
    expect(out).toEqual({});
  });

  it('accepts valid hex colors', () => {
    const out = sanitizeBlockDesignProps({ backgroundColor: '#003B73' });
    expect(out.backgroundColor).toBe('#003B73');
  });
});
