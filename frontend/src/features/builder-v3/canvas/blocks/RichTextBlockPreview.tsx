import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';
import { resolveRichTextAlign } from '../../constants/utility-blocks';

type RichTextBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function RichTextBlockPreview({ propsJson }: RichTextBlockPreviewProps) {
  const titre = asPropString(propsJson.titre) || 'Titre de section';
  const contenu = asPropString(propsJson.contenu);
  const alignement = asPropString(propsJson.alignement) || 'center';
  const alignClass = resolveRichTextAlign(alignement);

  return (
    <section className="w-full bg-white px-6 py-16 dark:bg-neutral-900">
      <div className={cn('max-w-3xl', alignClass)}>
        <h2
          className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {titre}
        </h2>
        {contenu ? (
          <p
            className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {contenu}
          </p>
        ) : (
          <p className="text-sm italic text-neutral-400">Ajoutez votre contenu dans l&apos;inspecteur.</p>
        )}
      </div>
    </section>
  );
}
