import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';
import { resolveMediaAspectClass } from '../../constants/utility-blocks';

type MediaOnlyBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function MediaOnlyBlockPreview({ propsJson }: MediaOnlyBlockPreviewProps) {
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.imageAlt) || 'Visuel campagne';
  const aspectClass = resolveMediaAspectClass(asPropString(propsJson.aspectRatio));

  return (
    <section className="w-full bg-transparent px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl dark:bg-neutral-800',
            aspectClass,
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Image HD — uploadez un visuel
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
