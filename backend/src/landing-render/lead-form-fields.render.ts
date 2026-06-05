import {
  buildLeadFormFieldSpecs,
  type LeadFormFieldSpec,
} from './lead-form-fields.builder';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderFieldInput(field: LeadFormFieldSpec): string {
  const requiredAttr = field.required ? ' required' : '';
  const name = escapeHtml(field.name);

  if (field.type === 'select' && field.options?.length) {
    const options = field.options
      .map(
        (opt) =>
          `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`,
      )
      .join('');
    return `<select class="lp-lead-form__input lp-lead-form__select" name="${name}"${requiredAttr}>${options}</select>`;
  }

  if (field.type === 'textarea') {
    return `<textarea class="lp-lead-form__input lp-lead-form__textarea" name="${name}" rows="3"${requiredAttr}></textarea>`;
  }

  return `<input class="lp-lead-form__input" type="${escapeHtml(field.type)}" name="${name}"${requiredAttr} autocomplete="on" />`;
}

export function renderLeadFormFieldsHtml(
  props: Record<string, unknown>,
  fields?: LeadFormFieldSpec[],
): string {
  const specs = fields ?? buildLeadFormFieldSpecs(props);
  const total = specs.length;

  return specs
    .map((field) => {
      const isFullWidth =
        field.fullWidth ||
        field.name === 'fullName' ||
        field.name === 'message' ||
        field.type === 'textarea' ||
        total <= 2;
      return `
        <label class="lp-lead-form__field${isFullWidth ? ' lp-lead-form__field--full' : ''}">
          <span class="lp-lead-form__label">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</span>
          ${renderFieldInput(field)}
        </label>`;
    })
    .join('');
}

export function renderLeadFormConsentHtml(props: Record<string, unknown>): string {
  const config = props.formConfig as Record<string, unknown> | undefined;
  const showConsent = config?.showConsent !== false;
  if (!showConsent) return '';

  const label =
    typeof props.consentLabel === 'string' && props.consentLabel.trim()
      ? props.consentLabel.trim()
      : 'J’ai lu et j’accepte sans réserve les termes de la clause relative à la protection des données personnelles.';

  return `
        <label class="lp-lead-form__field lp-lead-form__field--consent lp-lead-form__field--full">
          <input class="lp-lead-form__checkbox" type="checkbox" name="consent" value="1" required />
          <span class="lp-lead-form__consent-text">${escapeHtml(label)}</span>
        </label>`;
}

export function renderLeadFormRequiredNoteHtml(props: Record<string, unknown>): string {
  const note =
    typeof props.requiredFieldsNote === 'string' && props.requiredFieldsNote.trim()
      ? props.requiredFieldsNote.trim()
      : '* Champs obligatoires.';
  return `<p class="lp-lead-form__required-note">${escapeHtml(note)}</p>`;
}
