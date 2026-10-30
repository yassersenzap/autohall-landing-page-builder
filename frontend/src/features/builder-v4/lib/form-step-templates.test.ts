import { describe, expect, it } from 'vitest';
import {
  FORM_STEP_TEMPLATE_LIST,
  isStepWithoutFields,
  materializeStepFromTemplate,
} from './form-step-templates';
import { buildJourneyFromAssistant, FORM_ASSISTANT_DEFAULT } from './form-journey-assistant';

describe('form-step-templates', () => {
  it('materializes every template with at least one field or confirmation kind', () => {
    for (const template of FORM_STEP_TEMPLATE_LIST) {
      const { step, newFields } = materializeStepFromTemplate(template.id, 0);
      if (template.id === 'confirmation') {
        expect(step.kind).toBe('confirmation');
        expect(newFields).toHaveLength(0);
      } else {
        expect(newFields.length).toBeGreaterThan(0);
        expect(step.fieldIds).toHaveLength(newFields.length);
      }
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.templateId).toBe(template.id);
    }
  });

  it('treats confirmation as non-empty', () => {
    const { step } = materializeStepFromTemplate('confirmation', 0);
    expect(isStepWithoutFields(step)).toBe(false);
  });

  it('flags form steps with zero fields as empty', () => {
    const { step } = materializeStepFromTemplate('contact', 0);
    expect(isStepWithoutFields({ ...step, fieldIds: [] })).toBe(true);
  });
});

describe('buildJourneyFromAssistant', () => {
  it('builds a multi-step campaign journey from default selection', () => {
    const { steps, fields } = buildJourneyFromAssistant(FORM_ASSISTANT_DEFAULT);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(fields.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.kind === 'confirmation')).toBe(true);
    for (const step of steps) {
      if (step.kind !== 'confirmation') {
        expect(step.fieldIds.length).toBeGreaterThan(0);
      }
    }
  });
});
