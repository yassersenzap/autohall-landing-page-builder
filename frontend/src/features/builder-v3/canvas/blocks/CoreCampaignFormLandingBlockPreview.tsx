import { useState, type FormEvent, type ReactNode } from 'react';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../lib/submit-lead-form';
import { CanvasEmptyHint } from './CanvasEmptyHint';
import { CanvasLeadFormFields, resolveHeroFormProps } from './CanvasLeadFormFields';
import { FormSuccessPanel } from './FormSuccessPanel';

type CoreCampaignFormLandingBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function CoreCampaignFormLandingBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: CoreCampaignFormLandingBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const isLiveForm = interactiveProp ?? previewContext.interactive;
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const coreLayout = asPropString(propsJson.coreLayout) || 'image_left_form_right';
  const visualType = asPropString(propsJson.visualType) || 'campaign_image';
  const stepCount = Number(propsJson.stepCount) === 3 ? 3 : 2;
  const stepIndex = 1;

  const brandLogoText = asPropString(propsJson.brandLogoText);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const offerLine = asPropString(propsJson.offerLine);
  const legalNote = asPropString(propsJson.legalNote);
  const footerCopyright = asPropString(propsJson.footerCopyright);
  const primaryCtaLabel = asPropString(propsJson.primaryCtaLabel);
  const primaryCtaHref = asPropString(propsJson.primaryCtaHref) || '#lead-form';
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.alt) || title || 'Visuel campagne';
  const overlayStrength = asPropString(propsJson.overlayStrength) || 'medium';

  const formProps = resolveHeroFormProps(propsJson);
  const formTitle = asPropString(formProps.title) || asPropString(propsJson.formTitle);
  const formSubtitle = asPropString(formProps.subtitle) || asPropString(propsJson.formSubtitle);
  const submitText = asPropString(formProps.submitText) || asPropString(propsJson.submitText) || 'Envoyer';
  const hasImage = Boolean(imageAssetId || imageUrl);
  const inputsLocked = !isLiveForm || submitting || submitted;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLiveForm || submitted) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await submitLeadFormFromDom(event.currentTarget, previewContext);
      if (result.ok) setSubmitted(true);
      else setErrorMessage(result.message);
    } catch {
      setErrorMessage('Envoi impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  const sectionClass = [
    'lp-core-campaign-landing',
    `lp-core-campaign-landing--${coreLayout}`,
    `lp-core-campaign-landing--visual-${visualType}`,
    `lp-core-campaign-landing--overlay-${overlayStrength}`,
    hasImage && coreLayout === 'background_image_form_card' ? 'lp-core-campaign-landing--has-bg' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mediaBlock = hasImage ? (
    <div className="lp-core-campaign-landing__media">
      <HeroBlockImage
        imageAssetId={imageAssetId}
        imageUrl={imageUrl}
        alt={imageAlt}
        className="lp-core-campaign-landing__img"
      />
    </div>
  ) : (
    <div className="lp-core-campaign-landing__media lp-core-campaign-landing__media--placeholder" aria-hidden />
  );

  const contentBlock = (
    <div className="lp-core-campaign-landing__content">
      {brandLogoText ? <p className="lp-core-campaign-landing__brand">{brandLogoText}</p> : null}
      {offerLine ? <p className="lp-core-campaign-landing__offer">{offerLine}</p> : null}
      {title ? <h1 className="lp-core-campaign-landing__title">{title}</h1> : null}
      {subtitle ? <p className="lp-core-campaign-landing__subtitle">{subtitle}</p> : null}
      {primaryCtaLabel ? (
        <a className="lp-btn lp-btn--secondary lp-btn--md lp-core-campaign-landing__cta" href={primaryCtaHref}>
          {primaryCtaLabel}
        </a>
      ) : null}
      {legalNote ? <p className="lp-core-campaign-landing__legal">{legalNote}</p> : null}
    </div>
  );

  const formBlock = (
    <div className="lp-core-campaign-landing__form" id="lead-form">
      <div className="lp-core-campaign-landing__form-card">
        <div className="lp-core-campaign-landing__steps" aria-hidden>
          <span className="lp-core-campaign-landing__step-label">
            Étape {stepIndex}/{stepCount}
          </span>
          <div className="lp-core-campaign-landing__step-dots">
            {Array.from({ length: stepCount }, (_, i) => (
              <span
                key={i}
                className={`lp-core-campaign-landing__step-dot${i + 1 === stepIndex ? ' is-active' : ''}`}
              />
            ))}
          </div>
        </div>
        {formTitle ? <h2 className="lp-core-campaign-landing__form-title">{formTitle}</h2> : null}
        {formSubtitle ? <p className="lp-core-campaign-landing__form-subtitle">{formSubtitle}</p> : null}
        {submitted ? (
          <FormSuccessPanel />
        ) : (
          <>
            <CanvasLeadFormFields
              propsJson={formProps}
              formClassName="lp-lead-form__form"
              isLiveForm={isLiveForm}
              inputsLocked={inputsLocked}
              submitting={submitting}
              submitText={submitText}
              onSubmit={(e) => void handleSubmit(e)}
            />
            {errorMessage ? (
              <p className="lp-lead-form__feedback is-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );

  let inner: ReactNode;
  if (coreLayout === 'form_left_image_right') {
    inner = (
      <>
        {formBlock}
        {mediaBlock}
        {contentBlock}
      </>
    );
  } else if (coreLayout === 'full_width_banner_form_side') {
    inner = (
      <>
        {mediaBlock}
        <div className="lp-core-campaign-landing__split">
          {contentBlock}
          {formBlock}
        </div>
      </>
    );
  } else if (coreLayout === 'background_image_form_card') {
    inner = (
      <>
        {contentBlock}
        {formBlock}
      </>
    );
  } else {
    inner = (
      <>
        {mediaBlock}
        {contentBlock}
        {formBlock}
      </>
    );
  }

  if (!title && !formTitle && !hasImage) {
    return <CanvasEmptyHint>Landing campagne + formulaire</CanvasEmptyHint>;
  }

  return (
    <section className={sectionClass} data-testid="core-campaign-form-landing-preview">
      <div className="lp-section lp-core-campaign-landing__inner">
        {inner}
        {footerCopyright ? (
          <footer className="lp-core-campaign-landing__footer">
            <p>{footerCopyright}</p>
          </footer>
        ) : null}
      </div>
    </section>
  );
}
