import { asPropString } from '../../lib/block-props';

type FinancingBlockPreviewProps = { propsJson: Record<string, unknown> };

export function FinancingBlockPreview({ propsJson }: FinancingBlockPreviewProps) {
  const bullets = Array.isArray(propsJson.bullets)
    ? propsJson.bullets.filter((b): b is string => typeof b === 'string')
    : [];

  return (
    <section className="lp-block lp-financing">
      <div className="lp-section">
        <div className="lp-financing__panel">
          <div>
            {asPropString(propsJson.heading) ? (
              <h2 className="lp-section-title">{asPropString(propsJson.heading)}</h2>
            ) : null}
            {asPropString(propsJson.subtitle) ? (
              <p className="lp-section-subtitle">{asPropString(propsJson.subtitle)}</p>
            ) : null}
            {asPropString(propsJson.paymentExample) ? (
              <p className="lp-financing__payment"><strong>{asPropString(propsJson.paymentExample)}</strong></p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="lp-financing__list">
                {bullets.map((b) => (
                  <li key={b} className="lp-financing__bullet">{b}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {asPropString(propsJson.ctaLabel) ? (
            <span className="lp-btn lp-btn--primary lp-btn--lg">{asPropString(propsJson.ctaLabel)}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
