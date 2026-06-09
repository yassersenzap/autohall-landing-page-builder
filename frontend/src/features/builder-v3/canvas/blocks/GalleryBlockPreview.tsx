import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { assetPublicFileUrl } from '@/lib/page-assets-api';

type GalleryImage = {
  url?: string;
  alt?: string;
  imageAssetId?: string;
};

type GalleryBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function resolveGalleryImageSrc(image: GalleryImage): string {
  if (image.imageAssetId) return assetPublicFileUrl(image.imageAssetId);
  return image.url ?? '';
}

export function GalleryBlockPreview({ propsJson }: GalleryBlockPreviewProps) {
  const design = normalizeSectionDesign('gallery', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-gallery', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const rawImages = Array.isArray(propsJson.images) ? propsJson.images : [];
  const images = (rawImages as GalleryImage[]).slice(0, 6);

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-gallery__grid">
          {images.map((image, index) => {
            const src = resolveGalleryImageSrc(image);
            const alt = image.alt || 'Photo véhicule Auto Hall';
            return (
              <figure key={`gallery-${index}`} className="lp-gallery__cell">
                {src ? (
                  <HeroBlockImage imageUrl={src} alt={alt} className="lp-gallery__img" />
                ) : (
                  <div className="lp-gallery__placeholder" aria-hidden />
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
