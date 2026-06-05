import { asPropString } from '../../lib/block-props';
import {
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  buildMediaImgClasses,
  getDesignFromProps,
} from '../../lib/block-style';
import { parseListItems } from '../../lib/list-props';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { CanvasEmptyHint } from './CanvasEmptyHint';
import { SectionHeading } from './SectionHeading';

type FeaturesBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FeaturesBlockPreview({ propsJson }: FeaturesBlockPreviewProps) {
  const design = getDesignFromProps('features', propsJson);
  const isShowcase = design.layoutVariant === 'showcase';
  const sectionBase = isShowcase ? 'lp-features lp-features--showcase' : 'lp-features';
  const sectionClass = buildCanvasSectionClass('features', sectionBase, propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const imgClass = buildMediaImgClasses('lp-showcase', design);

  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const modelName = asPropString(propsJson.modelName);
  const modelTagline = asPropString(propsJson.modelTagline);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);
  const hasImage = Boolean(imageAssetId || imageUrl);
  const items = parseListItems(propsJson, 'items');

  const gridClass =
    design.layoutVariant === 'compact_row'
      ? 'lp-features__row'
      : design.layoutVariant === 'icon_list'
        ? 'lp-features__icon-grid'
        : 'lp-features__grid';

  if (isShowcase) {
    const media = !hasImage ? (
      <div className="lp-showcase__media lp-showcase__media--placeholder" aria-hidden>
        <CanvasEmptyHint>Aucune image sélectionnée</CanvasEmptyHint>
      </div>
    ) : (
      <div className="lp-showcase__media">
        <HeroBlockImage
          imageAssetId={imageAssetId}
          imageUrl={imageUrl}
          alt={asPropString(propsJson.alt)}
          className={imgClass}
        />
      </div>
    );

    const copy = (
      <div className="lp-showcase__copy">
        {modelName ? <p className="lp-showcase__model">{modelName}</p> : null}
        {modelTagline ? <p className="lp-showcase__tagline">{modelTagline}</p> : null}
        {items.length > 0 ? (
          <ul className="lp-showcase__specs">
            {items.map((item, index) =>
              item.title.trim() || item.description.trim() ? (
                <li key={index} className="lp-showcase__spec">
                  {item.title.trim() ? (
                    <strong className="lp-showcase__spec-title">{item.title}</strong>
                  ) : null}
                  {item.description.trim() ? (
                    <span className="lp-showcase__spec-text">{item.description}</span>
                  ) : null}
                </li>
              ) : null,
            )}
          </ul>
        ) : (
          <CanvasEmptyHint>Ajoutez vos points forts</CanvasEmptyHint>
        )}
      </div>
    );

    const inner =
      design.mediaPosition === 'left' ? (
        <>
          {media}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {media}
        </>
      );

    return (
      <section className={sectionClass} id="model" style={inlineStyle}>
        <div className="lp-section">
          <SectionHeading heading={heading} subtitle={subtitle} />
          <div className={`lp-showcase lp-showcase--media-${design.mediaPosition}`}>{inner}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} style={inlineStyle}>
      <div className="lp-section">
        <SectionHeading heading={heading} subtitle={subtitle} />
        {items.some((i) => i.title.trim() || i.description.trim()) ? (
          <div className={gridClass}>
            {items.map((item, index) =>
              item.title.trim() || item.description.trim() ? (
                <article key={index} className="lp-feature-card">
                  <span className="lp-feature-card__index" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.title.trim() ? (
                    <h3 className="lp-feature-card__title">{item.title}</h3>
                  ) : (
                    <CanvasEmptyHint className="lp-feature-card__title">Titre</CanvasEmptyHint>
                  )}
                  {item.description.trim() ? (
                    <p className="lp-feature-card__text">{item.description}</p>
                  ) : null}
                </article>
              ) : null,
            )}
          </div>
        ) : (
          <CanvasEmptyHint>Ajoutez vos caractéristiques</CanvasEmptyHint>
        )}
      </div>
    </section>
  );
}
