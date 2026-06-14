import { useState, type FormEvent } from 'react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  getDesignFromProps,
} from '@/features/builder-engine/lib/block-style';
import { useBuilderPreviewContext } from '../../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../../lib/submit-lead-form';
import { CanvasEmptyHint } from '../CanvasEmptyHint';
import { CanvasLeadFormFields } from '../CanvasLeadFormFields';
import { FormSuccessPanel } from '../FormSuccessPanel';

type LeadFormBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function LeadFormBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: LeadFormBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const isLiveForm = interactiveProp ?? previewContext.interactive;

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const design = getDesignFromProps('lead_form', propsJson);
  const sectionClass = buildCanvasSectionClass('lead_form', 'lp-lead-form', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const privacyNote =
    asPropString(propsJson.privacyNote) || asPropString(propsJson.legalNote);
  const reassurance = Array.isArray(propsJson.reassurance)
    ? (propsJson.reassurance as unknown[]).filter(
        (v): v is string => typeof v === 'string' && v.trim().length > 0,
      )
    : [];
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

  return (
    <section className={sectionClass} id="lead-form" style={inlineStyle}>
      <div className="lp-section">
        <div className="lp-lead-form__layout">
          <aside className="lp-lead-form__aside">
            {title ? (
              <h2 className="lp-lead-form__title">{title}</h2>
            ) : (
              <CanvasEmptyHint className="lp-lead-form__title">Titre du formulaire</CanvasEmptyHint>
            )}
            {subtitle ? <p className="lp-lead-form__subtitle">{subtitle}</p> : null}
            {reassurance.length > 0 ? (
              <ul className="lp-lead-form__reassurance">
                {reassurance.map((item) => (
                  <li key={item} className="lp-lead-form__reassurance-item">
                    <span className="lp-lead-form__check" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="lp-lead-form__reassurance">
                <li className="lp-lead-form__reassurance-item">
                  <span className="lp-lead-form__check" aria-hidden="true" />
                  Réponse sous 24 h ouvrées
                </li>
                <li className="lp-lead-form__reassurance-item">
                  <span className="lp-lead-form__check" aria-hidden="true" />
                  Conseiller dédié Auto Hall
                </li>
              </ul>
            )}
          </aside>
          <div className="lp-lead-form__card">
            {submitted ? (
              <FormSuccessPanel />
            ) : (
              <>
                <CanvasLeadFormFields
                  propsJson={propsJson}
                  isLiveForm={isLiveForm}
                  inputsLocked={inputsLocked}
                  submitting={submitting}
                  onSubmit={(e) => void handleSubmit(e)}
                />
                {privacyNote ? <p className="lp-lead-form__privacy">{privacyNote}</p> : null}
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
    </section>
  );
}
