import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MEDIA_IMAGE_MAX_RETRIES } from './media-constants';
import { useMediaImageState } from './use-media-image-state';

describe('useMediaImageState', () => {
  it('starts loading when src is provided', () => {
    const { result } = renderHook(() => useMediaImageState('/assets/hero-fixtures/chery.webp'));
    expect(result.current.state).toBe('loading');
  });

  it('starts error when src is empty', () => {
    const { result } = renderHook(() => useMediaImageState(''));
    expect(result.current.state).toBe('error');
  });

  it('retry re-resolves src and caps attempts', () => {
    let resolved = '/first.webp';
    const { result } = renderHook(() =>
      useMediaImageState('/first.webp', {
        resolveSrc: () => resolved,
      }),
    );

    act(() => {
      resolved = '/second.webp';
      result.current.retry();
    });
    expect(result.current.displaySrc).toContain('retry=1');
    expect(result.current.state).toBe('loading');

    for (let i = 0; i < MEDIA_IMAGE_MAX_RETRIES; i += 1) {
      act(() => result.current.retry());
    }
    expect(result.current.canRetry).toBe(false);
  });
});
