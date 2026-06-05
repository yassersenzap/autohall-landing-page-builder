import { AUTOHALL_CITIES } from './constants/autohall-cities';

export type LeadFormFieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea';
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

const DEFAULT_FORM_CONFIG: LeadFormConfig = {
  showCivility: true,
  useSplitName: true,
  showCity: true,
  showVehicleModel: true,
  showMessage: false,
  showEmail: true,
  showConsent: true,
};

function readFormConfig(props: Record<string, unknown>): LeadFormConfig {
  const raw =
    props.formConfig && typeof props.formConfig === 'object' && !Array.isArray(props.formConfig)
      ? (props.formConfig as Record<string, unknown>)
      : {};
  return {
    showCivility: raw.showCivility !== false,
    useSplitName: raw.useSplitName !== false,
    showCity: raw.showCity !== false,
    showVehicleModel: raw.showVehicleModel !== false,
    showMessage: Boolean(raw.showMessage),
    showEmail: raw.showEmail !== false,
    showConsent: raw.showConsent !== false,
  };
}

function legacyFieldsFromProps(props: Record<string, unknown>): LeadFormFieldSpec[] | null {
  if (!Array.isArray(props.fields) || props.fields.length === 0) {
    return null;
  }
  return props.fields
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )
    .map((field) => ({
      name: typeof field.name === 'string' ? field.name : 'field',
      label: typeof field.label === 'string' ? field.label : 'Champ',
      type:
        field.type === 'tel' ||
        field.type === 'email' ||
        field.type === 'select' ||
        field.type === 'textarea'
          ? field.type
          : 'text',
      required: Boolean(field.required),
      fullWidth:
        field.name === 'fullName' ||
        field.name === 'message' ||
        field.type === 'textarea',
    }));
}

export function buildLeadFormFieldSpecs(props: Record<string, unknown>): LeadFormFieldSpec[] {
  const legacy = legacyFieldsFromProps(props);
  if (legacy && !props.formConfig) {
    return legacy;
  }

  const config = readFormConfig(props);
  const fields: LeadFormFieldSpec[] = [];

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
      options: [
        { value: '', label: 'Choisir votre ville' },
        ...AUTOHALL_CITIES.map((city) => ({ value: city, label: city })),
      ],
    });
  }

  if (config.showVehicleModel) {
    fields.push({
      name: 'vehicleModel',
      label: 'Modèle souhaité',
      type: 'text',
      required: false,
    });
  }

  if (config.showMessage) {
    fields.push({
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: false,
      fullWidth: true,
    });
  }

  return fields;
}

export function leadFormHasConsent(props: Record<string, unknown>): boolean {
  const config = readFormConfig(props);
  if (!config.showConsent) return true;
  const text =
    typeof props.consentLabel === 'string' ? props.consentLabel.trim() : '';
  return text.length > 0;
}

export { DEFAULT_FORM_CONFIG, readFormConfig };
