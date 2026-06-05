import { asPropString, parseHeroProps } from '../../lib/block-props';
import {
  buildButtonClasses,
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  buildMediaImgClasses,
  getDesignFromProps,
} from '../../lib/block-style';
import { HeroBlockImage } from '../media/HeroBlockImage';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type HeroBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

/**
 * Canvas aligné sur `lp-hero` (mêmes classes que le renderer backend).
 */
export function HeroBlockPreview({ propsJson }: HeroBlockPreviewProps) {
  const props = parseHeroProps(propsJson);
  const design = getDesignFromProps('hero', propsJson);
  const campaignType = asPropString(propsJson.campaignType);
  const promoBadge = asPropString(propsJson.promoBadge);
  const campaignClass =
    campaignType && ['promo', 'sav', 'gamme', 'lead_capture'].includes(campaignType)
      ? ` lp-hero--campaign-${campaignType}`
      : '';
  const sectionClass = buildCanvasSectionClass('hero', 'lp-hero', propsJson) + campaignClass;
  const inlineStyle = buildCanvasInlineStyle(design);
  const imgClass = buildMediaImgClasses('lp-hero', design);

  const hasImage = Boolean(props.imageAssetId || props.imageUrl);
  const isBgLayout = design.layoutVariant === 'background_image';
  const hideMedia = design.layoutVariant === 'minimal' || design.mediaPosition === 'none';

  const primaryBtnClass = buildButtonClasses(design);

  const content = (
    <div className="lp-hero__content">
      {props.eyebrow ? <p className="lp-hero__eyebrow">{props.eyebrow}</p> : null}
      {promoBadge ? <span className="lp-hero__badge">{promoBadge}</span> : null}
      {props.title ? (
        <h1 className="lp-hero__title">{props.title}</h1>
      ) : (
        <CanvasEmptyHint className="lp-hero__title opacity-60">Titre principal à renseigner</CanvasEmptyHint>
      )}
      {props.subtitle ? (
        <p className="lp-hero__subtitle">{props.subtitle}</p>
      ) : (
        <CanvasEmptyHint className="lp-hero__subtitle opacity-50">
          Sous-titre à renseigner
        </CanvasEmptyHint>
      )}
      {props.buttonText || props.secondaryButtonText ? (
        <div className="lp-hero__actions">
          {props.buttonText ? (
            <span className={primaryBtnClass}>{props.buttonText}</span>
          ) : null}
          {props.secondaryButtonText ? (
            <span className="lp-btn lp-btn--secondary lp-btn--lg">{props.secondaryButtonText}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const media = !hideMedia && !isBgLayout ? (
    hasImage ? (
      <div className="lp-hero__media">
        <HeroBlockImage
          imageAssetId={props.imageAssetId}
          imageUrl={props.imageUrl}
          alt={props.alt}
          className={imgClass}
        />
      </div>
    ) : (
      <div className="lp-hero__media lp-hero__media--placeholder" aria-hidden>
        <CanvasEmptyHint>Visuel véhicule — ajoutez une photo</CanvasEmptyHint>
      </div>
    )
  ) : null;

  const inner =
    design.mediaPosition === 'left' && !isBgLayout ? (
      <>
        {media}
        {content}
      </>
    ) : (
      <>
        {content}
        {media}
      </>
    );

  return (
    <section className={sectionClass} style={inlineStyle}>
      {isBgLayout && hasImage ? (
        <div className="lp-hero__bg" aria-hidden>
          <HeroBlockImage
            imageAssetId={props.imageAssetId}
            imageUrl={props.imageUrl}
            alt=""
            className={imgClass}
          />
        </div>
      ) : null}
      {isBgLayout && design.overlayOpacity !== 'none' ? (
        <div className="lp-hero__overlay" aria-hidden />
      ) : null}
      <div className="lp-hero__glow" aria-hidden />
      <div className="lp-hero__inner lp-section">{inner}</div>
    </section>
  );
}
