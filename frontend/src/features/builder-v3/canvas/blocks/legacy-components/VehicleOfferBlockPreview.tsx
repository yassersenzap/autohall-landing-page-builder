import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import {
  buildPremiumCtaClass,
  buildPremiumSectionClasses,
  normalizePremiumDesign,
} from '@/features/builder-engine/lib/premium-block-design';
import { CanvasCtaLink } from '../CanvasCtaLink';
import { CanvasEmptyHint } from '../CanvasEmptyHint';

type VehicleOfferBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function VehicleOfferBlockPreview({ propsJson, interactive = false }: VehicleOfferBlockPreviewProps) {
  const premiumDesign = normalizePremiumDesign(propsJson);
  const sectionClass = buildPremiumSectionClasses('lp-vehicle-offer', premiumDesign);

  const modelName = asPropString(propsJson.modelName);
  const heading = asPropString(propsJson.heading) || asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const priceLabel = asPropString(propsJson.priceLabel) || 'À partir de';
  const priceValue = asPropString(propsJson.priceValue) || asPropString(propsJson.price);
  const monthlyValue = asPropString(propsJson.monthlyValue);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';
  const legalNote = asPropString(propsJson.legalNote);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.alt) || modelName || heading || 'Véhicule';
  const highlights = Array.isArray(propsJson.highlights)
    ? propsJson.highlights
    : Array.isArray(propsJson.items)
      ? propsJson.items
      : [];
  const btnClass = buildPremiumCtaClass(premiumDesign, 'lp-btn lp-btn--lg');
  const hasImage = Boolean(imageAssetId || imageUrl);

  const mediaBlock = (
    <div className="lp-vehicle-offer__media">
      {hasImage ? (
        <HeroBlockImage
          imageAssetId={imageAssetId}
          imageUrl={imageUrl}
          alt={imageAlt}
          className="lp-vehicle-offer__img"
        />
      ) : (
        <div className="lp-vehicle-offer__media lp-vehicle-offer__media--placeholder" aria-hidden />
      )}
    </div>
  );

  const bodyBlock = (
    <div className="lp-vehicle-offer__body">
      {modelName ? <p className="lp-vehicle-offer__model">{modelName}</p> : null}
      {heading ? (
        <p className="lp-vehicle-offer__tagline">{heading}</p>
      ) : (
        <CanvasEmptyHint className="lp-vehicle-offer__tagline">Offre</CanvasEmptyHint>
      )}
      {subtitle ? <p className="lp-vehicle-offer__subtitle">{subtitle}</p> : null}
      {priceValue ? (
        <p className="lp-vehicle-offer__price">
          <span className="lp-vehicle-offer__price-label">{priceLabel}</span>
          <strong>{priceValue}</strong>
        </p>
      ) : null}
      {monthlyValue ? <p className="lp-vehicle-offer__monthly">{monthlyValue}</p> : null}
      {highlights.length > 0 ? (
        <ul className="lp-vehicle-offer__highlights">
          {highlights.slice(0, 4).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            const itemTitle = asPropString(row.title);
            const itemDesc = asPropString(row.description);
            if (!itemTitle && !itemDesc) return null;
            return (
              <li key={index} className="lp-vehicle-offer__highlight">
                {itemTitle ? <strong>{itemTitle}</strong> : null}
                {itemDesc ? <span>{itemDesc}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {buttonText ? (
        <div className="lp-vehicle-offer__cta">
          <CanvasCtaLink href={buttonTarget} className={btnClass} interactive={interactive}>
            {buttonText}
          </CanvasCtaLink>
        </div>
      ) : null}
      {legalNote ? <p className="lp-vehicle-offer__legal">{legalNote}</p> : null}
    </div>
  );

  const panel =
    premiumDesign.mediaPosition === 'right' ? (
      <>
        {bodyBlock}
        {mediaBlock}
      </>
    ) : (
      <>
        {mediaBlock}
        {bodyBlock}
      </>
    );

  return (
    <section className={`lp-block ${sectionClass}`} id="offer">
      <div className="lp-section">
        <div className="lp-vehicle-offer__panel">{panel}</div>
      </div>
    </section>
  );
}
