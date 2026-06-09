import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type FAQItem = {
  question?: string;
  answer?: string;
};

type FAQBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FAQBlockPreview({ propsJson }: FAQBlockPreviewProps) {
  const design = normalizeSectionDesign('faq', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-faq', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as FAQItem[]).slice(0, 8);

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section lp-section--narrow">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-faq__list">
          {items.map((item, index) => {
            const question = item.question;
            const answer = item.answer;
            if (!question || !answer) return null;
            return (
              <details key={`faq-${index}`} className="lp-faq__item">
                <summary className="lp-faq__question">{question}</summary>
                <p className="lp-faq__answer">{answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
