import { useState, type FormEvent } from 'react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { useBuilderPreviewContext } from '../../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../../lib/submit-lead-form';
import { BlockBackgroundLayer } from '../BlockBackgroundLayer';
import { CanvasLeadFormFields } from '../CanvasLeadFormFields';
import { FormSuccessPanel } from '../FormSuccessPanel';
import { ShapeDividerBottom } from '../ShapeDividerBottom';

type PromoAutoHallBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function PromoAutoHallBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: PromoAutoHallBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const isLiveForm = interactiveProp ?? previewContext.interactive;

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title = asPropString(propsJson.title) || 'Votre prochaine aventure';
  const subtitle =
    asPropString(propsJson.subtitle) ||
    'Offres exclusives, financement sur mesure et essai en concession.';
  const legalNote = asPropString(propsJson.legalNote);
  const eyebrow = asPropString(propsJson.eyebrow);
  const promoBadge = asPropString(propsJson.promoBadge);
  const formTitle = asPropString(propsJson.formTitle) || 'Demandez votre offre';
  const formSubtitle = asPropString(propsJson.formSubtitle);
  const anchorId = asPropString(propsJson.anchorId);
  const textAlignment = asPropString(propsJson.textAlignment) || 'left';
  const shapeDividerBottom = propsJson.shapeDividerBottom === true;
  const bgType = asPropString(propsJson.backgroundType) || 'image';
  const inputsLocked = !isLiveForm || submitting || submitted;

  const alignClass =
    textAlignment === 'center'
      ? 'lp-promo-autohall__copy--center'
      : textAlignment === 'right'
        ? 'lp-promo-autohall__copy--right'
        : '';

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

  return (
    <section
      id={anchorId || undefined}
      className="lp-block lp-promo-autohall"
    >
      {bgType === 'color' ? (
        <BlockBackgroundLayer propsJson={propsJson} gradientOverlay={false} />
      ) : (
        <BlockBackgroundLayer propsJson={propsJson} gradientOverlay />
      )}

      <div className="lp-promo-autohall__inner lp-section relative z-10">
        <div className="lp-promo-autohall__grid">
          <div className={`lp-promo-autohall__copy ${alignClass}`}>
            {eyebrow ? <p className="lp-promo-autohall__eyebrow">{eyebrow}</p> : null}
            {promoBadge ? <span className="lp-promo-autohall__badge">{promoBadge}</span> : null}
            <h1 className="lp-promo-autohall__title">{title}</h1>
            <p className="lp-promo-autohall__subtitle">{subtitle}</p>
            {legalNote ? <p className="lp-promo-autohall__legal">{legalNote}</p> : null}
          </div>

          <div className="lp-promo-autohall__form-wrap">
            <div className="lp-promo-autohall__form-card">
              <h2 className="lp-promo-autohall__form-title">{formTitle}</h2>
              {formSubtitle ? (
                <p className="lp-promo-autohall__form-subtitle">{formSubtitle}</p>
              ) : null}
              {submitted ? (
                <FormSuccessPanel className="min-h-[12rem] py-6" />
              ) : (
                <>
                  <CanvasLeadFormFields
                    propsJson={propsJson}
                    formClassName="lp-lead-form__form lp-promo-autohall__form"
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
        </div>
      </div>

      {shapeDividerBottom ? <ShapeDividerBottom /> : null}
    </section>
  );
}
