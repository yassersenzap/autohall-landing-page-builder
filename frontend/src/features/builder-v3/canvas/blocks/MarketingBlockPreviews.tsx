import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
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
  const heading = asPropString(propsJson.heading) || 'Notre gamme';
  const vehicles = Array.isArray(propsJson.vehicles) ? propsJson.vehicles : [];

  return (
    <section className="lp-section lp-block px-6 py-12">
      <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900">{heading}</h2>
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.slice(0, 3).map((v, i) => {
          const item = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
          return (
            <article key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-neutral-900">{asPropString(item.name) || `Modèle ${i + 1}`}</p>
              <p className="text-xs text-neutral-500">{asPropString(item.energy) || '—'}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type BenefitsBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function BenefitsBlockPreview({ propsJson }: BenefitsBlockPreviewProps) {
  const heading = asPropString(propsJson.heading) || 'Nos avantages';
  const items = Array.isArray(propsJson.items) ? propsJson.items : [];

  return (
    <section className="lp-section lp-block px-6 py-12 bg-neutral-50">
      <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900">{heading}</h2>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {items.slice(0, 3).map((item, i) => {
          const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
          return (
            <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-medium text-neutral-900">{asPropString(row.title) || `Avantage ${i + 1}`}</p>
              <p className="mt-1 text-sm text-neutral-600">{asPropString(row.description)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type TrustBarBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function TrustBarBlockPreview({ propsJson }: TrustBarBlockPreviewProps) {
  const metrics = Array.isArray(propsJson.metrics) ? propsJson.metrics : [];

  return (
    <section className="lp-section lp-block border-y border-neutral-200 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 text-center">
        {metrics.length > 0 ? (
          metrics.slice(0, 4).map((m, i) => {
            const row = m && typeof m === 'object' ? (m as Record<string, unknown>) : {};
            return (
              <div key={i}>
                <p className="text-lg font-bold text-neutral-900">{asPropString(row.value) || '—'}</p>
                <p className="text-xs text-neutral-500">{asPropString(row.label) || 'Indicateur'}</p>
              </div>
            );
          })
        ) : (
          <>
            <div><p className="font-bold">+50</p><p className="text-xs text-neutral-500">Concessionnaires</p></div>
            <div><p className="font-bold">24h</p><p className="text-xs text-neutral-500">Réponse conseiller</p></div>
          </>
        )}
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
  const buttonText = asPropString(propsJson.buttonText) || 'Contactez-nous';
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
          <CanvasCtaLink href={buttonTarget} className={btnClass} interactive={interactive}>
            {buttonText}
          </CanvasCtaLink>
        </div>
      </div>
    </section>
  );
}
