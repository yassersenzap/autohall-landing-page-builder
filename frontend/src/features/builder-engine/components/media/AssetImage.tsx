import { useEffect, useState } from 'react';
import { fetchAssetBlobUrl } from '@/lib/asset-file-url';
import { cn } from '@/lib/utils';

type AssetImageProps = {
  assetId: string;
  alt?: string;
  className?: string;
  /** Classes appliquées pendant le chargement */
  loadingClassName?: string;
};

export function AssetImage({
  assetId,
  alt = '',
  className,
  loadingClassName,
}: AssetImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setSrc(null);

    void fetchAssetBlobUrl(assetId)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground',
          className,
          loadingClassName,
        )}
        role="img"
        aria-label={alt || 'Image indisponible'}
      >
        Image indisponible
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-md bg-muted/60',
          className,
          loadingClassName,
        )}
        aria-hidden
      />
    );
  }

  return <img src={src} alt={alt} className={className} decoding="async" />;
}
