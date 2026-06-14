import { useState, type FormEvent, type ReactNode } from 'react';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  buildPremiumCtaClass,
  buildPremiumSectionClasses,
  normalizePremiumDesign,
  parseTrustItems,
  resolveHeroFormImagePosition,
  resolveHeroFormLayoutVariant,
} from '@/features/builder-engine/lib/premium-block-design';
import { useBuilderPreviewContext } from '../../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../../lib/submit-lead-form';
import { CanvasEmptyHint } from '../CanvasEmptyHint';
import { CanvasLeadFormFields, resolveHeroFormProps } from '../CanvasLeadFormFields';
import { FormSuccessPanel } from '../FormSuccessPanel';

type HeroFormCampaignBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function HeroFormCampaignBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: HeroFormCampaignBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const isLiveForm = interactiveProp ?? previewContext.interactive;

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const premiumDesign = normalizePremiumDesign(propsJson);
  const layoutVariant = resolveHeroFormLayoutVariant(premiumDesign);
  const imagePosition = resolveHeroFormImagePosition(premiumDesign);

  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const eyebrow = asPropString(propsJson.eyebrow);
  const promoBadge = asPropString(propsJson.promoBadge);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';
  const legalNote = asPropString(propsJson.legalNote);
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.alt) || title || 'Visuel campagne';
  const trustItems = parseTrustItems(propsJson);

  const formProps = resolveHeroFormProps(propsJson);
  const formTitle = asPropString(formProps.title) || asPropString(propsJson.formTitle);
  const formSubtitle = asPropString(formProps.subtitle) || asPropString(propsJson.formSubtitle);
  const primaryBtnClass = buildPremiumCtaClass(premiumDesign, 'lp-btn lp-btn--md');
  const inputsLocked = !isLiveForm || submitting || submitted;
  const hasImage = Boolean(imageAssetId || imageUrl);

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
    buildPremiumSectionClasses('lp-hero-form-campaign', premiumDesign),
    `lp-hero-form-campaign--${layoutVariant}`,
  ].join(' ');

  const contentBlock = (
    <div className="lp-hero-form-campaign__content">
      {eyebrow ? <p className="lp-hero-form-campaign__eyebrow">{eyebrow}</p> : null}
      {promoBadge ? <span className="lp-hero-form-campaign__badge">{promoBadge}</span> : null}
      {title ? (
        <h1 className="lp-hero-form-campaign__title">{title}</h1>
      ) : (
        <CanvasEmptyHint className="lp-hero-form-campaign__title">Titre</CanvasEmptyHint>
      )}
      {subtitle ? (
        <p className="lp-hero-form-campaign__subtitle">{subtitle}</p>
      ) : (
        <CanvasEmptyHint className="lp-hero-form-campaign__subtitle">Sous-titre</CanvasEmptyHint>
      )}
      {trustItems.length > 0 ? (
        <ul className="lp-hero-form-campaign__trust">
          {trustItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {buttonText ? (
        <div className="lp-hero-form-campaign__actions">
          <a href={buttonTarget} className={primaryBtnClass}>
            {buttonText}
          </a>
        </div>
      ) : null}
      {legalNote ? <p className="lp-hero-form-campaign__legal">{legalNote}</p> : null}
    </div>
  );

  const mediaBlock =
    imagePosition !== 'none' ? (
      <div className="lp-hero-form-campaign__media">
        {hasImage ? (
          <HeroBlockImage
            imageAssetId={imageAssetId}
            imageUrl={imageUrl}
            alt={imageAlt}
            className="lp-hero-form-campaign__img"
          />
        ) : (
          <div
            className="lp-hero-form-campaign__media lp-hero-form-campaign__media--placeholder"
            aria-hidden
          />
        )}
      </div>
    ) : null;

  const formBlock = (
    <div className="lp-hero-form-campaign__form" id="lead-form">
      <div className="lp-hero-form-campaign__form-card">
        {formTitle ? (
          <h2 className="lp-hero-form-campaign__form-title">{formTitle}</h2>
        ) : (
          <CanvasEmptyHint className="lp-hero-form-campaign__form-title">Formulaire</CanvasEmptyHint>
        )}
        {formSubtitle ? (
          <p className="lp-hero-form-campaign__form-subtitle">{formSubtitle}</p>
        ) : null}
        {submitted ? (
          <FormSuccessPanel />
        ) : (
          <>
            <CanvasLeadFormFields
              propsJson={formProps}
              isLiveForm={isLiveForm}
              inputsLocked={inputsLocked}
              submitting={submitting}
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
  const formFirst = layoutVariant === 'form_left_text_right';
  if (layoutVariant === 'image_left_form_right') {
    inner = (
      <>
        {mediaBlock}
        {contentBlock}
        {formBlock}
      </>
    );
  } else if (formFirst) {
    inner = (
      <>
        {formBlock}
        {contentBlock}
        {mediaBlock}
      </>
    );
  } else {
    inner = (
      <>
        {contentBlock}
        {mediaBlock}
        {formBlock}
      </>
    );
  }

  return (
    <section className={sectionClass}>
      <div className="lp-section lp-hero-form-campaign__inner">{inner}</div>
    </section>
  );
}
