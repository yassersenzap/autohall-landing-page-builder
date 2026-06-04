import { asPropString } from '../../lib/block-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type TextBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function TextBlockPreview({ propsJson }: TextBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const content = asPropString(propsJson.content);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        {heading ? (
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{heading}</h2>
        ) : (
          <CanvasEmptyHint className="text-zinc-400">
            Titre à renseigner
          </CanvasEmptyHint>
        )}
        {content ? (
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-600">
            {content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : (
          <CanvasEmptyHint className="mt-3 text-zinc-400">
            Ajoutez un titre et un paragraphe depuis le panneau de droite.
          </CanvasEmptyHint>
        )}
      </div>
    </section>
  );
}
