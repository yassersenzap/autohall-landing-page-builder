import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type FeatureItem = {
  title?: string;
  description?: string;
};

type VehicleFeaturesBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function VehicleFeaturesBlockPreview({ propsJson }: VehicleFeaturesBlockPreviewProps) {
  const design = normalizeSectionDesign('vehicle_features', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-features', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as FeatureItem[]).slice(0, 6);

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-features__grid">
          {items.map((item, index) => (
            <article key={`${item.title ?? 'feature'}-${index}`} className="lp-feature-card">
              <span className="lp-feature-card__index" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.title ? <h3 className="lp-feature-card__title">{item.title}</h3> : null}
              {item.description ? <p className="lp-feature-card__text">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
