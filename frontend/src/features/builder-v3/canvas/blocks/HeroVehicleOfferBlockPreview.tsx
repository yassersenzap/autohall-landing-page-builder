import { buildBrandCssVarMap, brandCssVarMapToStyle } from '@/features/builder/brand-presets/brand-css-vars';
import { resolveBrandPreset } from '@/features/builder/brand-presets/resolve-brand-preset';
import {
  buildHeroVehicleOfferSectionClasses,
  buildHeroVehicleOfferSectionStyle,
  parseHeroVehicleOfferProps,
} from '@/features/builder/blocks/hero-vehicle-offer/parse-hero-vehicle-offer-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { CanvasEmptyHint } from './CanvasEmptyHint';
import { CanvasCtaLink } from './CanvasCtaLink';

type HeroVehicleOfferBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function HeroImagePlaceholder({ alt }: { alt: string }) {
  return (
    <div className="lp-hero-vehicle-offer__media-placeholder" role="img" aria-label={alt}>
      <span className="lp-hero-vehicle-offer__media-placeholder-icon" aria-hidden>
        ◫
      </span>
      <span className="lp-hero-vehicle-offer__media-placeholder-label">Aperçu véhicule</span>
    </div>
  );
}

export function HeroVehicleOfferBlockPreview({ propsJson }: HeroVehicleOfferBlockPreviewProps) {
  const { interactive } = useBuilderPreviewContext();
  const props = parseHeroVehicleOfferProps(propsJson);
  const brand = resolveBrandPreset(props.brandId);
  const { className: sectionClass, style: sectionStyle } = mergeBlockSectionPresentation(
    buildHeroVehicleOfferSectionClasses(props),
    'hero_vehicle_offer',
    propsJson,
    buildHeroVehicleOfferSectionStyle(
      props,
      brandCssVarMapToStyle(buildBrandCssVarMap(brand)),
    ),
  );

  const hasDesktopImage = Boolean(props.heroImage || props.heroImageUrl);
  const hasMobileImage = Boolean(props.mobileImage || props.mobileImageUrl);
  const isBackground = props.imagePosition === 'background' || props.layoutVariant === 'full-bleed-overlay';

  const primaryCtaClass = [
    'lp-hero-vehicle-offer__cta',
    'lp-hero-vehicle-offer__cta--primary',
    `lp-hero-vehicle-offer__cta--${props.design.ctaStyle}`,
  ].join(' ');

  const secondaryCtaClass = [
    'lp-hero-vehicle-offer__cta',
    'lp-hero-vehicle-offer__cta--secondary',
    `lp-hero-vehicle-offer__cta--${props.design.ctaStyle === 'primary' ? 'outline' : props.design.ctaStyle}`,
  ].join(' ');

  const contentBlock = (
    <div className="lp-hero-vehicle-offer__content">
      <p className="lp-hero-vehicle-offer__brand">{brand.name}</p>
      {props.modelName ? (
        <p className="lp-hero-vehicle-offer__model">{props.modelName}</p>
      ) : (
        <CanvasEmptyHint className="lp-hero-vehicle-offer__model">Modèle</CanvasEmptyHint>
      )}
      {props.design.showOfferBadge && props.offerLabel ? (
        <span className="lp-hero-vehicle-offer__badge">{props.offerLabel}</span>
      ) : null}
      {props.headline ? (
        <h1 className="lp-hero-vehicle-offer__headline">{props.headline}</h1>
      ) : (
        <CanvasEmptyHint className="lp-hero-vehicle-offer__headline">Titre principal</CanvasEmptyHint>
      )}
      {props.subheadline ? (
        <p className="lp-hero-vehicle-offer__subheadline">{props.subheadline}</p>
      ) : (
        <CanvasEmptyHint className="lp-hero-vehicle-offer__subheadline">Sous-titre</CanvasEmptyHint>
      )}
      {props.priceText ? (
        <p className="lp-hero-vehicle-offer__price">{props.priceText}</p>
      ) : null}
      <div className="lp-hero-vehicle-offer__actions">
        {props.primaryCtaLabel ? (
          <CanvasCtaLink href="#lead-form" className={primaryCtaClass} interactive={interactive}>
            {props.primaryCtaLabel}
          </CanvasCtaLink>
        ) : null}
        {props.secondaryCtaLabel ? (
          <CanvasCtaLink href="#offer" className={secondaryCtaClass} interactive={interactive}>
            {props.secondaryCtaLabel}
          </CanvasCtaLink>
        ) : null}
      </div>
    </div>
  );

  const renderImage = (assetId: string | null, url: string | null) => {
    if (assetId || url) {
      return (
        <HeroBlockImage
          imageAssetId={assetId ?? undefined}
          imageUrl={url ?? undefined}
          alt={props.imageAlt}
          className="lp-hero-vehicle-offer__img"
        />
      );
    }
    return <HeroImagePlaceholder alt={props.imageAlt} />;
  };

  const mediaBlock = (
    <div className="lp-hero-vehicle-offer__media" data-lp-media>
      <div className="lp-hero-vehicle-offer__img-desktop">
        {hasDesktopImage
          ? renderImage(props.heroImage, props.heroImageUrl)
          : hasMobileImage
            ? renderImage(props.mobileImage ?? null, props.mobileImageUrl)
            : <HeroImagePlaceholder alt={props.imageAlt} />}
      </div>
      {hasMobileImage ? (
        <div className="lp-hero-vehicle-offer__img-mobile">
          {renderImage(props.mobileImage ?? null, props.mobileImageUrl)}
        </div>
      ) : null}
      {props.overlayIntensity !== 'none' ? (
        <div className="lp-hero-vehicle-offer__overlay" aria-hidden />
      ) : null}
    </div>
  );

  if (isBackground) {
    return (
      <section className={sectionClass} style={sectionStyle}>
        {mediaBlock}
        <div className="lp-hero-vehicle-offer__inner">{contentBlock}</div>
      </section>
    );
  }

  const mediaFirst =
    props.layoutVariant === 'split-media-left' || props.imagePosition === 'left';

  return (
    <section className={sectionClass} style={sectionStyle}>
      <div className="lp-hero-vehicle-offer__inner">
        {mediaFirst ? mediaBlock : contentBlock}
        {mediaFirst ? contentBlock : mediaBlock}
      </div>
    </section>
  );
}
