import { asPropString } from '../../lib/block-props';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type ImageBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function ImageBlockPreview({ propsJson }: ImageBlockPreviewProps) {
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const alt = asPropString(propsJson.alt);
  const caption = asPropString(propsJson.caption);
  const hasImage = Boolean(imageAssetId || imageUrl);

  return (
    <section className="px-6 py-8">
      <figure className="mx-auto max-w-3xl">
        {hasImage ? (
          <HeroBlockImage
            imageAssetId={imageAssetId}
            imageUrl={imageUrl}
            alt={alt}
            className="w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center">
            <CanvasEmptyHint className="text-zinc-500">
              Sélectionnez une image
            </CanvasEmptyHint>
            <p className="text-xs text-zinc-400">
              Choisissez une image depuis la bibliothèque média
            </p>
          </div>
        )}
        {caption ? (
          <figcaption className="mt-2 text-center text-xs text-zinc-500">{caption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
