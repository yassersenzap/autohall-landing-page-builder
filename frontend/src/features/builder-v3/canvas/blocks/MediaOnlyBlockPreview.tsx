import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaAspectClass } from '../../constants/utility-blocks';

type MediaOnlyBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function MediaOnlyBlockPreview({ propsJson }: MediaOnlyBlockPreviewProps) {
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageAlt =
    asPropString(propsJson.alt) || asPropString(propsJson.imageAlt) || 'Visuel campagne';
  const aspectClass = resolveMediaAspectClass(asPropString(propsJson.aspectRatio));
  const objectFit = asPropString(propsJson.objectFit) === 'contain' ? 'object-contain' : 'object-cover';
  const hasImage = Boolean(imageAssetId || imageUrl);

  return (
    <section className="w-full bg-transparent px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl dark:bg-neutral-800',
            aspectClass,
          )}
        >
          {hasImage ? (
            <HeroBlockImage
              imageAssetId={imageAssetId}
              imageUrl={imageUrl}
              alt={imageAlt}
              className={cn('h-full w-full', objectFit)}
            />
          ) : (
            <div className="flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-2 text-neutral-400">
              <ImagePlus className="h-8 w-8 opacity-60" aria-hidden />
              <p className="text-sm">Importer une image</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
