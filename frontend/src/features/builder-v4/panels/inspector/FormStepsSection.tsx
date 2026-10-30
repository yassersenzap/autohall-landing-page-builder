import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/shadcn/input';
import { useBuilderV4Store } from '../../store/document.store';
import type { FormNodeProps, FormStepConfig } from '../../types/nodes.types';
import { createFormStepId, resolveFormSteps } from '../../lib/form-steps';
import { InspectorField, InspectorHint, InspectorSection } from './InspectorPrimitives';

type FormStepsSectionProps = {
  nodeId: string;
};

export function FormStepsSection({ nodeId }: FormStepsSectionProps) {
  const node = useBuilderV4Store((s) => s.getNode(nodeId));
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);

  if (!node || node.kind !== 'form') return null;

  const props = node.props as FormNodeProps;
  const steps = resolveFormSteps(props);
  const previewIndex = props.previewStepIndex ?? 0;
  const fields = props.fields ?? [];

  function patchSteps(nextSteps: FormStepConfig[]) {
    updateNodeProps(nodeId, {
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: Math.min(previewIndex, Math.max(0, nextSteps.length - 1)),
    } as Partial<FormNodeProps>);
  }

  function updateStep(index: number, patch: Partial<FormStepConfig>) {
    const next = steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
    patchSteps(next);
  }

  function toggleField(stepIndex: number, fieldId: string) {
    const step = steps[stepIndex];
    if (!step) return;
    const has = step.fieldIds.includes(fieldId);
    const fieldIds = has
      ? step.fieldIds.filter((id) => id !== fieldId)
      : [...step.fieldIds, fieldId];
    updateStep(stepIndex, { fieldIds });
  }

  function addStep() {
    const next: FormStepConfig = {
      id: createFormStepId(),
      title: `Étape ${steps.length + 1}`,
      description: '',
      fieldIds: [],
    };
    patchSteps([...steps, next]);
    updateNodeProps(nodeId, { previewStepIndex: steps.length } as Partial<FormNodeProps>);
    toast.success('Étape ajoutée');
  }

  function removeStep(index: number) {
    if (steps.length <= 1) {
      toast.error('Au moins une étape est requise');
      return;
    }
    patchSteps(steps.filter((_, i) => i !== index));
    toast.success('Étape supprimée');
  }

  return (
    <InspectorSection title="Étapes" value="form-steps">
      <InspectorHint>
        Parcours multi-étapes comme sur autohall.ma — assignez les champs à chaque étape.
      </InspectorHint>

      <div className="v4-form-steps">
        {steps.map((step, index) => {
          const active = index === previewIndex;
          return (
            <div
              key={step.id}
              className={['v4-form-steps__item', active ? 'v4-form-steps__item--active' : ''].filter(Boolean).join(' ')}
              data-testid={`form-step-${index}`}
            >
              <div className="v4-form-steps__head">
                <button
                  type="button"
                  className="v4-form-steps__select"
                  onClick={() => updateNodeProps(nodeId, { previewStepIndex: index } as Partial<FormNodeProps>)}
                >
                  Étape {index + 1}
                </button>
                <button
                  type="button"
                  className="v4-form-builder__field-delete"
                  onClick={() => removeStep(index)}
                  aria-label={`Supprimer étape ${index + 1}`}
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>

              {active ? (
                <>
                  <InspectorField label="Titre">
                    <Input
                      value={step.title}
                      onChange={(event) => updateStep(index, { title: event.target.value })}
                      className="v4-inspector-v2__text"
                    />
                  </InspectorField>
                  <InspectorField label="Description">
                    <textarea
                      className="v4-inspector-v2__textarea"
                      rows={3}
                      value={step.description ?? ''}
                      onChange={(event) => updateStep(index, { description: event.target.value })}
                    />
                  </InspectorField>
                  <InspectorField label="Champs de l'étape">
                    <div className="v4-form-steps__fields">
                      {fields.map((field) => (
                        <label key={field.id} className="v4-form-builder__checkbox">
                          <input
                            type="checkbox"
                            checked={step.fieldIds.includes(field.id)}
                            onChange={() => toggleField(index, field.id)}
                          />
                          <span>{field.label || 'Sans label'}</span>
                        </label>
                      ))}
                    </div>
                  </InspectorField>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
        onClick={addStep}
        data-testid="form-add-step"
      >
        <Plus size={14} aria-hidden />
        Ajouter une étape
      </button>
    </InspectorSection>
  );
}
