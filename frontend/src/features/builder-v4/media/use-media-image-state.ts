import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MEDIA_IMAGE_MAX_RETRIES } from './media-constants';

export type MediaLoadState = 'loading' | 'loaded' | 'error';

export type UseMediaImageStateOptions = {
  /** Called on retry to re-resolve src from assetId (store lookup). */
  resolveSrc?: () => string;
};

export type UseMediaImageStateResult = {
  state: MediaLoadState;
  displaySrc: string;
  retryCount: number;
  canRetry: boolean;
  onLoad: () => void;
  onError: () => void;
  retry: () => void;
};

export function useMediaImageState(
  src: string,
  options?: UseMediaImageStateOptions,
): UseMediaImageStateResult {
  const [state, setState] = useState<MediaLoadState>(src ? 'loading' : 'error');
  const [retryCount, setRetryCount] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const resolveSrcRef = useRef(options?.resolveSrc);
  resolveSrcRef.current = options?.resolveSrc;

  useEffect(() => {
    setResolvedSrc(src);
    setState(src ? 'loading' : 'error');
  }, [src]);

  const displaySrc = useMemo(() => {
    if (!resolvedSrc) return resolvedSrc;
    if (retryCount === 0) return resolvedSrc;
    const separator = resolvedSrc.includes('?') ? '&' : '?';
    return `${resolvedSrc}${separator}retry=${retryCount}`;
  }, [resolvedSrc, retryCount]);

  const onLoad = useCallback(() => setState('loaded'), []);
  const onError = useCallback(() => setState('error'), []);

  const retry = useCallback(() => {
    if (retryCount >= MEDIA_IMAGE_MAX_RETRIES) return;
    const next = resolveSrcRef.current?.() ?? src;
    setResolvedSrc(next);
    setRetryCount((count) => count + 1);
    setState(next ? 'loading' : 'error');
  }, [retryCount, src]);

  return {
    state,
    displaySrc,
    retryCount,
    canRetry: retryCount < MEDIA_IMAGE_MAX_RETRIES,
    onLoad,
    onError,
    retry,
  };
}
