import { asPropString } from '@/features/builder-engine/lib/block-props';
import { normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type SpacerDividerBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function SpacerDividerBlockPreview({ propsJson }: SpacerDividerBlockPreviewProps) {
  const design = normalizeSectionDesign('spacer_divider', propsJson);
  const type = asPropString(propsJson.type) || 'solid';
  const hauteur = asPropString(propsJson.hauteur) || 'M';

  if (type === 'space') {
    return (
      <div
        className={`lp-spacer lp-spacer--space lp-spacer--${hauteur.toLowerCase()} lp-spacer--density-${design.density}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`lp-spacer lp-spacer--divider lp-spacer--density-${design.density}`}
      aria-hidden
    />
  );
}
