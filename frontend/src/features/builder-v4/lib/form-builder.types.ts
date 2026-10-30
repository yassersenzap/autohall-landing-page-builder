/** Dynamic form builder — campaign-agnostic field model. */
import { createSafeRandomId } from '@/lib/create-safe-random-id';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'textarea';

export type FormFieldWidth = '50%' | '100%';

export type DynamicFormField = {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  enabled: boolean;
  required: boolean;
  width: FormFieldWidth;
  options?: string[];
  regex?: string;
  errorMessage?: string;
  defaultValue?: string;
  tooltip?: string;
  icon?: string;
};

export const FORM_FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Texte',
  email: 'Email',
  phone: 'Téléphone',
  select: 'Select',
  radio: 'Radio',
  checkbox: 'Checkbox',
  date: 'Date',
  textarea: 'Textarea',
};

export function createFormFieldId(): string {
  return `field-${createSafeRandomId().slice(0, 8)}`;
}

export function createEmptyFormField(
  index = 1,
  overrides?: Partial<Omit<DynamicFormField, 'id' | 'enabled'>>,
): DynamicFormField {
  return normalizeFormField({
    id: createFormFieldId(),
    type: 'text',
    label: `Champ ${index}`,
    placeholder: '',
    enabled: true,
    required: false,
    width: '100%',
    ...overrides,
  });
}

export function normalizeFormField(field: Partial<DynamicFormField> & Pick<DynamicFormField, 'id' | 'label'>): DynamicFormField {
  return {
    id: field.id,
    type: field.type ?? 'text',
    label: field.label,
    placeholder: field.placeholder ?? '',
    enabled: field.enabled ?? true,
    required: field.required ?? false,
    width: field.width ?? '100%',
    options: field.options,
    regex: field.regex,
    errorMessage: field.errorMessage,
    defaultValue: field.defaultValue,
    tooltip: field.tooltip,
    icon: field.icon,
  };
}

export function fieldNeedsOptions(type: FormFieldType): boolean {
  return type === 'select' || type === 'radio';
}
