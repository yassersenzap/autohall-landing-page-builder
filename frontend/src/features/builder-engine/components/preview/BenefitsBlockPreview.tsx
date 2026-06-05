import { parseListItems } from '../../lib/list-props';
import { asPropString } from '../../lib/block-props';
import { SectionHeading } from './SectionHeading';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type BenefitsBlockPreviewProps = { propsJson: Record<string, unknown> };

export function BenefitsBlockPreview({ propsJson }: BenefitsBlockPreviewProps) {
  const items = parseListItems(propsJson, 'items');
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);

  return (
    <section className="lp-block lp-benefits">
      <div className="lp-section">
        <SectionHeading heading={heading} subtitle={subtitle} />
        {items.length === 0 ? (
          <CanvasEmptyHint>Ajoutez vos avantages campagne</CanvasEmptyHint>
        ) : (
          <div className="lp-benefits__grid">
            {items.map((item, i) => (
              <article key={i} className="lp-card lp-benefits__card">
                <h3 className="lp-card__title">{item.title || '—'}</h3>
                <p className="lp-card__text">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
