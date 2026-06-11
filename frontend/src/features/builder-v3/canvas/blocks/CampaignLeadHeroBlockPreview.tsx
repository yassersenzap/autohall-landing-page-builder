import { buildBrandCssVarMap, brandCssVarMapToStyle } from '@/features/builder/brand-presets/brand-css-vars';
import { resolveBrandPreset } from '@/features/builder/brand-presets/resolve-brand-preset';
import {
  buildCampaignLeadHeroSectionClasses,
  buildCampaignLeadHeroSectionStyle,
  isBackgroundLayout,
  isDualMediaLayout,
  isFormFirst,
  parseCampaignLeadHeroProps,
  shouldRenderCampaignBeside,
  shouldRenderCampaignOverlay,
} from '@/features/builder/blocks/campaign-lead-hero';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type CampaignLeadHeroBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function MediaPlaceholder({ alt, label }: { alt: string; label: string }) {
  return (
    <div className="lp-campaign-lead-hero__media-placeholder" role="img" aria-label={alt}>
      <span className="lp-campaign-lead-hero__media-placeholder-icon" aria-hidden>
        ◫
      </span>
      <span className="lp-campaign-lead-hero__media-placeholder-label">{label}</span>
    </div>
  );
}

function CampaignLeadFormShell({
  props,
}: {
  props: ReturnType<typeof parseCampaignLeadHeroProps>;
}) {
  return (
    <aside className="lp-campaign-lead-hero__form" id="lead-form">
      <div className="lp-campaign-lead-hero__form-card">
        {props.design.showProgressBar ? (
          <div className="lp-campaign-lead-hero__progress" aria-hidden="true">
            <div className="lp-campaign-lead-hero__progress-track">
              <span className="lp-campaign-lead-hero__progress-fill" />
            </div>
            {props.formStepLabel ? (
              <p className="lp-campaign-lead-hero__step-label">{props.formStepLabel}</p>
            ) : null}
          </div>
        ) : null}
        {props.formTitle ? (
          <h2 className="lp-campaign-lead-hero__form-title">{props.formTitle}</h2>
        ) : (
          <CanvasEmptyHint className="lp-campaign-lead-hero__form-title">
            Titre formulaire
          </CanvasEmptyHint>
        )}
        {props.formSubtitle ? (
          <p className="lp-campaign-lead-hero__form-subtitle">{props.formSubtitle}</p>
        ) : null}
        <div className="lp-campaign-lead-hero__field-shell">
          <label className="lp-campaign-lead-hero__field-label" htmlFor="campaign-lead-preview-field">
            {props.formPrimaryFieldLabel || 'Champ principal'}
          </label>
          <select
            id="campaign-lead-preview-field"
            className="lp-campaign-lead-hero__field-control"
            disabled
            defaultValue=""
          >
            <option value="">{props.formPrimaryFieldLabel || 'Sélectionnez une option'}</option>
          </select>
        </div>
        <button type="button" className="lp-campaign-lead-hero__cta" disabled>
          {props.formCtaLabel || 'Continuer'}
        </button>
        {props.legalText ? (
          <p className="lp-campaign-lead-hero__legal">{props.legalText}</p>
        ) : null}
        {props.footerText ? (
          <p className="lp-campaign-lead-hero__footer">{props.footerText}</p>
        ) : null}
      </div>
    </aside>
  );
}

function CampaignContent({
  props,
  brandName,
  mode,
}: {
  props: ReturnType<typeof parseCampaignLeadHeroProps>;
  brandName: string;
  mode: 'overlay' | 'beside';
}) {
  return (
    <div
      className={[
        'lp-campaign-lead-hero__campaign',
        mode === 'overlay'
          ? 'lp-campaign-lead-hero__campaign--overlay'
          : 'lp-campaign-lead-hero__campaign--beside',
      ].join(' ')}
    >
      <p className="lp-campaign-lead-hero__brand">{brandName}</p>
      {props.design.showOfferBadge && props.offerBadge ? (
        <span className="lp-campaign-lead-hero__badge">{props.offerBadge}</span>
      ) : null}
      {props.campaignTitle ? (
        <h1 className="lp-campaign-lead-hero__title">{props.campaignTitle}</h1>
      ) : (
        <CanvasEmptyHint className="lp-campaign-lead-hero__title">Titre campagne</CanvasEmptyHint>
      )}
      {props.campaignSubtitle ? (
        <p className="lp-campaign-lead-hero__subtitle">{props.campaignSubtitle}</p>
      ) : (
        <CanvasEmptyHint className="lp-campaign-lead-hero__subtitle">Sous-titre campagne</CanvasEmptyHint>
      )}
    </div>
  );
}

export function CampaignLeadHeroBlockPreview({ propsJson }: CampaignLeadHeroBlockPreviewProps) {
  const props = parseCampaignLeadHeroProps(propsJson);
  const brand = resolveBrandPreset(props.brandId);
  const placement = props.contentPlacement || props.resolvedContentPlacement;
  const sectionClass = buildCampaignLeadHeroSectionClasses({
    ...props,
    resolvedContentPlacement: placement,
  });
  const sectionStyle = buildCampaignLeadHeroSectionStyle(
    props,
    brandCssVarMapToStyle(buildBrandCssVarMap(brand)),
  );

  const renderImage = (
    assetId: string | null,
    url: string | null,
    alt: string,
    className: string,
  ) => {
    if (assetId || url) {
      return (
        <HeroBlockImage
          imageAssetId={assetId ?? undefined}
          imageUrl={url ?? undefined}
          alt={alt}
          className={className}
        />
      );
    }
    return <MediaPlaceholder alt={alt} label="Visuel campagne" />;
  };

  const hasPrimary = Boolean(props.primaryImage || props.primaryImageUrl);
  const hasSecondary = Boolean(props.secondaryImage || props.secondaryImageUrl);
  const hasMobile = Boolean(props.mobileImage || props.mobileImageUrl);
  const dual = isDualMediaLayout(props.layoutVariant);
  const background = isBackgroundLayout(props.layoutVariant);
  const formFirst = isFormFirst(props.layoutVariant);

  const primaryAlt = props.primaryImageAltResolved;
  const secondaryAlt = props.secondaryImageAlt || primaryAlt;

  const mediaInner = dual ? (
    <div className="lp-campaign-lead-hero__dual-media">
      <div className="lp-campaign-lead-hero__media-primary">
        {hasPrimary
          ? renderImage(props.primaryImage, props.primaryImageUrl, primaryAlt, 'lp-campaign-lead-hero__img')
          : <MediaPlaceholder alt={primaryAlt} label="Visuel 1" />}
      </div>
      <div className="lp-campaign-lead-hero__media-secondary">
        {hasSecondary
          ? renderImage(
              props.secondaryImage ?? null,
              props.secondaryImageUrl,
              secondaryAlt,
              'lp-campaign-lead-hero__img',
            )
          : <MediaPlaceholder alt={secondaryAlt} label="Visuel 2" />}
      </div>
    </div>
  ) : (
    <>
      <div className="lp-campaign-lead-hero__img-desktop">
        {hasPrimary
          ? renderImage(props.primaryImage, props.primaryImageUrl, primaryAlt, 'lp-campaign-lead-hero__img')
          : hasMobile
            ? renderImage(props.mobileImage ?? null, props.mobileImageUrl, primaryAlt, 'lp-campaign-lead-hero__img')
            : <MediaPlaceholder alt={primaryAlt} label="Visuel campagne" />}
      </div>
      {hasMobile ? (
        <div className="lp-campaign-lead-hero__img-mobile">
          {renderImage(props.mobileImage ?? null, props.mobileImageUrl, primaryAlt, 'lp-campaign-lead-hero__img')}
        </div>
      ) : null}
    </>
  );

  const mediaBlock = (
    <div className="lp-campaign-lead-hero__media" data-lp-media>
      {mediaInner}
      {props.overlayIntensity !== 'none' ? (
        <div className="lp-campaign-lead-hero__overlay" aria-hidden="true" />
      ) : null}
    </div>
  );

  const showOverlay = shouldRenderCampaignOverlay(placement);
  const showBeside = shouldRenderCampaignBeside(placement);

  const mediaStage = (
    <div className="lp-campaign-lead-hero__media-stage">
      {mediaBlock}
      {showOverlay ? (
        <CampaignContent props={props} brandName={brand.name} mode="overlay" />
      ) : null}
    </div>
  );

  const formBlock = <CampaignLeadFormShell props={props} />;
  const besideCampaign = showBeside ? (
    <CampaignContent props={props} brandName={brand.name} mode="beside" />
  ) : null;

  if (background) {
    return (
      <section className={sectionClass} style={sectionStyle}>
        {mediaBlock}
        <div className="lp-campaign-lead-hero__inner">
          {formFirst ? (
            <>
              {formBlock}
              {besideCampaign}
            </>
          ) : (
            <>
              {besideCampaign}
              {formBlock}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} style={sectionStyle}>
      <div className="lp-campaign-lead-hero__inner">
        {formFirst ? formBlock : null}
        {mediaStage}
        {formFirst ? null : formBlock}
        {!background && showBeside ? besideCampaign : null}
      </div>
    </section>
  );
}
