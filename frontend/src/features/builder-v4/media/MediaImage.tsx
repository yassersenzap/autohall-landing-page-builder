import type { CSSProperties, ImgHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMediaImageState } from './use-media-image-state';

export type MediaImageVariant = 'hero' | 'thumb' | 'inspector' | 'preview';

export type MediaImageProps = {
  src: string;
  alt: string;
  variant?: MediaImageVariant;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  resolveSrc?: () => string;
  loadingLabel?: string;
  errorLabel?: string;
  testId?: string;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, 'draggable'>;

export function MediaImage({
  src,
  alt,
  variant = 'hero',
  imgClassName,
  imgStyle,
  resolveSrc,
  loadingLabel = 'Chargement…',
  errorLabel = 'Image indisponible',
  testId,
  draggable,
}: MediaImageProps) {
  const { state, displaySrc, canRetry, onLoad, onError, retry } = useMediaImageState(src, {
    resolveSrc,
  });

  let body: ReactNode = null;

  if (!displaySrc || state === 'error') {
    body = (
      <div className="v4-media-image__error" role="status">
        <p className="v4-media-image__error-label">{errorLabel}</p>
        {canRetry ? (
          <button type="button" className="v4-media-image__retry" onClick={retry}>
            Réessayer
          </button>
        ) : null}
      </div>
    );
  } else {
    body = (
      <>
        {state === 'loading' ? (
          <div className="v4-media-image__loading" aria-hidden>
            <span className="v4-media-image__loading-text">{loadingLabel}</span>
          </div>
        ) : null}
        <img
          src={displaySrc}
          alt={alt}
          className={cn(
            'v4-media-image__img',
            imgClassName,
            state === 'loading' && 'v4-media-image__img--loading',
          )}
          style={imgStyle}
          draggable={draggable}
          onLoad={onLoad}
          onError={onError}
        />
      </>
    );
  }

  return (
    <div
      className={cn('v4-media-image', `v4-media-image--${variant}`, state === 'error' && 'v4-media-image--error')}
      data-testid={testId}
      data-v4-media-state={state}
    >
      {body}
    </div>
  );
}
