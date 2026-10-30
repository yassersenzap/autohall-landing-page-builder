export type V4FormType =
  | 'test_drive'
  | 'commercial'
  | 'sav'
  | 'financing'
  | 'free';

export type V4FormFieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'textarea' | 'number';
  required?: boolean;
};

const PRESETS: Record<Exclude<V4FormType, 'free'>, V4FormFieldSpec[]> = {
  test_drive: [
    { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { name: 'city', label: 'Ville', type: 'text', required: true },
    { name: 'vehicleModel', label: 'Véhicule', type: 'text' },
    { name: 'preferredDate', label: 'Date souhaitée', type: 'date' },
    { name: 'dealership', label: 'Concession', type: 'text' },
  ],
  commercial: [
    { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'vehicleModel', label: 'Véhicule', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  sav: [
    { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'city', label: 'Ville', type: 'text' },
    { name: 'dealership', label: 'Concession', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  financing: [
    { name: 'fullName', label: 'Nom complet', type: 'text', required: true },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'vehicleModel', label: 'Véhicule', type: 'text' },
    { name: 'downPayment', label: 'Apport', type: 'number' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
};

const FORM_TYPE_LABELS: Record<V4FormType, string> = {
  test_drive: 'Essai véhicule',
  commercial: 'Demande commerciale',
  sav: 'Demande SAV',
  financing: 'Demande financement',
  free: 'Formulaire libre',
};

function parseFormType(value: unknown): V4FormType {
  if (
    value === 'test_drive' ||
    value === 'commercial' ||
    value === 'sav' ||
    value === 'financing' ||
    value === 'free'
  ) {
    return value;
  }
  return 'test_drive';
}

export function buildV4LeadFormFields(
  props: Record<string, unknown>,
): V4FormFieldSpec[] {
  const formType = parseFormType(props.formType);
  if (formType !== 'free') {
    return PRESETS[formType];
  }

  const toggles: { key: string; field: V4FormFieldSpec }[] = [
    { key: 'showName', field: { name: 'fullName', label: 'Nom complet', type: 'text', required: true } },
    { key: 'showPhone', field: { name: 'phone', label: 'Téléphone', type: 'tel', required: true } },
    { key: 'showEmail', field: { name: 'email', label: 'E-mail', type: 'email' } },
    { key: 'showCity', field: { name: 'city', label: 'Ville', type: 'text' } },
    { key: 'showVehicleModel', field: { name: 'vehicleModel', label: 'Véhicule', type: 'text' } },
    { key: 'showDate', field: { name: 'preferredDate', label: 'Date souhaitée', type: 'date' } },
    { key: 'showDealership', field: { name: 'dealership', label: 'Concession', type: 'text' } },
    { key: 'showDownPayment', field: { name: 'downPayment', label: 'Apport', type: 'number' } },
    { key: 'showMessage', field: { name: 'message', label: 'Message', type: 'textarea' } },
  ];

  return toggles
    .filter(({ key }) => props[key] === true)
    .map(({ field }) => field);
}

export function defaultV4FormTitle(props: Record<string, unknown>): string {
  const title = typeof props.title === 'string' ? props.title.trim() : '';
  if (title) return title;
  return FORM_TYPE_LABELS[parseFormType(props.formType)];
}
