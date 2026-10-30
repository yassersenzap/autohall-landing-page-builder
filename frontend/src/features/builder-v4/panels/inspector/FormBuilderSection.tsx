import { Copy, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Input } from '@/components/ui/shadcn/input';
import { useBuilderV4Store } from '../../store/document.store';
import type { FormFieldConfig, FormNodeProps } from '../../types/nodes.types';
import {
  FORM_FIELD_TYPE_LABELS,
  createEmptyFormField,
  fieldNeedsOptions,
  normalizeFormField,
  type FormFieldType,
} from '../../lib/form-builder.types';
import { InspectorField, InspectorHint, InspectorSection } from './InspectorPrimitives';

function parseOptions(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatOptions(options: string[] | undefined): string {
  return (options ?? []).join('\n');
}

type FormBuilderSectionProps = {
  nodeId: string;
};

export function FormBuilderSection({ nodeId }: FormBuilderSectionProps) {
  const node = useBuilderV4Store((s) => s.getNode(nodeId));
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);

  if (!node || node.kind !== 'form') return null;

  const props = node.props as FormNodeProps;
  const fields = props.fields ?? [];

  function patchFields(nextFields: FormFieldConfig[]) {
    updateNodeProps(nodeId, { fields: nextFields } as Partial<FormNodeProps>);
  }

  function updateField(index: number, patch: Partial<FormFieldConfig>) {
    const next = fields.map((field, i) =>
      i === index ? normalizeFormField({ ...field, ...patch }) : field,
    );
    patchFields(next);
  }

  function removeField(index: number) {
    patchFields(fields.filter((_, i) => i !== index));
    toast.success('Champ supprimé');
  }

  function addField() {
    const nextField = createEmptyFormField(fields.length + 1);
    patchFields([...fields, nextField]);
    toast.success('Champ ajouté');
  }

  function duplicateField(index: number) {
    const source = fields[index];
    if (!source) return;
    const clone = normalizeFormField({
      ...source,
      id: createEmptyFormField(fields.length + 1).id,
      label: `${source.label} (copie)`,
    });
    const next = [...fields];
    next.splice(index + 1, 0, clone);
    patchFields(next);
    toast.success('Champ dupliqué');
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    patchFields(next);
  }

  return (
    <InspectorSection title="Formulaire" value="form-builder">
      <InspectorHint>
        Construisez le formulaire champ par champ — réutilisable pour toutes les campagnes Auto Hall.
      </InspectorHint>

      <div className="v4-form-builder__list">
        {fields.map((field, index) => (
          <div key={field.id} className="v4-form-builder__field" data-testid={`form-field-row-${index}`}>
            <div className="v4-form-builder__field-head">
              <span className="v4-form-builder__field-index">Champ {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="v4-form-builder__field-delete"
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                  aria-label="Monter"
                >
                  <ChevronUp size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className="v4-form-builder__field-delete"
                  onClick={() => moveField(index, 1)}
                  disabled={index === fields.length - 1}
                  aria-label="Descendre"
                >
                  <ChevronDown size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className="v4-form-builder__field-delete"
                  onClick={() => duplicateField(index)}
                  aria-label={`Dupliquer ${field.label}`}
                >
                  <Copy size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  className="v4-form-builder__field-delete"
                  onClick={() => removeField(index)}
                  aria-label={`Supprimer ${field.label}`}
                  data-testid={`form-field-delete-${index}`}
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>
            </div>

            <InspectorField label="Type">
              <Select
                value={field.type ?? 'text'}
                onValueChange={(value) => {
                  const type = value as FormFieldType;
                  updateField(index, {
                    type,
                    options: fieldNeedsOptions(type) ? field.options ?? ['Option 1'] : undefined,
                  });
                }}
              >
                <SelectTrigger className="v4-inspector-v2__select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FORM_FIELD_TYPE_LABELS) as FormFieldType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {FORM_FIELD_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InspectorField>

            <InspectorField label="Label">
              <Input
                value={field.label}
                onChange={(event) => updateField(index, { label: event.target.value })}
                className="v4-inspector-v2__text"
              />
            </InspectorField>

            <InspectorField label="Placeholder">
              <Input
                value={field.placeholder ?? ''}
                onChange={(event) => updateField(index, { placeholder: event.target.value })}
                className="v4-inspector-v2__text"
              />
            </InspectorField>

            <InspectorField label="Obligatoire">
              <label className="v4-form-builder__checkbox">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) => updateField(index, { required: event.target.checked })}
                />
                <span>Requis</span>
              </label>
            </InspectorField>

            <InspectorField label="Largeur">
              <Select
                value={field.width ?? '100%'}
                onValueChange={(value) => updateField(index, { width: value as '50%' | '100%' })}
              >
                <SelectTrigger className="v4-inspector-v2__select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                </SelectContent>
              </Select>
            </InspectorField>

            {fieldNeedsOptions(field.type ?? 'text') ? (
              <InspectorField label="Options (Select)">
                <textarea
                  className="v4-inspector-v2__textarea"
                  rows={4}
                  value={formatOptions(field.options)}
                  placeholder={'Casablanca\nRabat\nMarrakech'}
                  onChange={(event) =>
                    updateField(index, { options: parseOptions(event.target.value) })
                  }
                />
              </InspectorField>
            ) : null}
          </div>
        ))}
      </div>

      <InspectorField label="Texte du bouton">
        <Input
          value={props.submitLabel ?? ''}
          onChange={(event) => updateNodeProps(nodeId, { submitLabel: event.target.value } as Partial<FormNodeProps>)}
          className="v4-inspector-v2__text"
          placeholder="Suivant"
        />
      </InspectorField>

      <InspectorField label="Texte retour">
        <Input
          value={props.backLabel ?? ''}
          onChange={(event) => updateNodeProps(nodeId, { backLabel: event.target.value } as Partial<FormNodeProps>)}
          className="v4-inspector-v2__text"
          placeholder="Retour"
        />
      </InspectorField>

      <InspectorField label="Barre de progression">
        <label className="v4-form-builder__checkbox">
          <input
            type="checkbox"
            checked={props.showProgress !== false}
            onChange={(event) => updateNodeProps(nodeId, { showProgress: event.target.checked } as Partial<FormNodeProps>)}
          />
          <span>Afficher</span>
        </label>
      </InspectorField>

      <button
        type="button"
        className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block v4-inspector-v2__preset-btn--primary"
        onClick={addField}
        data-testid="form-add-field"
      >
        <Plus size={14} aria-hidden />
        Ajouter champ
      </button>
    </InspectorSection>
  );
}
