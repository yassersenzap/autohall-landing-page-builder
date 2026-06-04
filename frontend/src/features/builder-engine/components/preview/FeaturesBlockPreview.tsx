import { asPropString } from '../../lib/block-props';
import { parseListItems } from '../../lib/list-props';
import { SectionHeading } from './SectionHeading';

type FeaturesBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FeaturesBlockPreview({ propsJson }: FeaturesBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const modelName = asPropString(propsJson.modelName);
  const modelTagline = asPropString(propsJson.modelTagline);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.alt) || 'Véhicule';
  const items = parseListItems(propsJson, 'items');

  const media = imageUrl ? (
    <div className="lp-showcase__media">
      <img
        className="lp-showcase__img"
        src={imageUrl}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
      />
    </div>
  ) : (
    <div className="lp-showcase__media lp-showcase__media--placeholder" aria-hidden="true">
      <span>Visuel modèle</span>
    </div>
  );

  return (
    <section className="lp-block lp-features lp-features--showcase" id="model">
      <div className="lp-section">
        <SectionHeading heading={heading} subtitle={subtitle} />
        <div className="lp-showcase">
          {media}
          <div className="lp-showcase__copy">
            {modelName ? <p className="lp-showcase__model">{modelName}</p> : null}
            {modelTagline ? <p className="lp-showcase__tagline">{modelTagline}</p> : null}
            {items.length > 0 ? (
              <ul className="lp-showcase__specs">
                {items.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="lp-showcase__spec">
                    <strong className="lp-showcase__spec-title">{item.title}</strong>
                    <span className="lp-showcase__spec-text">{item.description}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
