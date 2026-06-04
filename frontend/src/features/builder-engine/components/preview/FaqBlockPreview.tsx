import { asPropString } from '../../lib/block-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type FaqItem = { question: string; answer: string };

function parseFaqItems(propsJson: Record<string, unknown>): FaqItem[] {
  if (!Array.isArray(propsJson.items)) return [];
  return propsJson.items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      question: typeof item.question === 'string' ? item.question : '',
      answer: typeof item.answer === 'string' ? item.answer : '',
    }))
    .filter((item) => item.question || item.answer);
}

type FaqBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FaqBlockPreview({ propsJson }: FaqBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const items = parseFaqItems(propsJson);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        {heading ? <h2 className="text-xl font-semibold text-zinc-900">{heading}</h2> : null}
        {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
        <ul className="mt-4 space-y-3">
          {items.length > 0 ? (
            items.map((item, i) => (
              <li
                key={i}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-zinc-900">{item.question}</p>
                <p className="mt-1 text-sm text-zinc-600">{item.answer}</p>
              </li>
            ))
          ) : (
            <li>
              <CanvasEmptyHint className="text-zinc-400">
                Ajoutez vos questions fréquentes
              </CanvasEmptyHint>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
