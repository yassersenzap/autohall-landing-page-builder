import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { CanvasCtaLink } from './CanvasCtaLink';

type VehicleOfferBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function VehicleOfferBlockPreview({ propsJson }: VehicleOfferBlockPreviewProps) {
  const modelName = asPropString(propsJson.modelName);
  const title =
    asPropString(propsJson.heading) || asPropString(propsJson.title) || modelName || 'Offre véhicule';
  const subtitle = asPropString(propsJson.subtitle);
  const price = asPropString(propsJson.priceValue) || asPropString(propsJson.price);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);

  return (
    <section className="lp-section lp-block px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          {subtitle ? <p className="mt-2 text-neutral-600">{subtitle}</p> : null}
          {price ? (
            <p className="mt-4 text-xl font-semibold" style={{ color: 'var(--primary)' }}>
              {price}
            </p>
          ) : null}
        </div>
        <HeroBlockImage imageAssetId={imageAssetId} imageUrl={imageUrl} alt={title} className="rounded-xl" />
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
  const title = asPropString(propsJson.title) || 'Prêt à en savoir plus ?';
  const subtitle = asPropString(propsJson.subtitle);
  const buttonText = asPropString(propsJson.buttonText) || 'Contactez-nous';
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';

  return (
    <section className="lp-section lp-final-cta px-6 py-12 text-center text-white" style={{ background: 'var(--primary)' }}>
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle ? <p className="mt-2 opacity-90">{subtitle}</p> : null}
      <CanvasCtaLink
        href={buttonTarget}
        interactive={interactive}
        className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-lg"
        style={{ color: 'var(--primary)' }}
      >
        {buttonText}
      </CanvasCtaLink>
    </section>
  );
}
