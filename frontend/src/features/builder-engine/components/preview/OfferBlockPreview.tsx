import { asPropString } from '../../lib/block-props';
import { parseListItems } from '../../lib/list-props';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { SectionHeading } from './SectionHeading';

type OfferBlockPreviewProps = { propsJson: Record<string, unknown> };

export function OfferBlockPreview({ propsJson }: OfferBlockPreviewProps) {
  const modelName = asPropString(propsJson.modelName);
  const tagline = asPropString(propsJson.tagline);
  const priceValue = asPropString(propsJson.priceValue);
  const monthlyValue = asPropString(propsJson.monthlyValue);
  const buttonText = asPropString(propsJson.buttonText);
  const highlights = parseListItems(propsJson, 'highlights');
  const hasImage = Boolean(asPropString(propsJson.imageAssetId) || asPropString(propsJson.imageUrl));

  return (
    <section className="lp-block lp-vehicle-offer" id="offer">
      <div className="lp-section">
        <SectionHeading heading={asPropString(propsJson.heading)} subtitle={asPropString(propsJson.subtitle)} />
        <div className="lp-vehicle-offer__panel">
          <div className="lp-vehicle-offer__media">
            {hasImage ? (
              <HeroBlockImage
                imageAssetId={asPropString(propsJson.imageAssetId)}
                imageUrl={asPropString(propsJson.imageUrl)}
                alt={asPropString(propsJson.alt)}
                className="lp-vehicle-offer__img"
              />
            ) : (
              <div className="lp-vehicle-offer__media--placeholder">Visuel véhicule</div>
            )}
          </div>
          <div className="lp-vehicle-offer__body">
            {modelName ? <p className="lp-vehicle-offer__model">{modelName}</p> : null}
            {tagline ? <p className="lp-vehicle-offer__tagline">{tagline}</p> : null}
            {priceValue ? <p className="lp-vehicle-offer__price"><strong>{priceValue}</strong></p> : null}
            {monthlyValue ? <p className="lp-vehicle-offer__monthly">{monthlyValue}</p> : null}
            {highlights.length > 0 ? (
              <ul className="lp-vehicle-offer__highlights">
                {highlights.map((h, i) => (
                  <li key={i}><strong>{h.title}</strong> {h.description}</li>
                ))}
              </ul>
            ) : null}
            {buttonText ? <span className="lp-btn lp-btn--primary lp-btn--lg">{buttonText}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
