import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBeforeUnload } from './use-before-unload';

describe('useBeforeUnload', () => {
  beforeEach(() => {
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers beforeunload only when dirty', () => {
    const { rerender } = renderHook(({ active }) => useBeforeUnload(active), {
      initialProps: { active: false },
    });

    expect(window.addEventListener).not.toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );

    rerender({ active: true });
    expect(window.addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
  });
});
