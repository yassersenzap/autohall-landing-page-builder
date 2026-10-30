import type { FormFieldType } from './form-builder.types';
import { createEmptyFormField } from './form-builder.types';

export type FormFieldLibraryPreset = {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type FormFieldLibraryCategory = {
  id: string;
  label: string;
  items: FormFieldLibraryPreset[];
};

export const FORM_FIELD_LIBRARY_CATEGORIES: FormFieldLibraryCategory[] = [
  {
    id: 'autohall',
    label: 'Champs Auto Hall',
    items: [
      {
        id: 'select',
        label: 'Liste déroulante',
        type: 'select',
        options: ['Option 1', 'Option 2', 'Option 3'],
      },
      { id: 'text', label: 'Texte', type: 'text', placeholder: 'Votre réponse' },
      { id: 'phone', label: 'Téléphone', type: 'phone', placeholder: '06 00 00 00 00' },
      { id: 'date', label: 'Date', type: 'date', placeholder: 'jj/mm/aaaa' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'vous@exemple.ma' },
      { id: 'rgpd', label: 'Consentement RGPD', type: 'checkbox', required: true },
    ],
  },
];

/** Campaign presets used by assistant + quick add. */
export const FORM_FIELD_LIBRARY: FormFieldLibraryPreset[] = [
  {
    id: 'modele',
    label: 'Modèle',
    type: 'select',
    options: ['CHERY TIGGO 4', 'CHERY TIGGO 7', 'CHERY TIGGO 8'],
    required: true,
  },
  {
    id: 'ville',
    label: 'Ville',
    type: 'select',
    options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'],
    required: true,
  },
  { id: 'date-essai', label: 'Date essai', type: 'date', required: true },
  { id: 'nom', label: 'Nom', type: 'text', placeholder: 'Votre nom', required: true },
  { id: 'telephone', label: 'Téléphone', type: 'phone', placeholder: '06 00 00 00 00', required: true },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'vous@exemple.ma' },
  { id: 'rgpd', label: 'Consentement RGPD', type: 'checkbox', required: true },
];

export function createFieldFromLibraryPreset(
  preset: FormFieldLibraryPreset,
  index: number,
) {
  return createEmptyFormField(index + 1, {
    type: preset.type,
    label: preset.label,
    placeholder: preset.placeholder ?? '',
    required: preset.required ?? false,
    options: preset.options,
  });
}

export function findLibraryPreset(presetId: string): FormFieldLibraryPreset | undefined {
  for (const category of FORM_FIELD_LIBRARY_CATEGORIES) {
    const found = category.items.find((item) => item.id === presetId);
    if (found) return found;
  }
  return FORM_FIELD_LIBRARY.find((item) => item.id === presetId);
}
