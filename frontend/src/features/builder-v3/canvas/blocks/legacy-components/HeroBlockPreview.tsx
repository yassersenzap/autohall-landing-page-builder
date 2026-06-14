import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString, parseHeroProps } from '@/features/builder-engine/lib/block-props';
import {
  buildButtonClasses,
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  buildMediaImgClasses,
  getDesignFromProps,
} from '@/features/builder-engine/lib/block-style';
import { useBuilderPreviewContext } from '../../../context/BuilderPreviewContext';
import { BlockBackgroundLayer } from '../BlockBackgroundLayer';
import { CanvasCtaLink } from '../CanvasCtaLink';
import { ShapeDividerBottom } from '../ShapeDividerBottom';
import { CanvasEmptyHint } from '../CanvasEmptyHint';

type HeroBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function HeroBlockPreview({ propsJson, interactive: interactiveProp }: HeroBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const interactive = interactiveProp ?? previewContext.interactive;

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
  const bgType = asPropString(propsJson.backgroundType);
  const hasAdvancedBackground = bgType === 'color' || bgType === 'image';
  const shapeDividerBottom = propsJson.shapeDividerBottom === true;
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
        <CanvasEmptyHint className="lp-hero__title">Titre</CanvasEmptyHint>
      )}
      {props.subtitle ? (
        <p className="lp-hero__subtitle">{props.subtitle}</p>
      ) : (
        <CanvasEmptyHint className="lp-hero__subtitle">Sous-titre</CanvasEmptyHint>
      )}
      {props.buttonText || props.secondaryButtonText ? (
        <div className="lp-hero__actions">
          {props.buttonText ? (
            <CanvasCtaLink
              href={props.buttonTarget ?? '#lead-form'}
              className={primaryBtnClass}
              interactive={interactive}
            >
              {props.buttonText}
            </CanvasCtaLink>
          ) : null}
          {props.secondaryButtonText ? (
            <CanvasCtaLink
              href={props.secondaryButtonTarget ?? '#offer'}
              className="lp-btn lp-btn--secondary lp-btn--lg"
              interactive={interactive}
            >
              {props.secondaryButtonText}
            </CanvasCtaLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const media =
    !hideMedia && !isBgLayout ? (
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
    <section
      className={`${sectionClass}${hasAdvancedBackground ? ' relative overflow-hidden' : ''}`}
      style={inlineStyle}
    >
      {hasAdvancedBackground ? (
        <BlockBackgroundLayer propsJson={propsJson} gradientOverlay={false} />
      ) : null}
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
      <div className={`lp-hero__inner lp-section${hasAdvancedBackground ? ' relative z-10' : ''}`}>{inner}</div>
      {shapeDividerBottom ? <ShapeDividerBottom className="text-white" /> : null}
    </section>
  );
}
