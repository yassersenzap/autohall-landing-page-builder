import { asPropString } from '@/features/builder-engine/lib/block-props';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { cn } from '@/lib/utils';

type GalleryImage = {
  url?: string;
  alt?: string;
  imageAssetId?: string;
};

type GalleryBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function resolveGalleryImageSrc(image: GalleryImage): string {
  if (image.imageAssetId) {
    return assetPublicFileUrl(image.imageAssetId);
  }
  return image.url ?? '';
}

export function GalleryBlockPreview({ propsJson }: GalleryBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const rawImages = Array.isArray(propsJson.images) ? propsJson.images : [];
  const images = (rawImages as GalleryImage[]).slice(0, 3);

  while (images.length < 3) {
    images.push({ url: '', alt: '' });
  }

  return (
    <section className="relative w-full bg-neutral-950 py-2">
      {heading ? (
        <div className="relative z-10 px-6 py-8 text-center">
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {heading}
          </h2>
        </div>
      ) : null}

      <div className="relative z-10 grid grid-cols-1 gap-1 sm:grid-cols-3">
        {images.map((image, index) => {
          const src = resolveGalleryImageSrc(image);
          const alt = image.alt || `Visuel ${index + 1}`;
          return (
            <div
              key={`gallery-${index}`}
              className="group relative aspect-[4/3] overflow-hidden sm:aspect-[3/4]"
            >
              {src ? (
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center bg-neutral-800 text-xs text-neutral-500',
                  )}
                >
                  Image {index + 1}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
