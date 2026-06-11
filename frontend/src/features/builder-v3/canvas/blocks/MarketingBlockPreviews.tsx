import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import {
  buildBlockDesignClasses,
  normalizeSectionDesign,
} from '@/features/builder-engine/lib/block-design-system';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import {
  buildButtonClasses,
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  getDesignFromProps,
} from '@/features/builder-engine/lib/block-style';
import {
  buildPremiumCtaClass,
  buildPremiumSectionClasses,
  normalizePremiumDesign,
} from '@/features/builder-engine/lib/premium-block-design';
import { CanvasCtaLink } from './CanvasCtaLink';
import { CanvasEmptyHint } from './CanvasEmptyHint';

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

type VehicleRangeBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function VehicleRangeBlockPreview({ propsJson }: VehicleRangeBlockPreviewProps) {
  const design = normalizeSectionDesign('vehicle_range', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-vehicle-range', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const vehicles = Array.isArray(propsJson.vehicles) ? propsJson.vehicles : [];

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-vehicle-range__grid">
          {vehicles.slice(0, 6).map((v, i) => {
            const item = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
            const name = asPropString(item.name);
            const energy = asPropString(item.energy);
            const tag = asPropString(item.tag);
            const ctaText = asPropString(item.ctaText) || 'Découvrir';
            const ctaTarget = asPropString(item.ctaTarget) || '#lead-form';
            const imageAssetId = asPropString(item.imageAssetId);
            const imageUrl = asPropString(item.imageUrl);
            const hasImage = Boolean(imageAssetId || imageUrl);
            if (!name) return null;
            return (
              <article key={i} className="lp-vehicle-card">
                <div className="lp-vehicle-card__media">
                  {hasImage ? (
                    <HeroBlockImage
                      imageAssetId={imageAssetId}
                      imageUrl={imageUrl}
                      alt={asPropString(item.alt) || name}
                      className="lp-vehicle-card__img"
                    />
                  ) : (
                    <div className="lp-vehicle-card__placeholder" aria-hidden />
                  )}
                </div>
                <div className="lp-vehicle-card__body">
                  {tag ? <span className="lp-vehicle-card__tag">{tag}</span> : null}
                  <h3 className="lp-vehicle-card__name">{name}</h3>
                  {energy ? <span className="lp-vehicle-card__energy">{energy}</span> : null}
                  <a className="lp-btn lp-btn--secondary lp-btn--md lp-vehicle-card__cta" href={ctaTarget}>
                    {ctaText}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type BenefitsBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function BenefitsBlockPreview({ propsJson }: BenefitsBlockPreviewProps) {
  const design = normalizeSectionDesign('benefits', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-benefits', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const items = Array.isArray(propsJson.items) ? propsJson.items : [];

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-benefits__grid">
          {items.slice(0, 6).map((item, i) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            const title = asPropString(row.title);
            const description = asPropString(row.description);
            if (!title && !description) return null;
            return (
              <article key={i} className="lp-card lp-benefits__card">
                {title ? <h3 className="lp-card__title">{title}</h3> : null}
                {description ? <p className="lp-card__text">{description}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type TrustBarBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function TrustBarBlockPreview({ propsJson }: TrustBarBlockPreviewProps) {
  const design = normalizeSectionDesign('trust_bar', propsJson);
  const { className: sectionClass } = mergeBlockSectionPresentation(
    `lp-block ${buildBlockDesignClasses('lp-trust-bar', design)}`,
    'trust_bar',
    propsJson,
  );
  const metrics = Array.isArray(propsJson.metrics) ? propsJson.metrics : [];

  return (
    <section className={sectionClass} aria-label="Réassurance">
      <div className="lp-section">
        <div className="lp-trust-bar__grid">
          {metrics.slice(0, 4).map((m, i) => {
            const row = m && typeof m === 'object' ? (m as Record<string, unknown>) : {};
            const value = asPropString(row.value);
            const label = asPropString(row.label);
            if (!value || !label) return null;
            return (
              <div key={i} className="lp-trust-bar__item">
                <p className="lp-trust-bar__value">{value}</p>
                <p className="lp-trust-bar__label">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type FinalCtaBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function FinalCtaBlockPreview({
  propsJson,
  interactive = false,
}: FinalCtaBlockPreviewProps) {
  const design = getDesignFromProps('final_cta', propsJson);
  const sectionClass = buildCanvasSectionClass('final_cta', 'lp-final-cta', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const btnClass = buildButtonClasses(design);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';

  return (
    <section className={sectionClass} style={inlineStyle}>
      <div className="lp-section">
        <div className="lp-final-cta__panel">
          {title ? (
            <h2 className="lp-final-cta__title">{title}</h2>
          ) : (
            <CanvasEmptyHint className="lp-final-cta__title">Titre de conversion</CanvasEmptyHint>
          )}
          {subtitle ? <p className="lp-final-cta__subtitle">{subtitle}</p> : null}
          {buttonText ? (
            <CanvasCtaLink href={buttonTarget} className={btnClass} interactive={interactive}>
              {buttonText}
            </CanvasCtaLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
