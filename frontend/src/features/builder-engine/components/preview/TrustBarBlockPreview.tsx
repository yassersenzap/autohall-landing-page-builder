import { parseMetrics } from '../../lib/list-props';

type TrustBarBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function TrustBarBlockPreview({ propsJson }: TrustBarBlockPreviewProps) {
  const metrics = parseMetrics(propsJson);
  if (metrics.length === 0) return null;

  return (
    <section className="lp-block lp-trust-bar" aria-label="Réassurance">
      <div className="lp-section">
        <div className="lp-trust-bar__grid">
          {metrics.map((metric, index) => (
            <div key={`${metric.label}-${index}`} className="lp-trust-bar__item">
              <p className="lp-trust-bar__value">{metric.value}</p>
              <p className="lp-trust-bar__label">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
