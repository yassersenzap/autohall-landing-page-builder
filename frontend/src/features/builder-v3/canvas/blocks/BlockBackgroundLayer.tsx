import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';

export type BlockBackgroundProps = {
  backgroundType?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAssetId?: string;
  imageAlt?: string;
  overlayOpacity?: string;
  parallaxEnabled?: boolean;
};

type BlockBackgroundLayerProps = {
  propsJson: Record<string, unknown>;
  gradientOverlay?: boolean;
};

export function readBackgroundProps(propsJson: Record<string, unknown>): BlockBackgroundProps {
  return {
    backgroundType: asPropString(propsJson.backgroundType) || 'image',
    backgroundColor: asPropString(propsJson.backgroundColor) || '#0f172a',
    imageUrl: asPropString(propsJson.imageUrl),
    imageAssetId: asPropString(propsJson.imageAssetId),
    imageAlt: asPropString(propsJson.imageAlt) || asPropString(propsJson.alt) || 'Visuel',
    overlayOpacity: asPropString(propsJson.overlayOpacity) || '80',
    parallaxEnabled: propsJson.parallaxEnabled === true,
  };
}

function overlayAlpha(opacityKey: string): number {
  const parsed = Number.parseInt(opacityKey, 10);
  if (Number.isNaN(parsed)) return 0.8;
  return Math.min(1, Math.max(0, parsed / 100));
}

export function BlockBackgroundLayer({
  propsJson,
  gradientOverlay = false,
}: BlockBackgroundLayerProps) {
  const bg = readBackgroundProps(propsJson);
  const isColor = bg.backgroundType === 'color';
  const hasImage = Boolean(bg.imageUrl || bg.imageAssetId);
  const alpha = overlayAlpha(bg.overlayOpacity ?? '80');
  const parallaxClass = bg.parallaxEnabled ? 'bg-fixed' : '';

  return (
    <>
      {isColor ? (
        <div
          className={cn('absolute inset-0 z-0', parallaxClass)}
          style={{ backgroundColor: bg.backgroundColor }}
          aria-hidden
        />
      ) : hasImage ? (
        bg.imageAssetId ? (
          <HeroBlockImage
            imageAssetId={bg.imageAssetId}
            imageUrl={bg.imageUrl ?? ''}
            alt={bg.imageAlt ?? ''}
            className={cn('absolute inset-0 z-0 h-full w-full object-cover', parallaxClass)}
          />
        ) : (
          <img
            src={bg.imageUrl}
            alt={bg.imageAlt ?? ''}
            className={cn('absolute inset-0 z-0 h-full w-full object-cover', parallaxClass)}
          />
        )
      ) : (
        <div
          className={cn(
            'absolute inset-0 z-0 bg-linear-to-br from-neutral-800 via-neutral-900 to-black',
            parallaxClass,
          )}
          aria-hidden
        />
      )}

      {gradientOverlay && !isColor && hasImage ? (
        <div
          className="absolute inset-0 z-1 bg-linear-to-r from-black via-black/50 to-transparent"
          style={{ opacity: alpha }}
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 z-1 bg-black"
          style={{ opacity: alpha }}
          aria-hidden
        />
      )}
    </>
  );
}
