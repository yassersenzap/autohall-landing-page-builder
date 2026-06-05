import { AssetImage } from './AssetImage';

type HeroBlockImageProps = {
  imageAssetId?: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
};

/**
 * Affiche l'image Hero : asset uploadé (JWT blob) ou URL externe.
 */
export function HeroBlockImage({
  imageAssetId,
  imageUrl,
  alt,
  className,
}: HeroBlockImageProps) {
  if (imageAssetId) {
    return (
      <AssetImage
        assetId={imageAssetId}
        alt={alt}
        className={className}
        loadingClassName={className}
      />
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return null;
}
