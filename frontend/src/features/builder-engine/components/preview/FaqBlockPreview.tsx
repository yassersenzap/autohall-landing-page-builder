import { asPropString } from '../../lib/block-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';
import { SectionHeading } from './SectionHeading';

type FaqItem = { question: string; answer: string };

function parseFaqItems(propsJson: Record<string, unknown>): FaqItem[] {
  if (!Array.isArray(propsJson.items)) return [];
  return propsJson.items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      question: typeof item.question === 'string' ? item.question : '',
      answer: typeof item.answer === 'string' ? item.answer : '',
    }))
    .filter((item) => item.question.trim() || item.answer.trim());
}

type FaqBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FaqBlockPreview({ propsJson }: FaqBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const items = parseFaqItems(propsJson);

  return (
    <section className="lp-block lp-faq">
      <div className="lp-section lp-section--narrow">
        <SectionHeading heading={heading} subtitle={subtitle} />
        <div className="lp-faq__list">
          {items.length > 0 ? (
            items.map((item, i) => (
              <details key={i} className="lp-faq__item" open={i === 0}>
                <summary className="lp-faq__question">{item.question}</summary>
                <p className="lp-faq__answer">{item.answer}</p>
              </details>
            ))
          ) : (
            <CanvasEmptyHint>Ajoutez vos questions fréquentes</CanvasEmptyHint>
          )}
        </div>
      </div>
    </section>
  );
}
