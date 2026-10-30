import type { FormFieldConfig, FormNodeProps, FormStepConfig } from '../types/nodes.types';
import { createFormFieldId } from './form-builder.types';
import { buildJourneyFromAssistant } from './form-journey-assistant';

export function createFormStepId(): string {
  return `step-${createFormFieldId()}`;
}

/** Aligné sur autohall.ma/campagne/gamme-thermique — parcours assistant 3+ étapes. */
export function createThermiqueCampaignForm(): {
  fields: FormFieldConfig[];
  steps: FormStepConfig[];
} {
  return buildJourneyFromAssistant({
    vehicle: true,
    city: true,
    testDate: true,
    name: true,
    phone: true,
    email: false,
    consent: true,
  });
}

export function resolveFormSteps(props: FormNodeProps): FormStepConfig[] {
  if (props.steps?.length) return props.steps;

  const enabledFields = props.fields.filter((f) => f.enabled !== false);
  if (enabledFields.length === 0) return [];

  if (props.stepCount === 1 || enabledFields.length <= 3) {
    return [
      {
        id: createFormStepId(),
        title: props.stepTitle ?? props.title ?? 'Formulaire',
        description: props.stepDescription ?? props.subtitle,
        fieldIds: enabledFields.map((f) => f.id),
      },
    ];
  }

  return createThermiqueCampaignForm().steps.map((step, index) => {
    const chunkSize = Math.ceil(enabledFields.length / (props.stepCount || 3));
    const slice = enabledFields.slice(index * chunkSize, (index + 1) * chunkSize);
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      fieldIds: slice.map((f) => f.id),
    };
  });
}

export function getFieldsForStep(
  fields: FormFieldConfig[],
  step: FormStepConfig,
): FormFieldConfig[] {
  const idSet = new Set(step.fieldIds);
  return fields.filter((f) => f.enabled !== false && idSet.has(f.id));
}

export function clampPreviewStepIndex(props: FormNodeProps): number {
  const steps = resolveFormSteps(props);
  if (steps.length === 0) return 0;
  const raw = props.previewStepIndex ?? 0;
  return Math.max(0, Math.min(steps.length - 1, raw));
}

export function stepProgressPercent(stepIndex: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  return Math.round(((stepIndex + 1) / stepCount) * 100);
}

export function stepNumberLabel(stepIndex: number, stepCount: number): string {
  return `Étape ${stepIndex + 1}/${stepCount}`;
}
