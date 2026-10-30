import type { FormFieldConfig, FormStepConfig } from '../types/nodes.types';
import { materializeStepFromTemplate, type FormStepTemplateId } from './form-step-templates';

export type FormAssistantSelection = {
  vehicle: boolean;
  city: boolean;
  testDate: boolean;
  name: boolean;
  phone: boolean;
  email: boolean;
  consent: boolean;
};

export const FORM_ASSISTANT_DEFAULT: FormAssistantSelection = {
  vehicle: true,
  city: true,
  testDate: true,
  name: true,
  phone: true,
  email: true,
  consent: true,
};

export function buildJourneyFromAssistant(
  selection: FormAssistantSelection,
): { steps: FormStepConfig[]; fields: FormFieldConfig[] } {
  const hasAny =
    selection.vehicle ||
    selection.city ||
    selection.testDate ||
    selection.name ||
    selection.phone ||
    selection.email ||
    selection.consent;

  if (!hasAny) {
    return buildJourneyFromAssistant(FORM_ASSISTANT_DEFAULT);
  }

  const fields: FormFieldConfig[] = [];
  const steps: FormStepConfig[] = [];
  let offset = 0;

  function pushStep(templateId: FormStepTemplateId, fieldFilter?: (field: FormFieldConfig) => boolean) {
    const materialized = materializeStepFromTemplate(templateId, offset);
    const selectedFields = fieldFilter
      ? materialized.newFields.filter(fieldFilter)
      : materialized.newFields;
    offset += selectedFields.length;
    fields.push(...selectedFields);

    const fieldIds = selectedFields.map((field) => field.id);

    if (fieldIds.length === 0 && materialized.step.kind !== 'confirmation') {
      return;
    }

    steps.push({ ...materialized.step, fieldIds });
  }

  if (selection.vehicle || selection.city) {
    const materialized = materializeStepFromTemplate('vehicle-selection', offset);
    const step1Fields: FormFieldConfig[] = [];

    if (selection.vehicle) {
      const modelField = materialized.newFields.find((f) => f.label === 'Modèle');
      if (modelField) step1Fields.push(modelField);
    }

    if (selection.city) {
      const cityPack = materializeStepFromTemplate('test-drive-date', offset + step1Fields.length);
      const cityField = cityPack.newFields.find((f) => f.label === 'Ville');
      if (cityField) step1Fields.push(cityField);
    }

    if (step1Fields.length > 0) {
      offset += step1Fields.length;
      fields.push(...step1Fields);
      steps.push({
        ...materialized.step,
        title: selection.vehicle && selection.city
          ? 'Sélectionnez le véhicule'
          : selection.vehicle
            ? materialized.step.title
            : 'Votre ville',
        fieldIds: step1Fields.map((f) => f.id),
      });
    }
  }

  if (selection.testDate) {
    const materialized = materializeStepFromTemplate('test-drive-date', offset);
    const dateField = materialized.newFields.find((field) => field.type === 'date');
    if (dateField) {
      offset += 1;
      fields.push(dateField);
      if (steps[0]) {
        steps[0] = { ...steps[0], fieldIds: [...steps[0].fieldIds, dateField.id] };
      } else {
        steps.push({ ...materialized.step, fieldIds: [dateField.id] });
      }
    }
  }

  if (selection.name || selection.phone || selection.email) {
    pushStep('contact', (f) => {
      if (f.label === 'Nom') return selection.name;
      if (f.label === 'Téléphone') return selection.phone;
      if (f.label === 'Email') return selection.email;
      return false;
    });
  }

  if (selection.consent) {
    pushStep('gdpr-consent');
  }

  pushStep('confirmation');

  if (steps.length <= 1) {
    return buildJourneyFromAssistant(FORM_ASSISTANT_DEFAULT);
  }

  return { steps, fields };
}

export function createDefaultCampaignJourney(): { steps: FormStepConfig[]; fields: FormFieldConfig[] } {
  return buildJourneyFromAssistant(FORM_ASSISTANT_DEFAULT);
}
