/**
 * Configuration formulaire lead Auto Hall — alignée sur lead-form-fields.builder.ts (backend).
 */
export const AUTOHALL_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Agadir',
  'Fès',
  'Meknès',
  'Oujda',
  'Nador',
  'Salé',
  'Settat',
  'Kénitra',
  'Safi',
  'El Jadida',
  'Tétouan',
  'Béni Mellal',
  'Khouribga',
  'Dakhla',
  'Errachidia',
  'Berkane',
  'Al Hoceima',
  'Tiznit',
  'Taroudant',
  'Mohammedia',
] as const;

export type LeadFormFieldDef = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  fullWidth?: boolean;
  options?: { value: string; label: string }[];
};

export type LeadFormConfig = {
  showCivility: boolean;
  useSplitName: boolean;
  showCity: boolean;
  showVehicleModel: boolean;
  showMessage: boolean;
  showEmail: boolean;
  showConsent: boolean;
};

export const DEFAULT_AUTOHALL_FORM_CONFIG: LeadFormConfig = {
  showCivility: true,
  useSplitName: true,
  showCity: true,
  showVehicleModel: true,
  showMessage: false,
  showEmail: true,
  showConsent: true,
};

export const DEFAULT_AUTOHALL_CONSENT_LABEL =
  'J’ai lu et j’accepte le traitement de mes données personnelles conformément à la politique Auto Hall.';

export const DEFAULT_AUTOHALL_REQUIRED_NOTE = '* Champs obligatoires.';

export function buildAutoHallLeadFormFields(
  config: LeadFormConfig = DEFAULT_AUTOHALL_FORM_CONFIG,
): LeadFormFieldDef[] {
  const fields: LeadFormFieldDef[] = [];

  if (config.showCivility) {
    fields.push({
      name: 'civility',
      label: 'Civilité',
      type: 'select',
      required: false,
      options: [
        { value: '', label: 'Choisir' },
        { value: 'M', label: 'M.' },
        { value: 'Mlle', label: 'Mlle' },
        { value: 'Mme', label: 'Mme' },
      ],
    });
  }

  if (config.useSplitName) {
    fields.push(
      { name: 'lastName', label: 'Nom', type: 'text', required: true },
      { name: 'firstName', label: 'Prénom', type: 'text', required: true },
    );
  } else {
    fields.push({ name: 'fullName', label: 'Nom complet', type: 'text', required: true, fullWidth: true });
  }

  fields.push({ name: 'phone', label: 'Téléphone', type: 'tel', required: true });

  if (config.showEmail) {
    fields.push({ name: 'email', label: 'Email', type: 'email', required: false });
  }

  if (config.showCity) {
    fields.push({
      name: 'city',
      label: 'Ville',
      type: 'select',
      required: true,
      options: [{ value: '', label: 'Choisir votre ville' }, ...AUTOHALL_CITIES.map((c) => ({ value: c, label: c }))],
    });
  }

  if (config.showVehicleModel) {
    fields.push({ name: 'vehicleModel', label: 'Modèle souhaité', type: 'text', required: false });
  }

  if (config.showMessage) {
    fields.push({ name: 'message', label: 'Message', type: 'textarea', required: false, fullWidth: true });
  }

  return fields;
}

export function resolveLeadFormFieldsFromProps(propsJson: Record<string, unknown>): LeadFormFieldDef[] {
  if (Array.isArray(propsJson.fields) && propsJson.fields.length > 0 && !propsJson.formConfig) {
    return propsJson.fields
      .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
      .map((field) => ({
        name: typeof field.name === 'string' ? field.name : 'field',
        label: typeof field.label === 'string' ? field.label : 'Champ',
        type: typeof field.type === 'string' ? field.type : 'text',
        required: Boolean(field.required),
      }));
  }

  const raw =
    propsJson.formConfig && typeof propsJson.formConfig === 'object' && !Array.isArray(propsJson.formConfig)
      ? (propsJson.formConfig as Partial<LeadFormConfig>)
      : {};

  return buildAutoHallLeadFormFields({ ...DEFAULT_AUTOHALL_FORM_CONFIG, ...raw });
}
