import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type MediaOnlyBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function MediaOnlyBlockPreview({ propsJson }: MediaOnlyBlockPreviewProps) {
  const design = normalizeSectionDesign('media_only', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-media-only', design);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageAlt =
    asPropString(propsJson.alt) || asPropString(propsJson.imageAlt) || 'Visuel campagne Auto Hall';
  const aspect = asPropString(propsJson.aspectRatio) || '16:9';
  const aspectClass =
    aspect === '4:3' ? 'lp-media-only--4-3' : aspect === '21:9' ? 'lp-media-only--21-9' : 'lp-media-only--16-9';
  const hasImage = Boolean(imageAssetId || imageUrl);

  return (
    <section className={`lp-block ${sectionClass} ${aspectClass}`}>
      <div className="lp-section">
        <figure className="lp-media-only__figure">
          {hasImage ? (
            <HeroBlockImage
              imageAssetId={imageAssetId}
              imageUrl={imageUrl}
              alt={imageAlt}
              className="lp-media-only__img"
            />
          ) : (
            <div className="lp-media__placeholder" aria-hidden />
          )}
        </figure>
      </div>
    </section>
  );
}
