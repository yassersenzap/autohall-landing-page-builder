import { useState, type FormEvent } from 'react';
import { resolveLeadFormFieldsFromProps } from '@/features/builder-engine/constants/autohall-lead-form';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { submitLeadFormFromDom } from '../../lib/submit-lead-form';
import {
  resolveSectionPadding,
  resolveTextAlignment,
} from '../../constants/block-layout';
import { BlockBackgroundLayer } from './BlockBackgroundLayer';
import { FormSuccessPanel } from './FormSuccessPanel';
import { FormSubmitButton } from './FormSubmitButton';
import { ShapeDividerBottom } from './ShapeDividerBottom';

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
  const submitText = asPropString(propsJson.submitText) || 'Envoyer ma demande';
  const consentLabel = asPropString(propsJson.consentLabel);
  const requiredNote = asPropString(propsJson.requiredFieldsNote) || '* Champs obligatoires.';
  const anchorId = asPropString(propsJson.anchorId);
  const formConfig = propsJson.formConfig as Record<string, unknown> | undefined;
  const showConsent = formConfig?.showConsent !== false;

  const fields = resolveLeadFormFieldsFromProps(propsJson);
  const paddingClass = resolveSectionPadding(asPropString(propsJson.sectionPadding));
  const textAlignClass = resolveTextAlignment(asPropString(propsJson.textAlignment));
  const formBorderRadius = Number.parseInt(String(propsJson.formBorderRadius ?? '16'), 10) || 16;
  const formGlassEffect = propsJson.formGlassEffect === true;
  const shapeDividerBottom = propsJson.shapeDividerBottom === true;
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

  return (
    <section
      id={anchorId || undefined}
      className={cn(
        'relative flex h-screen min-h-[800px] w-full items-center overflow-hidden',
        paddingClass,
      )}
    >
      <BlockBackgroundLayer propsJson={propsJson} gradientOverlay />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-8 lg:grid-cols-2">
        <div className={cn('relative flex flex-col space-y-4 text-white', textAlignClass)}>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>
          ) : null}
          {promoBadge ? (
            <span className="inline-block rounded-full bg-[var(--primary,var(--lp-primary,#b91c1c))] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {promoBadge}
            </span>
          ) : null}
          <h1
            className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{subtitle}</p>
          {legalNote ? (
            <p className="max-w-lg text-[0.6875rem] leading-relaxed text-white/55">{legalNote}</p>
          ) : null}
        </div>

        <div className="relative w-full max-w-md justify-self-center lg:justify-self-end">
          <div
            className={cn(
              'p-6 shadow-2xl sm:p-8',
              formGlassEffect ? 'bg-white/70 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md',
            )}
            style={{ borderRadius: `${formBorderRadius}px` }}
          >
            <div className="mb-5 space-y-1">
              <h2
                className="text-xl font-bold text-neutral-900"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {formTitle}
              </h2>
              {formSubtitle ? (
                <p className="text-sm text-neutral-600">{formSubtitle}</p>
              ) : null}
            </div>

            {submitted ? (
              <FormSuccessPanel className="min-h-[12rem] py-6" />
            ) : (
              <form
                className="space-y-3"
                action="#"
                method="post"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLiveForm) return;
                  void handleSubmit(e);
                }}
              >
                <p className="text-[0.625rem] text-neutral-500">{requiredNote}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {fields.map((field) => {
                    const full =
                      field.fullWidth ||
                      field.name === 'fullName' ||
                      field.name === 'message' ||
                      field.type === 'textarea';
                    return (
                      <label
                        key={field.name}
                        className={full ? 'col-span-full space-y-1' : 'space-y-1'}
                      >
                        <span className="text-xs font-medium text-neutral-700">
                          {field.label}
                          {field.required ? ' *' : ''}
                        </span>
                        {field.type === 'select' ? (
                          <select
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
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
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                            name={field.name}
                            rows={3}
                            disabled={inputsLocked}
                            readOnly={!isLiveForm}
                            required={isLiveForm && field.required}
                            tabIndex={isLiveForm ? undefined : -1}
                          />
                        ) : (
                          <input
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
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
                  <label className="flex items-start gap-2 text-[0.625rem] leading-snug text-neutral-600">
                    <input
                      type="checkbox"
                      name="consent"
                      disabled={inputsLocked}
                      required={isLiveForm}
                      tabIndex={isLiveForm ? undefined : -1}
                      className="mt-0.5"
                    />
                    <span>{consentLabel}</span>
                  </label>
                ) : null}

                {errorMessage ? (
                  <p className="text-xs text-red-600" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <FormSubmitButton
                  type={isLiveForm ? 'submit' : 'button'}
                  submitting={submitting}
                  disabled={!isLiveForm || submitting}
                  tabIndex={isLiveForm ? undefined : -1}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-95"
                  style={{ backgroundColor: 'var(--primary, var(--lp-primary, #b91c1c))' }}
                >
                  {submitText}
                </FormSubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>

      {shapeDividerBottom ? <ShapeDividerBottom /> : null}
    </section>
  );
}
