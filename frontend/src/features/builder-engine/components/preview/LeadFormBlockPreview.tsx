import { resolveLeadFormFieldsFromProps } from '../../constants/autohall-lead-form';
import { asPropString } from '../../lib/block-props';
import { buildCanvasSectionClass, buildCanvasInlineStyle, getDesignFromProps } from '../../lib/block-style';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type LeadFormBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function LeadFormBlockPreview({ propsJson }: LeadFormBlockPreviewProps) {
  const fields = resolveLeadFormFieldsFromProps(propsJson);
  const design = getDesignFromProps('lead_form', propsJson);
  const sectionClass = buildCanvasSectionClass('lead_form', 'lp-lead-form', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const submitText = asPropString(propsJson.submitText) || 'Envoyer votre demande';
  const privacyNote = asPropString(propsJson.privacyNote);
  const consentLabel = asPropString(propsJson.consentLabel);
  const requiredNote = asPropString(propsJson.requiredFieldsNote) || '* Champs obligatoires.';
  const formConfig = propsJson.formConfig as Record<string, unknown> | undefined;
  const showConsent = formConfig?.showConsent !== false;

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
          <select className="lp-lead-form__input lp-lead-form__select" name={field.name} disabled>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea className="lp-lead-form__input lp-lead-form__textarea" name={field.name} rows={3} disabled readOnly />
        ) : (
          <input className="lp-lead-form__input" type={field.type || 'text'} name={field.name} disabled readOnly />
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
              <CanvasEmptyHint className="lp-lead-form__title opacity-60">Titre du formulaire</CanvasEmptyHint>
            )}
            {subtitle ? <p className="lp-lead-form__subtitle">{subtitle}</p> : null}
          </aside>
          <div className="lp-lead-form__card">
            <form className="lp-lead-form__form" action="#" method="post" noValidate onSubmit={(e) => e.preventDefault()}>
              <p className="lp-lead-form__required-note">{requiredNote}</p>
              <div className="lp-lead-form__grid">{fieldsHtml}</div>
              {showConsent && consentLabel ? (
                <label className="lp-lead-form__field lp-lead-form__field--consent lp-lead-form__field--full">
                  <input className="lp-lead-form__checkbox" type="checkbox" name="consent" disabled />
                  <span className="lp-lead-form__consent-text">{consentLabel}</span>
                </label>
              ) : null}
              <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit" tabIndex={-1}>
                {submitText}
              </button>
              {privacyNote ? <p className="lp-lead-form__privacy">{privacyNote}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
