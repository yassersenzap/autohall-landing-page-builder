import { asPropString } from '../../lib/block-props';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { SectionHeading } from './SectionHeading';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type VehicleRangeBlockPreviewProps = { propsJson: Record<string, unknown> };

type VehicleItem = Record<string, unknown>;

export function VehicleRangeBlockPreview({ propsJson }: VehicleRangeBlockPreviewProps) {
  const vehicles = Array.isArray(propsJson.vehicles)
    ? (propsJson.vehicles as VehicleItem[])
    : [];

  return (
    <section className="lp-block lp-vehicle-range">
      <div className="lp-section">
        <SectionHeading heading={asPropString(propsJson.heading)} subtitle={asPropString(propsJson.subtitle)} />
        {vehicles.length === 0 ? (
          <CanvasEmptyHint>Ajoutez les modèles de la gamme</CanvasEmptyHint>
        ) : (
          <div className="lp-vehicle-range__grid">
            {vehicles.map((v, i) => {
              const name = asPropString(v.name);
              const hasImage = Boolean(asPropString(v.imageAssetId) || asPropString(v.imageUrl));
              return (
                <article key={i} className="lp-vehicle-card">
                  <div className="lp-vehicle-card__media">
                    {hasImage ? (
                      <HeroBlockImage
                        imageAssetId={asPropString(v.imageAssetId)}
                        imageUrl={asPropString(v.imageUrl)}
                        alt={asPropString(v.alt)}
                        className="lp-vehicle-card__img"
                      />
                    ) : (
                      <div className="lp-vehicle-card__placeholder">Visuel modèle</div>
                    )}
                  </div>
                  <div className="lp-vehicle-card__body">
                    {asPropString(v.tag) ? <span className="lp-vehicle-card__tag">{asPropString(v.tag)}</span> : null}
                    <h3 className="lp-vehicle-card__name">{name || 'Modèle'}</h3>
                    {asPropString(v.energy) ? (
                      <span className="lp-vehicle-card__energy">{asPropString(v.energy)}</span>
                    ) : null}
                    <span className="lp-btn lp-btn--secondary lp-btn--md">
                      {asPropString(v.ctaText) || 'Découvrir'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
