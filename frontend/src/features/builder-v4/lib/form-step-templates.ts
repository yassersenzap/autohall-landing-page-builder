import type { FormFieldConfig, FormStepConfig } from '../types/nodes.types';
import { createEmptyFormField, normalizeFormField } from './form-builder.types';
import { createFormStepId } from './form-steps';

export type FormStepTemplateId =
  | 'vehicle-selection'
  | 'personal-info'
  | 'contact'
  | 'test-drive-date'
  | 'gdpr-consent'
  | 'confirmation'
  | 'empty';

export type FormStepTemplateMeta = {
  id: FormStepTemplateId;
  label: string;
  emoji: string;
  shortTitle: string;
  description: string;
};

export const FORM_STEP_TEMPLATE_LIST: FormStepTemplateMeta[] = [
  {
    id: 'vehicle-selection',
    label: 'Sélection véhicule',
    emoji: '→',
    shortTitle: 'Sélection véhicule',
    description: 'Modèle et préférences véhicule',
  },
  {
    id: 'personal-info',
    label: 'Informations personnelles',
    emoji: '→',
    shortTitle: 'Informations',
    description: 'Identité du prospect',
  },
  {
    id: 'contact',
    label: 'Coordonnées',
    emoji: '→',
    shortTitle: 'Coordonnées',
    description: 'Nom, téléphone, email',
  },
  {
    id: 'test-drive-date',
    label: 'Date d\'essai',
    emoji: '→',
    shortTitle: 'Date d\'essai',
    description: 'Planification de l\'essai',
  },
  {
    id: 'gdpr-consent',
    label: 'Consentement RGPD',
    emoji: '✓',
    shortTitle: 'Consentement',
    description: 'Case à cocher légale',
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
    emoji: '✓',
    shortTitle: 'Confirmation',
    description: 'Message de remerciement',
  },
  {
    id: 'empty',
    label: 'Étape vide (expert)',
    emoji: '+',
    shortTitle: 'Étape personnalisée',
    description: 'Une seule zone de texte',
  },
];

type FieldBlueprint = Parameters<typeof createEmptyFormField>[1];

type StepBlueprint = {
  title: string;
  description: string;
  nextLabel: string;
  backLabel?: string;
  kind?: 'form' | 'confirmation';
  fields: FieldBlueprint[];
};

const STEP_BLUEPRINTS: Record<FormStepTemplateId, StepBlueprint> = {
  'vehicle-selection': {
    title: 'Sélectionnez le véhicule',
    description: 'Choisissez votre modèle préféré.',
    nextLabel: 'Suivant',
    fields: [
      {
        type: 'select',
        label: 'Modèle',
        placeholder: 'Sélectionnez un modèle',
        required: true,
        options: ['Modèle A', 'Modèle B', 'Modèle C'],
      },
    ],
  },
  'personal-info': {
    title: 'Vos informations',
    description: 'Un conseiller vous contactera.',
    nextLabel: 'Suivant',
    fields: [
      { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
      { type: 'email', label: 'Email', placeholder: 'vous@exemple.ma', required: true },
    ],
  },
  contact: {
    title: 'Vos coordonnées',
    description: 'Pour finaliser votre demande.',
    nextLabel: 'Envoyer',
    fields: [
      { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
      { type: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00', required: true },
      { type: 'email', label: 'Email', placeholder: 'vous@exemple.ma', required: false },
    ],
  },
  'test-drive-date': {
    title: 'Planifiez votre essai',
    description: 'Indiquez la date qui vous convient.',
    nextLabel: 'Suivant',
    fields: [
      {
        type: 'select',
        label: 'Ville',
        placeholder: 'Votre ville',
        required: true,
        options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'],
      },
      { type: 'date', label: 'Date d\'essai', placeholder: 'jj/mm/aaaa', required: true },
    ],
  },
  'gdpr-consent': {
    title: 'Confirmation',
    description: 'Vérifiez votre demande avant de l’envoyer.',
    nextLabel: 'Envoyer',
    fields: [
      {
        type: 'checkbox',
        label: 'J\'accepte la politique de confidentialité',
        required: true,
      },
    ],
  },
  confirmation: {
    title: 'Merci',
    description: 'Votre demande a été enregistrée.',
    nextLabel: 'Retour au site',
    kind: 'confirmation',
    fields: [],
  },
  empty: {
    title: 'Nouvelle étape',
    description: 'Décrivez ce que vous souhaitez collecter.',
    nextLabel: 'Suivant',
    fields: [
      { type: 'textarea', label: 'Message', placeholder: 'Votre réponse…', required: false },
    ],
  },
};

export function getStepTemplateMeta(id: FormStepTemplateId): FormStepTemplateMeta {
  return FORM_STEP_TEMPLATE_LIST.find((t) => t.id === id) ?? FORM_STEP_TEMPLATE_LIST[0];
}

export function materializeStepFromTemplate(
  templateId: FormStepTemplateId,
  fieldOffset: number,
): { step: FormStepConfig; newFields: FormFieldConfig[] } {
  const blueprint = STEP_BLUEPRINTS[templateId];
  const meta = getStepTemplateMeta(templateId);
  const newFields = blueprint.fields.map((fieldBlueprint, index) =>
    normalizeFormField(
      createEmptyFormField(fieldOffset + index + 1, fieldBlueprint),
    ),
  );

  return {
    step: {
      id: createFormStepId(),
      templateId,
      kind: blueprint.kind ?? 'form',
      title: blueprint.title,
      description: blueprint.description,
      fieldIds: newFields.map((field) => field.id),
      nextLabel: blueprint.nextLabel,
      backLabel: blueprint.backLabel,
      icon: meta.emoji,
      showProgress: blueprint.kind !== 'confirmation',
    },
    newFields,
  };
}

/** Quick templates suggested when a step loses its fields. */
export const STEP_EMPTY_SUGGESTIONS: FormStepTemplateId[] = [
  'contact',
  'personal-info',
  'gdpr-consent',
  'test-drive-date',
  'confirmation',
];

export function isStepWithoutFields(step: FormStepConfig): boolean {
  return step.kind !== 'confirmation' && step.fieldIds.length === 0;
}

export function stepDisplayTitle(step: FormStepConfig, index: number): string {
  const meta = step.templateId
    ? FORM_STEP_TEMPLATE_LIST.find((t) => t.id === step.templateId)
    : undefined;
  if (meta) return meta.shortTitle;
  const title = step.title?.trim();
  if (title) return title.length > 28 ? `${title.slice(0, 28)}…` : title;
  return `Étape ${index + 1}`;
}

export function stepEmoji(step: FormStepConfig, index: number): string {
  if (step.icon) return step.icon;
  const meta = step.templateId
    ? FORM_STEP_TEMPLATE_LIST.find((t) => t.id === step.templateId)
    : undefined;
  if (meta) return meta.emoji;
  return ['→', '→', '→', '→', '✓', '✓'][index % 6];
}
