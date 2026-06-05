import { useState, type FormEvent } from 'react';
import { resolveLeadFormFieldsFromProps } from '@/features/builder-engine/constants/autohall-lead-form';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  getDesignFromProps,
} from '@/features/builder-engine/lib/block-style';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../lib/submit-lead-form';
import { CanvasEmptyHint } from './CanvasEmptyHint';
import { FormSuccessPanel } from './FormSuccessPanel';
import { FormSubmitButton } from './FormSubmitButton';

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

  const fields = resolveLeadFormFieldsFromProps(propsJson);
  const design = getDesignFromProps('lead_form', propsJson);
  const sectionClass = buildCanvasSectionClass('lead_form', 'lp-lead-form', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const submitText = asPropString(propsJson.submitText) || 'Envoyer votre demande';
  const consentLabel = asPropString(propsJson.consentLabel);
  const requiredNote = asPropString(propsJson.requiredFieldsNote) || '* Champs obligatoires.';
  const formConfig = propsJson.formConfig as Record<string, unknown> | undefined;
  const showConsent = formConfig?.showConsent !== false;

  const inputsLocked = !isLiveForm || submitting || submitted;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLiveForm || submitted) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitLeadFormFromDom(event.currentTarget, previewContext);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Envoi impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldsHtml = fields.map((field) => {
    const isFullWidth =
      field.fullWidth ||
      field.name === 'fullName' ||
      field.name === 'message' ||
      field.type === 'textarea';
    return (
      <label
        key={field.name}
        className={`lp-lead-form__field${isFullWidth ? ' lp-lead-form__field--full' : ''}`}
      >
        <span className="lp-lead-form__label">
          {field.label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </span>
        {field.type === 'select' ? (
          <select
            className="lp-lead-form__input lp-lead-form__select"
            name={field.name}
            disabled={inputsLocked}
            required={isLiveForm && field.required}
            tabIndex={isLiveForm ? undefined : -1}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            className="lp-lead-form__input lp-lead-form__textarea"
            name={field.name}
            rows={3}
            disabled={inputsLocked}
            readOnly={!isLiveForm}
            required={isLiveForm && field.required}
            tabIndex={isLiveForm ? undefined : -1}
          />
        ) : (
          <input
            className="lp-lead-form__input"
            type={field.type || 'text'}
            name={field.name}
            disabled={inputsLocked}
            readOnly={!isLiveForm}
            required={isLiveForm && field.required}
            tabIndex={isLiveForm ? undefined : -1}
          />
        )}
      </label>
    );
  });

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
          </aside>
          <div className="lp-lead-form__card">
            {submitted ? (
              <FormSuccessPanel />
            ) : (
              <form
                className="lp-lead-form__form"
                action="#"
                method="post"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLiveForm) return;
                  void handleSubmit(e);
                }}
              >
                <p className="lp-lead-form__required-note">{requiredNote}</p>
                <div className="lp-lead-form__grid">{fieldsHtml}</div>
                {showConsent && consentLabel ? (
                  <label className="lp-lead-form__field lp-lead-form__field--consent lp-lead-form__field--full">
                    <input
                      className="lp-lead-form__checkbox"
                      type="checkbox"
                      name="consent"
                      disabled={inputsLocked}
                      required={isLiveForm}
                      tabIndex={isLiveForm ? undefined : -1}
                    />
                    <span className="lp-lead-form__consent-text">{consentLabel}</span>
                  </label>
                ) : null}
                {errorMessage ? (
                  <p className="lp-lead-form__feedback is-error" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
                <FormSubmitButton
                  type={isLiveForm ? 'submit' : 'button'}
                  submitting={submitting}
                  disabled={!isLiveForm || submitting}
                  className="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit"
                  tabIndex={isLiveForm ? undefined : -1}
                >
                  {submitText}
                </FormSubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
