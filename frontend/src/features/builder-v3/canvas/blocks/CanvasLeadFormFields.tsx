import type { FormEvent } from 'react';
import { resolveLeadFormFieldsFromProps } from '@/features/builder-engine/constants/autohall-lead-form';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { FormSubmitButton } from './FormSubmitButton';

type CanvasLeadFormFieldsProps = {
  propsJson: Record<string, unknown>;
  formClassName?: string;
  isLiveForm: boolean;
  inputsLocked: boolean;
  submitting: boolean;
  submitText?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

/** Champs formulaire lead partagés — classes lp-lead-form pour parité export. */
export function CanvasLeadFormFields({
  propsJson,
  formClassName = 'lp-lead-form__form',
  isLiveForm,
  inputsLocked,
  submitting,
  submitText: submitTextProp,
  onSubmit,
}: CanvasLeadFormFieldsProps) {
  const fields = resolveLeadFormFieldsFromProps(propsJson);
  const submitText =
    submitTextProp ?? (asPropString(propsJson.submitText) || 'Envoyer votre demande');
  const consentLabel = asPropString(propsJson.consentLabel);
  const requiredNote =
    asPropString(propsJson.requiredFieldsNote) || '* Champs obligatoires.';
  const formConfig = propsJson.formConfig as Record<string, unknown> | undefined;
  const showConsent = formConfig?.showConsent !== false;

  return (
    <form
      className={`lp-lead-form ${formClassName}`.trim()}
      action="#"
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLiveForm) return;
        onSubmit?.(e);
      }}
    >
      <p className="lp-lead-form__required-note">{requiredNote}</p>
      <div className="lp-lead-form__grid">
        {fields.map((field) => {
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
        })}
      </div>
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
      <p className="lp-lead-form__feedback" role="status" aria-live="polite" />
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
  );
}

/** Fusionne props bloc hero_form_campaign (form imbriqué ou champs plats). */
export function resolveHeroFormProps(propsJson: Record<string, unknown>): Record<string, unknown> {
  const nested = propsJson.form;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...(nested as Record<string, unknown>), ...propsJson };
  }
  return propsJson;
}
