import { AUTOHALL_CITIES } from './constants/autohall-cities';
import { buildV4LeadFormFields } from './v4-form-fields';

export type LeadFormFieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'date';
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

function shouldShowPreferredDate(props: Record<string, unknown>): boolean {
  if (props.formMode === 'test_drive') return true;
  if (props.fieldsPreset === 'city_date') return true;
  return false;
}

function readFormConfig(props: Record<string, unknown>): LeadFormConfig {
  const raw =
    props.formConfig &&
    typeof props.formConfig === 'object' &&
    !Array.isArray(props.formConfig)
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

function legacyFieldsFromProps(
  props: Record<string, unknown>,
): LeadFormFieldSpec[] | null {
  if (!Array.isArray(props.fields) || props.fields.length === 0) {
    return null;
  }
  const CITY_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Oujda', 'Meknès',
    'Tétouan', 'Salé', 'Béni Mellal', 'Berkane', 'Dakhla', 'El Jadida', 'Errachidia',
    'Kénitra', 'Nador', 'Safi', 'Settat', 'Khouribga', 'Mohammedia', 'Aït Melloul',
    'Laâyoune', 'Taroudant', 'Tiznit', 'Al Hoceima', 'Tifelt', 'Rommani', 'Karia',
    'Tout le Maroc',
  ];
  return props.fields
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item) && item.enabled !== false,
    )
    .map((field) => {
      // builder-v4 uses `id` as the field key; legacy used `name`
      const fieldId = typeof field.id === 'string' ? field.id : (typeof field.name === 'string' ? field.name : 'field');
      const isCityField = fieldId === 'city' || fieldId === 'ville' || String(field.label ?? '').toLowerCase().includes('ville');
      const isModelField = fieldId === 'model' || fieldId === 'vehicleModel' || String(field.label ?? '').toLowerCase().includes('modèle');
      const rawType = field.type as string | undefined;
      const isSelect = rawType === 'select' || isCityField || isModelField;
      const type: LeadFormFieldSpec['type'] =
        rawType === 'tel' || fieldId === 'phone'
          ? 'tel'
          : rawType === 'email' || fieldId === 'email'
            ? 'email'
            : rawType === 'textarea'
              ? 'textarea'
              : rawType === 'date'
                ? 'date'
                : isSelect
                  ? 'select'
                  : 'text';
      const options: { value: string; label: string }[] | undefined = isSelect
        ? isCityField
          ? CITY_CITIES.map((c) => ({ value: c, label: c }))
          : isModelField
            ? ((Array.isArray(field.options) ? field.options : []) as string[]).map((o) => ({ value: o, label: o }))
            : ((Array.isArray(field.options) ? field.options : []) as string[]).map((o) => ({ value: o, label: o }))
        : undefined;
      return {
        name: fieldId,
        label: typeof field.label === 'string' ? field.label : 'Champ',
        type,
        required: Boolean(field.required),
        fullWidth: fieldId === 'fullName' || fieldId === 'message' || rawType === 'textarea' || type === 'textarea',
        options: options?.length ? options : undefined,
      };
    });
}

export function buildLeadFormFieldSpecs(
  props: Record<string, unknown>,
): LeadFormFieldSpec[] {
  if (props.formType != null) {
    return buildV4LeadFormFields(props).map((field) => ({
      name: field.name,
      label: field.label,
      type:
        field.type === 'number'
          ? 'text'
          : field.type === 'date'
            ? 'date'
            : field.type,
      required: Boolean(field.required),
      fullWidth: field.type === 'textarea' || field.name === 'fullName' || field.name === 'message',
    }));
  }

  // Builder-v4 documents: prefer explicit fields array over formConfig defaults
  const legacy = legacyFieldsFromProps(props);
  if (legacy && legacy.length > 0) {
    return legacy;
  }

  const config = readFormConfig(props);
  const fields: LeadFormFieldSpec[] = [];
  const premiumOrder = shouldShowPreferredDate(props);

  if (premiumOrder && config.showCity) {
    fields.push({
      name: 'city',
      label: 'Ville',
      type: 'select',
      required: true,
      fullWidth: true,
      options: [
        { value: '', label: 'Choisir votre ville' },
        ...AUTOHALL_CITIES.map((city) => ({ value: city, label: city })),
      ],
    });
    fields.push({
      name: 'preferredDate',
      label: 'Date souhaitée pour l\'essai',
      type: 'date',
      required: true,
      fullWidth: true,
    });
  }

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
    fields.push({
      name: 'fullName',
      label: 'Nom complet',
      type: 'text',
      required: true,
      fullWidth: true,
    });
  }

  if (config.showEmail) {
    fields.push({
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
    });
  }

  fields.push({
    name: 'phone',
    label: 'Téléphone',
    type: 'tel',
    required: true,
  });

  if (config.showCity && !premiumOrder) {
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
