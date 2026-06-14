import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import {
  buildBlockDesignClasses,
  normalizeSectionDesign,
} from '@/features/builder-engine/lib/block-design-system';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import { appendBlockVisualToClass } from '@/features/builder/block-visual';

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
    appendBlockVisualToClass(
      'trust_bar',
      `lp-block ${buildBlockDesignClasses('lp-trust-bar', design)}`,
      propsJson,
    ),
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
