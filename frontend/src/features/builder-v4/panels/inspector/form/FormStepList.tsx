import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { FormStepConfig } from '../../../types/nodes.types';
import {
  isStepWithoutFields,
  stepDisplayTitle,
} from '../../../lib/form-step-templates';

const CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];

type FormStepListProps = {
  steps: FormStepConfig[];
  previewIndex: number;
  onSelectStep: (index: number) => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
  onAssignFieldToStep: (fieldId: string, stepIndex: number) => void;
};

export function FormStepList({
  steps,
  previewIndex,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  onReorderSteps,
  onAssignFieldToStep,
}: FormStepListProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="v4-form-step-list">

      {/* ── Stepper bar horizontale ───────────────────────────── */}
      <div className="v4-step-bar">
        {steps.map((step, index) => {
          const isActive = index === previewIndex;
          const circle = CIRCLED[index] ?? String(index + 1);
          return (
            <button
              key={step.id}
              type="button"
              className={['v4-step-bar__item', isActive ? 'v4-step-bar__item--active' : ''].filter(Boolean).join(' ')}
              onClick={() => onSelectStep(index)}
              title={stepDisplayTitle(step, index)}
            >
              <span className="v4-step-bar__circle">{circle}</span>
              <span className="v4-step-bar__label">{stepDisplayTitle(step, index)}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="v4-step-bar__add"
          onClick={onAddStep}
          title="Ajouter une étape"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* ── Cards draggables ──────────────────────────────────── */}
      <div className="v4-form-step-list__cards" role="tablist" aria-label="Étapes du parcours">
        {steps.map((step, index) => {
          const fieldCount = step.kind === 'confirmation' ? 0 : step.fieldIds.length;
          const empty = isStepWithoutFields(step);
          const isDragOver = dragOverIndex === index;
          const isActive = index === previewIndex;
          return (
            <div
              key={step.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(index));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (
                  e.dataTransfer.types.includes('application/x-v4-field-id') ||
                  e.dataTransfer.types.includes('text/plain')
                ) {
                  e.preventDefault();
                }
              }}
              onDragEnter={() => setDragOverIndex(index)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverIndex(null);
                const fieldId = e.dataTransfer.getData('application/x-v4-field-id');
                if (fieldId) {
                  onAssignFieldToStep(fieldId, index);
                } else {
                  const fromStepIndex = e.dataTransfer.getData('text/plain');
                  if (fromStepIndex !== '') {
                    onReorderSteps(Number(fromStepIndex), index);
                  }
                }
              }}
              className={[
                'v4-form-step-card',
                isActive ? 'v4-form-step-card--active' : '',
                empty ? 'v4-form-step-card--needs-template' : '',
                isDragOver ? 'v4-form-step-card--drag-over' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={isDragOver ? { borderColor: 'var(--v4-accent, #e85d04)', boxShadow: '0 0 0 2px rgba(232, 93, 4, 0.3)' } : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span
                  className="v4-form-inspector__step-field-icon"
                  style={{ cursor: 'grab', marginLeft: '8px', opacity: 0.35, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-hidden
                >
                  <GripVertical size={12} />
                </span>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className="v4-form-step-card__main"
                  onClick={() => onSelectStep(index)}
                  data-testid={`form-step-pill-${index}`}
                  style={{ flex: 1 }}
                >
                  <span className="v4-form-step-card__number" aria-hidden>
                    {CIRCLED[index] ?? index + 1}
                  </span>
                  <span className="v4-form-step-card__body">
                    <span className="v4-form-step-card__index">Étape {index + 1}</span>
                    <span className="v4-form-step-card__title">{stepDisplayTitle(step, index)}</span>
                    <span className="v4-form-step-card__meta">
                      {step.kind === 'confirmation'
                        ? 'Page de confirmation'
                        : `${fieldCount} champ${fieldCount !== 1 ? 's' : ''}`}
                    </span>
                  </span>
                </button>
                {steps.length > 1 ? (
                  <button
                    type="button"
                    className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger"
                    onClick={() => onRemoveStep(index)}
                    aria-label={`Supprimer l'étape ${index + 1}`}
                    style={{ marginRight: '8px' }}
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                ) : null}
              </div>
              {empty ? (
                <div className="v4-form-step-card__empty-guide">
                  <p>Glissez des champs ici depuis l'onglet CHAMPS.</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
