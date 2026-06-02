import { propString, propsAsRecord } from './page-preview';

export type LeadFormField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export const DEFAULT_LEAD_FORM_PROPS: Record<string, unknown> = {
  title: 'Demander un essai',
  subtitle:
    'Remplissez le formulaire, un conseiller Auto Hall vous contactera sous 48h.',
  submitText: 'Envoyer ma demande',
  privacyNote: 'Vos données sont utilisées uniquement pour traiter votre demande.',
  reassurance: [
    'Sans engagement',
    'Réponse sous 48h ouvrées',
    'Conseiller dédié en concession',
  ],
  fields: [
    { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: false },
    {
      name: 'vehicleModel',
      label: 'Modèle souhaité',
      type: 'text',
      required: false,
    },
  ],
};

export function parseLeadFormFields(
  props: Record<string, unknown>,
): LeadFormField[] {
  if (!Array.isArray(props.fields)) {
    return [];
  }

  return props.fields
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )
    .map((field) => ({
      name: typeof field.name === 'string' ? field.name : 'field',
      label: typeof field.label === 'string' ? field.label : 'Champ',
      type: typeof field.type === 'string' ? field.type : 'text',
      required: Boolean(field.required),
    }));
}

type LeadFormPreviewProps = {
  propsJson: unknown;
  formId?: string;
};

export function LeadFormPreview({ propsJson, formId = 'lead-form' }: LeadFormPreviewProps) {
  const props = propsAsRecord(propsJson);
  const title = propString(props, 'title');
  const subtitle = propString(props, 'subtitle');
  const submitText = propString(props, 'submitText') ?? 'Envoyer';
  const fields = parseLeadFormFields(props);

  return (
    <section className="preview-block preview-block--lead-form">
      {title ? <h2 className="preview-block__title">{title}</h2> : null}
      {subtitle ? <p className="preview-block__subtitle">{subtitle}</p> : null}
      <form
        id={formId}
        className="lead-form"
        onSubmit={(event) => event.preventDefault()}
      >
        {fields.map((field) => (
          <label key={field.name} className="lead-form__field">
            <span>
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              disabled
              aria-disabled="true"
            />
          </label>
        ))}
        <button type="submit" className="lead-form__submit">
          {submitText}
        </button>
      </form>
    </section>
  );
}
