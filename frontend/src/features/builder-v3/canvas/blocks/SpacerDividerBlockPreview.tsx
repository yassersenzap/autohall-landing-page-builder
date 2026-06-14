import { asPropString } from '@/features/builder-engine/lib/block-props';
import { normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';

type SpacerDividerBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function SpacerDividerBlockPreview({ propsJson }: SpacerDividerBlockPreviewProps) {
  const design = normalizeSectionDesign('spacer_divider', propsJson);
  const type = asPropString(propsJson.type) || 'solid';
  const hauteur = asPropString(propsJson.hauteur) || 'M';
  const { className: wrapperClass } = mergeBlockSectionPresentation(
    'lp-spacer-root',
    'spacer_divider',
    propsJson,
  );

  if (type === 'space') {
    return (
      <div
        className={`${wrapperClass} lp-spacer lp-spacer--space lp-spacer--${hauteur.toLowerCase()} lp-spacer--density-${design.density}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`${wrapperClass} lp-spacer lp-spacer--divider lp-spacer--density-${design.density}`}
      aria-hidden
    />
  );
}
