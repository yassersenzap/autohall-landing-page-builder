import { parseLeadFormProps } from '../../lib/block-props';

type LeadFormBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

/**
 * Preview alignée sur `.lp-lead-form` (landing-page.css).
 */
export function LeadFormBlockPreview({ propsJson }: LeadFormBlockPreviewProps) {
  const props = parseLeadFormProps(propsJson);

  const fieldsHtml = props.fields?.map((field) => {
    const isFullWidth =
      field.name === 'fullName' || field.name === 'message' || (props.fields?.length ?? 0) <= 2;
    return (
      <label
        key={field.name}
        className={`lp-lead-form__field${isFullWidth ? ' lp-lead-form__field--full' : ''}`}
      >
        <span className="lp-lead-form__label">
          {field.label}
          {field.required ? (
            <>
              {' '}
              <span aria-hidden="true">*</span>
            </>
          ) : null}
        </span>
        <input
          className="lp-lead-form__input"
          type={field.type || 'text'}
          name={field.name}
          disabled
          readOnly
          aria-disabled="true"
          tabIndex={-1}
        />
      </label>
    );
  });

  const reassurance =
    props.reassurance && props.reassurance.length > 0 ? (
      <ul className="lp-lead-form__reassurance">
        {props.reassurance.map((item) => (
          <li key={item} className="lp-lead-form__reassurance-item">
            <span className="lp-lead-form__check" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <section className="lp-block lp-lead-form" id="lead-form">
      <div className="lp-section">
        <div className="lp-lead-form__layout">
          <aside className="lp-lead-form__aside">
            {props.title ? <h2 className="lp-lead-form__title">{props.title}</h2> : null}
            {props.subtitle ? <p className="lp-lead-form__subtitle">{props.subtitle}</p> : null}
            {reassurance}
          </aside>
          <div className="lp-lead-form__card">
            <form className="lp-lead-form__form" action="#" method="post" noValidate onSubmit={(e) => e.preventDefault()}>
              <div className="lp-lead-form__grid">{fieldsHtml}</div>
              <p className="lp-lead-form__feedback" role="status" aria-live="polite" />
              {props.submitText ? (
                <button
                  type="button"
                  className="lp-btn lp-btn--primary lp-btn--lg lp-lead-form__submit"
                  tabIndex={-1}
                >
                  {props.submitText}
                </button>
              ) : null}
              {props.privacyNote ? (
                <p className="lp-lead-form__privacy">{props.privacyNote}</p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
