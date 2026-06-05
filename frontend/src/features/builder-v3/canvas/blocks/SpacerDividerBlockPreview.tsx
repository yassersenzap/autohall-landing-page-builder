import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';
import { SPACER_HEIGHT_CLASS } from '../../constants/utility-blocks';

type SpacerDividerBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function SpacerDividerBlockPreview({ propsJson }: SpacerDividerBlockPreviewProps) {
  const type = asPropString(propsJson.type) || 'solid';
  const hauteur = asPropString(propsJson.hauteur) || 'M';
  const heightClass = SPACER_HEIGHT_CLASS[hauteur] ?? SPACER_HEIGHT_CLASS.M;

  if (type === 'space') {
    return (
      <div
        className={cn('w-full bg-transparent', heightClass)}
        aria-hidden
        data-spacer-type="space"
      />
    );
  }

  return (
    <div
      className={cn(
        'flex w-full items-center bg-transparent px-6',
        heightClass,
      )}
      data-spacer-type={type}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-5xl border-neutral-200 dark:border-neutral-700',
          type === 'dashed' ? 'border-t border-dashed' : 'border-t border-solid',
        )}
        aria-hidden
      />
    </div>
  );
}
