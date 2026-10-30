import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Settings2,
  Text,
  ToggleLeft,
  Trash2,
  Type,
} from 'lucide-react';
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
import type { FormFieldConfig, FormNodeProps, FormStepConfig } from '../../types/nodes.types';
import {
  FORM_FIELD_TYPE_LABELS,
  createEmptyFormField,
  fieldNeedsOptions,
  normalizeFormField,
  type FormFieldType,
} from '../../lib/form-builder.types';
import { resolveFormSteps } from '../../lib/form-steps';
import {
  createFieldFromLibraryPreset,
  findLibraryPreset,
  type FormFieldLibraryPreset,
} from '../../lib/form-field-library';
import {
  isStepWithoutFields,
  materializeStepFromTemplate,
} from '../../lib/form-step-templates';
import { FormFieldLibraryPanel, resolveDroppedFieldPreset } from './form/FormFieldLibraryPanel';
import { FormStepList } from './form/FormStepList';
import { InspectorField, InspectorSegmented } from './InspectorPrimitives';
import { FormBusinessSection } from './InspectorSections';
import './form-inspector.css';

type FormInspectorPanelProps = {
  nodeId: string;
};

type FormInspectorView = 'journey' | 'fields' | 'appearance' | 'submission' | 'advanced';

const VIEW_LABELS: Record<FormInspectorView, string> = {
  journey: 'STRUCTURE',
  fields: 'CHAMPS',
  appearance: 'STYLE',
  submission: 'ACTIONS',
  advanced: 'ADVANCED',
};

const AUTOHALL_FIELD_TYPES: FormFieldType[] = ['select', 'text', 'phone', 'date', 'email', 'textarea', 'checkbox'];

function fieldTypeIcon(type: FormFieldType) {
  switch (type) {
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    case 'select':
    case 'radio':
      return List;
    case 'date':
      return Calendar;
    case 'checkbox':
      return ToggleLeft;
    case 'textarea':
      return Text;
    default:
      return Type;
  }
}

function parseOptions(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatOptions(options: string[] | undefined): string {
  return (options ?? []).join('\n');
}

function stepIndexForField(steps: FormStepConfig[], fieldId: string): number | null {
  const index = steps.findIndex((step) => step.fieldIds.includes(fieldId));
  return index >= 0 ? index : null;
}

function truncate(text: string, max = 22): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type FormFieldEditorProps = {
  field: FormFieldConfig;
  fieldIndex: number;
  steps: FormStepConfig[];
  onUpdate: (patch: Partial<FormFieldConfig>) => void;
  onAssignStep: (stepIndex: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose?: () => void;
};

const FIELD_ICONS = ['', 'User', 'Phone', 'Mail', 'MapPin', 'Car', 'Calendar', 'Star', 'CheckCircle', 'Info', 'Tag', 'Hash'];

type FieldEditorTab = 'general' | 'validation' | 'appearance' | 'options';

function FormFieldEditor({
  field,
  fieldIndex,
  steps,
  onUpdate,
  onAssignStep,
  onDuplicate,
  onDelete,
  onClose,
}: FormFieldEditorProps) {
  const [tab, setTab] = useState<FieldEditorTab>('general');
  const stepIndex = stepIndexForField(steps, field.id);
  const hasOptions = fieldNeedsOptions(field.type ?? 'text');

  return (
    <div className="v4-form-inspector__editor" data-testid={`form-field-editor-${fieldIndex}`}>
      <div className="v4-form-inspector__editor-head">
        <h4 className="v4-form-inspector__editor-title">{field.label || 'Sans label'}</h4>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="v4-form-inspector__icon-btn" onClick={onDuplicate} aria-label="Dupliquer">
            <Copy size={13} aria-hidden />
          </button>
          <button type="button" className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger" onClick={onDelete} aria-label="Supprimer" data-testid={`form-field-delete-${fieldIndex}`}>
            <Trash2 size={13} aria-hidden />
          </button>
          {onClose ? (
            <button type="button" className="v4-form-inspector__icon-btn" onClick={onClose} aria-label="Fermer" style={{ fontSize: 16, lineHeight: 1 }}>
              ×
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Sous-onglets champ ──────────────────────────────── */}
      <div className="v4-field-editor__tabs">
        {(['general', 'validation', 'appearance', ...(hasOptions ? ['options'] : [])] as FieldEditorTab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={['v4-field-editor__tab', tab === key ? 'v4-field-editor__tab--active' : ''].filter(Boolean).join(' ')}
            onClick={() => setTab(key)}
          >
            {key === 'general' ? 'Général' : key === 'validation' ? 'Validation' : key === 'appearance' ? 'Apparence' : 'Options'}
          </button>
        ))}
      </div>

      {/* ── Général ─────────────────────────────────────────── */}
      {tab === 'general' ? (
        <>
          <InspectorField label="Type">
            <Select
              value={field.type ?? 'text'}
              onValueChange={(value) => {
                const type = value as FormFieldType;
                onUpdate({ type, options: fieldNeedsOptions(type) ? field.options ?? ['Option 1'] : undefined });
              }}
            >
              <SelectTrigger className="v4-inspector-v2__select-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AUTOHALL_FIELD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{FORM_FIELD_TYPE_LABELS[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InspectorField>

          <InspectorField label="Label">
            <Input value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} className="v4-inspector-v2__text" />
          </InspectorField>

          <InspectorField label="Placeholder">
            <Input value={field.placeholder ?? ''} onChange={(e) => onUpdate({ placeholder: e.target.value })} className="v4-inspector-v2__text" />
          </InspectorField>

          <div className="v4-form-inspector__assign-row">
            <InspectorField label="Étape">
              <Select
                value={stepIndex !== null ? String(stepIndex) : 'none'}
                onValueChange={(value) => { if (value !== 'none') onAssignStep(Number(value)); }}
              >
                <SelectTrigger className="v4-inspector-v2__select-trigger"><SelectValue placeholder="Non assigné" /></SelectTrigger>
                <SelectContent>
                  {steps.map((step, index) => (
                    <SelectItem key={step.id} value={String(index)}>Étape {index + 1} — {truncate(step.title, 28)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InspectorField>
          </div>

          <div className="v4-form-inspector__inline-2">
            <InspectorField label="Largeur">
              <Select value={field.width ?? '100%'} onValueChange={(v) => onUpdate({ width: v as '50%' | '100%' })}>
                <SelectTrigger className="v4-inspector-v2__select-trigger"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">Pleine</SelectItem>
                  <SelectItem value="50%">Demi</SelectItem>
                </SelectContent>
              </Select>
            </InspectorField>
            <InspectorField label="Obligatoire">
              <label className="v4-form-inspector__toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={field.required} onChange={(e) => onUpdate({ required: e.target.checked })} />
                <span>Requis</span>
              </label>
            </InspectorField>
          </div>
        </>
      ) : null}

      {/* ── Validation ──────────────────────────────────────── */}
      {tab === 'validation' ? (
        <>
          <InspectorField label="Message d'erreur">
            <Input value={field.errorMessage ?? ''} onChange={(e) => onUpdate({ errorMessage: e.target.value })} className="v4-inspector-v2__text" placeholder="Veuillez vérifier ce champ" />
          </InspectorField>

          <InspectorField label="Regex (validation)">
            <Input value={field.regex ?? ''} onChange={(e) => onUpdate({ regex: e.target.value })} className="v4-inspector-v2__text" placeholder="^[0-9]{10}$" />
          </InspectorField>

          <div className="v4-form-inspector__inline-2">
            <InspectorField label="Min">
              <Input value={field.min ?? ''} onChange={(e) => onUpdate({ min: e.target.value })} className="v4-inspector-v2__text" placeholder="0" />
            </InspectorField>
            <InspectorField label="Max">
              <Input value={field.max ?? ''} onChange={(e) => onUpdate({ max: e.target.value })} className="v4-inspector-v2__text" placeholder="100" />
            </InspectorField>
          </div>

          <InspectorField label="Valeur par défaut">
            <Input value={field.defaultValue ?? ''} onChange={(e) => onUpdate({ defaultValue: e.target.value })} className="v4-inspector-v2__text" />
          </InspectorField>

          <InspectorField label="Infobulle (tooltip)">
            <Input value={field.tooltip ?? ''} onChange={(e) => onUpdate({ tooltip: e.target.value })} className="v4-inspector-v2__text" placeholder="Aide contextuelle" />
          </InspectorField>
        </>
      ) : null}

      {/* ── Apparence ───────────────────────────────────────── */}
      {tab === 'appearance' ? (
        <>
          <InspectorField label="Description">
            <textarea
              className="v4-form-inspector__textarea"
              rows={2}
              value={field.description ?? ''}
              placeholder="Texte d'aide affiché sous le champ"
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </InspectorField>

          <InspectorField label="Icône">
            <Select value={field.icon ?? ''} onValueChange={(v) => onUpdate({ icon: v || undefined })}>
              <SelectTrigger className="v4-inspector-v2__select-trigger"><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                {FIELD_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon || '— Aucune'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InspectorField>

          <div className="v4-form-inspector__inline-2">
            <InspectorField label="Largeur">
              <Select value={field.width ?? '100%'} onValueChange={(v) => onUpdate({ width: v as '50%' | '100%' })}>
                <SelectTrigger className="v4-inspector-v2__select-trigger"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">Pleine</SelectItem>
                  <SelectItem value="50%">Demi</SelectItem>
                </SelectContent>
              </Select>
            </InspectorField>
            <InspectorField label="Obligatoire">
              <label className="v4-form-inspector__toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={field.required} onChange={(e) => onUpdate({ required: e.target.checked })} />
                <span>Requis</span>
              </label>
            </InspectorField>
          </div>
        </>
      ) : null}

      {/* ── Options (select/radio) ──────────────────────────── */}
      {tab === 'options' && hasOptions ? (
        <>
          <p className="v4-form-inspector__card-sub" style={{ margin: 0 }}>Une option par ligne</p>
          <textarea
            className="v4-form-inspector__textarea"
            rows={7}
            value={formatOptions(field.options)}
            placeholder={'Casablanca\nRabat\nMarrakech'}
            onChange={(e) => onUpdate({ options: parseOptions(e.target.value) })}
          />
          <p className="v4-form-inspector__canvas-hint">{(field.options?.length ?? 0)} option{(field.options?.length ?? 0) !== 1 ? 's' : ''}</p>
        </>
      ) : null}
    </div>
  );
}

export function FormInspectorPanel({ nodeId }: FormInspectorPanelProps) {
  const node = useBuilderV4Store((s) => s.getNode(nodeId));
  const updateNodeProps = useBuilderV4Store((s) => s.updateNodeProps);
  const canvasSelectedFieldId = useBuilderV4Store((s) => s.selectedFormFieldId);
  const setCanvasSelectedFieldId = useBuilderV4Store((s) => s.setSelectedFormFieldId);
  const [view, setView] = useState<FormInspectorView>('journey');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  if (!node || node.kind !== 'form') return null;

  const props = node.props as FormNodeProps;
  const steps = resolveFormSteps(props);
  const previewIndex = Math.min(props.previewStepIndex ?? 0, Math.max(0, steps.length - 1));
  const currentStep = steps[previewIndex];
  const fields = props.fields ?? [];

  const selectedFieldIndex = selectedFieldId
    ? fields.findIndex((f) => f.id === selectedFieldId)
    : -1;
  const selectedField = selectedFieldIndex >= 0 ? fields[selectedFieldIndex] : null;

  useEffect(() => {
    if (selectedFieldId && !fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(null);
    }
  }, [fields, selectedFieldId]);

  useEffect(() => {
    if (canvasSelectedFieldId && fields.some((field) => field.id === canvasSelectedFieldId)) {
      setSelectedFieldId(canvasSelectedFieldId);
      setView('fields');
    }
  }, [canvasSelectedFieldId, fields]);

  function patchProps(patch: Partial<FormNodeProps>) {
    updateNodeProps(nodeId, patch);
  }

  function patchSteps(nextSteps: FormStepConfig[]) {
    patchProps({
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: Math.min(previewIndex, Math.max(0, nextSteps.length - 1)),
    });
  }

  function patchFields(nextFields: FormFieldConfig[]) {
    const removedIds = new Set(
      fields.filter((f) => !nextFields.some((n) => n.id === f.id)).map((f) => f.id),
    );
    const nextSteps =
      removedIds.size === 0
        ? steps
        : steps.map((step) => ({
            ...step,
            fieldIds: step.fieldIds.filter((id) => !removedIds.has(id)),
          }));
    patchProps({ fields: nextFields, steps: nextSteps, stepCount: nextSteps.length });
  }

  function updateStep(index: number, patch: Partial<FormStepConfig>) {
    patchSteps(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }
  function selectStep(index: number) {
    patchProps({ previewStepIndex: index });
  }

  function assignFieldToStep(fieldId: string, stepIndex: number) {
    const nextSteps = steps.map((step, i) => {
      const without = step.fieldIds.filter((id) => id !== fieldId);
      if (i === stepIndex) return { ...step, fieldIds: [...without, fieldId] };
      return { ...step, fieldIds: without };
    });
    patchSteps(nextSteps);
    selectStep(stepIndex);
  }

  function applyPreset(presetName: 'essai' | 'devis' | 'reprise' | 'sav' | 'contact' | 'custom') {
    if (presetName === 'custom') {
      patchProps({
        fields: [],
        steps: [
          {
            id: 'step_1',
            title: 'Étape 1',
            description: 'Veuillez remplir les informations.',
            fieldIds: [],
            nextLabel: 'Envoyer',
            backLabel: 'Retour'
          }
        ],
        stepCount: 1,
        previewStepIndex: 0,
        submitLabel: 'Envoyer',
        backLabel: 'Retour'
      });
      toast.success('Formulaire personnalisé réinitialisé');
      return;
    }

    if (presetName === 'essai') {
      const newFields = [
        { id: 'vehicleModel', type: 'select' as const, label: 'Modèle', placeholder: 'Sélectionnez un modèle', required: true, width: '100%' as const, options: ['Chery Tiggo 2 Pro', 'Chery Tiggo 4 Pro', 'Chery Tiggo 7 Pro', 'Chery Tiggo 8 Pro', 'Ford Kuga', 'Ford Ranger', 'Ford Puma', 'Ford Explorer'] },
        { id: 'city', type: 'select' as const, label: 'Ville', placeholder: 'Sélectionnez votre ville', required: true, width: '100%' as const, options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Meknès', 'Oujda'] },
        { id: 'fullName', type: 'text' as const, label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, width: '100%' as const },
        { id: 'phone', type: 'phone' as const, label: 'Téléphone', placeholder: '06 00 00 00 00', required: true, width: '100%' as const },
        { id: 'email', type: 'email' as const, label: 'Email', placeholder: 'nom@exemple.com', required: true, width: '100%' as const },
        { id: 'preferredDate', type: 'date' as const, label: 'Date souhaitée', required: true, width: '100%' as const },
        { id: 'f_rgpd', type: 'checkbox' as const, label: "J'accepte le traitement de mes données conformément à la politique de confidentialité d'Auto Hall.", required: true, width: '100%' as const },
      ];

      const newSteps: FormStepConfig[] = [
        {
          id: 'step_vehicule',
          title: 'Étape 1 — Votre véhicule',
          description: 'Sélectionnez le modèle et votre concession',
          fieldIds: ['vehicleModel', 'city'],
          nextLabel: 'Vos coordonnées',
          backLabel: 'Retour'
        },
        {
          id: 'step_coords',
          title: 'Étape 2 — Vos informations',
          description: 'Complétez vos coordonnées pour confirmer l\'essai',
          fieldIds: ['fullName', 'phone', 'email', 'preferredDate', 'f_rgpd'],
          nextLabel: 'Confirmer ma demande',
          backLabel: 'Retour'
        }
      ];

      patchProps({
        fields: newFields.map(f => ({ ...f, enabled: true })),
        steps: newSteps,
        stepCount: 2,
        previewStepIndex: 0,
        submitLabel: 'Confirmer ma demande',
        backLabel: 'Retour'
      });
      toast.success('Preset Test Drive Auto Hall appliqué');
    }

    if (presetName === 'devis') {
      const newFields = [
        { id: 'f_model', type: 'select' as const, label: 'Modèle de véhicule', placeholder: 'Sélectionnez un modèle', required: true, width: '100%' as const, options: ['Chery Tiggo 2 Pro', 'Chery Tiggo 7 Pro', 'Chery Tiggo 8 Pro', 'Ford Kuga', 'Ford Ranger'] },
        { id: 'f_version', type: 'text' as const, label: 'Version souhaitée', placeholder: 'Ex: Finition Premium', required: true, width: '100%' as const },
        { id: 'f_name', type: 'text' as const, label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, width: '100%' as const },
        { id: 'f_phone', type: 'phone' as const, label: 'Téléphone', placeholder: 'Votre numéro', required: true, width: '100%' as const },
        { id: 'f_email', type: 'email' as const, label: 'Email', placeholder: 'nom@exemple.com', required: true, width: '100%' as const },
      ];

      const newSteps: FormStepConfig[] = [
        {
          id: 'step_devis_vehicule',
          title: 'Étape 1 — Configuration',
          description: 'Quel véhicule vous intéresse ?',
          fieldIds: ['f_model', 'f_version'],
          nextLabel: 'Suivant',
          backLabel: 'Retour'
        },
        {
          id: 'step_devis_coords',
          title: 'Étape 2 — Coordonnées',
          description: 'Où vous envoyer votre devis personnalisé ?',
          fieldIds: ['f_name', 'f_phone', 'f_email'],
          nextLabel: 'Recevoir le devis',
          backLabel: 'Retour'
        }
      ];

      patchProps({
        fields: newFields.map(f => ({ ...f, enabled: true })),
        steps: newSteps,
        stepCount: 2,
        previewStepIndex: 0,
        submitLabel: 'Recevoir le devis',
        backLabel: 'Retour'
      });
      toast.success('Preset Demande de devis appliqué');
    }

    if (presetName === 'contact') {
      const newFields = [
        { id: 'f_name', type: 'text' as const, label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, width: '100%' as const },
        { id: 'f_phone', type: 'phone' as const, label: 'Téléphone', placeholder: 'Votre numéro', required: true, width: '100%' as const },
        { id: 'f_message', type: 'textarea' as const, label: 'Message / Demande', placeholder: 'Saisissez votre message', required: true, width: '100%' as const },
      ];

      const newSteps: FormStepConfig[] = [
        {
          id: 'step_contact',
          title: 'Contact',
          description: 'Laissez votre message à nos conseillers',
          fieldIds: ['f_name', 'f_phone', 'f_message'],
          nextLabel: 'Envoyer',
          backLabel: 'Retour'
        }
      ];

      patchProps({
        fields: newFields.map(f => ({ ...f, enabled: true })),
        steps: newSteps,
        stepCount: 1,
        previewStepIndex: 0,
        submitLabel: 'Envoyer',
        backLabel: 'Retour'
      });
      toast.success('Preset Formulaire de contact appliqué');
    }

    if (presetName === 'reprise') {
      const newFields = [
        { id: 'f_brand', type: 'text' as const, label: 'Marque', placeholder: 'Ex: Renault', required: true, width: '50%' as const },
        { id: 'f_model', type: 'text' as const, label: 'Modèle', placeholder: 'Ex: Clio 4', required: true, width: '50%' as const },
        { id: 'f_year', type: 'select' as const, label: 'Année', required: true, width: '50%' as const, options: ['2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','Avant 2015'] },
        { id: 'f_km', type: 'select' as const, label: 'Kilométrage', required: true, width: '50%' as const, options: ['< 30 000 km','30 000 – 60 000 km','60 000 – 100 000 km','100 000 – 150 000 km','> 150 000 km'] },
        { id: 'f_name', type: 'text' as const, label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, width: '100%' as const },
        { id: 'f_phone', type: 'phone' as const, label: 'Téléphone', placeholder: '06 00 00 00 00', required: true, width: '100%' as const },
        { id: 'f_rgpd', type: 'checkbox' as const, label: "J'accepte d'être contacté par Auto Hall.", required: true, width: '100%' as const },
      ];
      const newSteps: FormStepConfig[] = [
        { id: 'step_vehicle', title: 'Votre véhicule', description: 'Renseignez les infos de votre voiture', fieldIds: ['f_brand','f_model','f_year','f_km'], nextLabel: 'Coordonnées', backLabel: 'Retour' },
        { id: 'step_coords', title: 'Vos coordonnées', description: 'Pour vous proposer une estimation', fieldIds: ['f_name','f_phone','f_rgpd'], nextLabel: 'Obtenir mon estimation', backLabel: 'Retour' },
      ];
      patchProps({ fields: newFields.map(f => ({ ...f, enabled: true })), steps: newSteps, stepCount: 2, previewStepIndex: 0, submitLabel: 'Obtenir mon estimation', backLabel: 'Retour' });
      toast.success('Preset Reprise véhicule appliqué');
    }

    if (presetName === 'sav') {
      const newFields = [
        { id: 'f_vehicle', type: 'text' as const, label: 'Votre véhicule', placeholder: 'Ex: Chery Tiggo 7', required: true, width: '50%' as const },
        { id: 'f_immat', type: 'text' as const, label: 'Immatriculation', placeholder: 'Ex: 12345-A-1', required: false, width: '50%' as const },
        { id: 'f_city', type: 'select' as const, label: 'Concession', required: true, width: '100%' as const, options: ['Casablanca','Rabat','Marrakech','Tanger','Fès','Agadir','Oujda','Meknès','Tétouan'] },
        { id: 'f_date', type: 'date' as const, label: 'Date souhaitée', required: false, width: '100%' as const },
        { id: 'f_name', type: 'text' as const, label: 'Nom complet', placeholder: 'Votre nom et prénom', required: true, width: '100%' as const },
        { id: 'f_phone', type: 'phone' as const, label: 'Téléphone', placeholder: '06 00 00 00 00', required: true, width: '100%' as const },
        { id: 'f_rgpd', type: 'checkbox' as const, label: "J'accepte d'être contacté par Auto Hall.", required: true, width: '100%' as const },
      ];
      const newSteps: FormStepConfig[] = [
        { id: 'step_vehicle', title: 'Votre véhicule', description: 'Infos du véhicule et concession préférée', fieldIds: ['f_vehicle','f_immat','f_city','f_date'], nextLabel: 'Coordonnées', backLabel: 'Retour' },
        { id: 'step_coords', title: 'Vos coordonnées', description: 'Pour confirmer le rendez-vous', fieldIds: ['f_name','f_phone','f_rgpd'], nextLabel: 'Confirmer le RDV', backLabel: 'Retour' },
      ];
      patchProps({ fields: newFields.map(f => ({ ...f, enabled: true })), steps: newSteps, stepCount: 2, previewStepIndex: 0, submitLabel: 'Confirmer le RDV', backLabel: 'Retour' });
      toast.success('Preset Rendez-vous SAV appliqué');
    }
  }

  function removeFieldFromStep(fieldId: string) {
    if (!currentStep || currentStep.kind === 'confirmation') return;
    const remaining = currentStep.fieldIds.filter((id) => id !== fieldId);
    updateStep(previewIndex, { fieldIds: remaining });
  }

  function reorderStepField(fieldId: string, direction: -1 | 1) {
    if (!currentStep) return;
    const ids = [...currentStep.fieldIds];
    const index = ids.indexOf(fieldId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    updateStep(previewIndex, { fieldIds: ids });
  }

  function addStep() {
    const { step } = materializeStepFromTemplate('empty', fields.length);
    const nextSteps = [
      ...steps,
      {
        ...step,
        title: `Étape ${steps.length + 1}`,
        description: '',
        nextLabel: 'Suivant',
        backLabel: 'Retour',
      },
    ];
    patchProps({
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: nextSteps.length - 1,
    });
    toast.success('Étape ajoutée');
  }

  function removeStep(index: number) {
    if (steps.length <= 1) {
      toast.error('Au moins une étape est requise');
      return;
    }
    const nextIndex = index >= previewIndex ? Math.max(0, previewIndex - 1) : previewIndex;
    patchSteps(steps.filter((_, i) => i !== index));
    patchProps({ previewStepIndex: nextIndex });
    toast.success('Étape supprimée');
  }

  function reorderSteps(fromIndex: number, toIndex: number) {
    const nextSteps = [...steps];
    const [moved] = nextSteps.splice(fromIndex, 1);
    nextSteps.splice(toIndex, 0, moved);
    patchSteps(nextSteps);
    selectStep(toIndex);
  }

  function addFieldFromPreset(preset: FormFieldLibraryPreset, openEditor = false) {
    const nextField = normalizeFormField(createFieldFromLibraryPreset(preset, fields.length));
    const nextFields = [...fields, nextField];
    const targetStep = previewIndex;
    const nextSteps = steps.map((step, i) => {
      if (i !== targetStep || step.kind === 'confirmation') return step;
      return { ...step, fieldIds: [...step.fieldIds, nextField.id] };
    });
    patchProps({
      fields: nextFields,
      steps: nextSteps,
      stepCount: nextSteps.length,
      previewStepIndex: targetStep,
    });
    if (openEditor) {
      setSelectedFieldId(nextField.id);
      setView('fields');
    }
    selectStep(targetStep);
    toast.success(`« ${preset.label} » ajouté à l'étape ${targetStep + 1}`);
  }

  function addField(type: FormFieldType = 'text', openEditor = false) {
    const preset = findLibraryPreset(type === 'select' ? 'select' : type === 'phone' ? 'phone' : type === 'date' ? 'date' : 'text');
    if (preset) {
      addFieldFromPreset(preset, openEditor);
      return;
    }
    const nextField = normalizeFormField({
      ...createEmptyFormField(fields.length + 1),
      type,
      label:
        type === 'select'
          ? 'Liste déroulante'
          : type === 'phone'
            ? 'Téléphone'
            : type === 'date'
              ? 'Date'
              : `Champ ${fields.length + 1}`,
      options: fieldNeedsOptions(type) ? ['Option 1', 'Option 2'] : undefined,
    });
    const nextFields = [...fields, nextField];
    const nextSteps = steps.map((step, i) =>
      i === previewIndex ? { ...step, fieldIds: [...step.fieldIds, nextField.id] } : step,
    );
    patchProps({ fields: nextFields, steps: nextSteps, stepCount: nextSteps.length });
    if (openEditor) {
      setSelectedFieldId(nextField.id);
      setView('fields');
    }
    toast.success(`Champ ajouté à l'étape ${previewIndex + 1}`);
  }

  function updateField(index: number, patch: Partial<FormFieldConfig>) {
    patchFields(
      fields.map((field, i) =>
        i === index ? normalizeFormField({ ...field, ...patch }) : field,
      ),
    );
  }

  function removeField(index: number) {
    const id = fields[index]?.id;
    patchFields(fields.filter((_, i) => i !== index));
    if (id === selectedFieldId) setSelectedFieldId(null);
    if (id === canvasSelectedFieldId) setCanvasSelectedFieldId(null);
    toast.success('Champ supprimé');
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
    const stepIdx = stepIndexForField(steps, source.id);
    const nextSteps =
      stepIdx !== null
        ? steps.map((step, i) =>
            i === stepIdx ? { ...step, fieldIds: [...step.fieldIds, clone.id] } : step,
          )
        : steps;
    patchProps({ fields: next, steps: nextSteps });
    setSelectedFieldId(clone.id);
    setView('fields');
    toast.success('Champ dupliqué');
  }

  function openFieldEditor(fieldId: string) {
    setSelectedFieldId(fieldId);
    setCanvasSelectedFieldId(fieldId);
    setView('fields');
  }

  function setJourneyMode(mode: 'single' | 'multi') {
    if (mode === 'single' && steps.length > 1) {
      const allFieldIds = steps.flatMap((step) => step.fieldIds);
      const uniqueIds = [...new Set(allFieldIds)];
      patchProps({
        steps: [{ ...steps[0], fieldIds: uniqueIds, title: steps[0].title || 'Étape 1' }],
        previewStepIndex: 0,
      });
      return;
    }
    if (mode === 'multi' && steps.length === 1) {
      addStep();
    }
  }

  const journeyMode = steps.length <= 1 ? 'single' : 'multi';
  const stepFieldIds = currentStep?.fieldIds ?? [];
  const stepFields = stepFieldIds
    .map((id) => fields.find((f) => f.id === id))
    .filter((f): f is FormFieldConfig => Boolean(f));

  return (
    <div className="v4-form-inspector" data-testid="form-inspector-panel">
      <div className="v4-form-inspector__subtabs" role="tablist" aria-label="Sections formulaire" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {(['journey', 'fields', 'appearance', 'submission', 'advanced'] as FormInspectorView[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            className={[
              'v4-form-inspector__subtab',
              view === key ? 'v4-form-inspector__subtab--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setView(key)}
          >
            {VIEW_LABELS[key]}
          </button>
        ))}
      </div>

      {view === 'journey' ? (
        <>
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Presets de formulaire</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { key: 'essai',    label: 'Test Drive',      sub: '2 étapes · 7 champs' },
                { key: 'devis',    label: 'Demande de devis', sub: '2 étapes · 5 champs' },
                { key: 'reprise',  label: 'Reprise véhicule', sub: '2 étapes · 7 champs' },
                { key: 'sav',      label: 'Rendez-vous SAV',  sub: '2 étapes · 7 champs' },
                { key: 'contact',  label: 'Contact',          sub: '1 étape · 3 champs' },
                { key: 'custom',   label: 'Formulaire libre', sub: 'Partir de zéro' },
              ].map(({ key, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  className="v4-inspector-v2__preset-btn v4-inspector-v2__preset-btn--block"
                  onClick={() => applyPreset(key as Parameters<typeof applyPreset>[0])}
                  data-testid={`preset-${key}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 10px' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
                  <span style={{ fontSize: 9, opacity: 0.6, fontWeight: 400 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Mode parcours</h3>
            </div>
            <InspectorSegmented
              value={journeyMode}
              options={[
                { value: 'single', label: 'Une étape' },
                { value: 'multi', label: 'Multi étapes' },
              ]}
              onChange={(value) => setJourneyMode(value as 'single' | 'multi')}
            />
          </div>

          {/* ── Champs essentiels ───────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <div>
                <h3 className="v4-form-inspector__card-title">Champs essentiels</h3>
                <p className="v4-form-inspector__card-sub">Coordonnées collectées par le formulaire</p>
              </div>
            </div>
            {([
              { type: 'email' as const, label: 'Email', icon: Mail },
              { type: 'date' as const, label: 'Date souhaitée', icon: Calendar },
            ] as { type: FormFieldType; label: string; icon: React.ComponentType<{ size?: number }> }[]).map(({ type, label, icon: Icon }) => {
              const existingField = fields.find((f) => f.type === type || f.id === type);
              const globalIdx = existingField ? fields.findIndex((f) => f.id === existingField.id) : -1;
              return (
                <div key={type} className="v4-form-inspector__step-field" style={{ padding: '6px 8px' }}>
                  <span className="v4-form-inspector__step-field-icon">
                    <Icon size={14} aria-hidden />
                  </span>
                  <span className="v4-form-inspector__step-field-body">
                    <span className="v4-form-inspector__step-field-label">{label}</span>
                    <span className="v4-form-inspector__step-field-type">
                      {existingField ? 'Actif' : 'Non ajouté'}
                    </span>
                  </span>
                  {existingField ? (
                    <button
                      type="button"
                      className={`v4-form-inspector__badge ${existingField.required ? 'v4-form-inspector__badge--required' : 'v4-form-inspector__badge--step'}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                      title={existingField.required ? 'Cliquer pour rendre optionnel' : 'Cliquer pour rendre obligatoire'}
                      onClick={() => updateField(globalIdx, { required: !existingField.required })}
                    >
                      {existingField.required ? 'Requis' : 'Optionnel'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="v4-form-inspector__icon-btn"
                      style={{ gap: 3, fontSize: 11, padding: '2px 6px', width: 'auto' }}
                      onClick={() => addField(type, true)}
                      aria-label={`Ajouter ${label}`}
                    >
                      <Plus size={11} aria-hidden />
                      Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <FormStepList
            steps={steps}
            previewIndex={previewIndex}
            onSelectStep={selectStep}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onReorderSteps={reorderSteps}
            onAssignFieldToStep={assignFieldToStep}
          />

          <p className="v4-form-inspector__canvas-hint">
            Le canvas affiche l&apos;étape {previewIndex + 1} en direct.
          </p>

          {currentStep ? (
            <div className="v4-form-inspector__card" data-testid={`form-step-editor-${previewIndex}`}>
              <div className="v4-form-inspector__card-head">
                <div>
                  <h3 className="v4-form-inspector__card-title">Contenu de l&apos;étape</h3>
                  <p className="v4-form-inspector__card-sub">Titre et texte d&apos;aide visibles sur le canvas</p>
                </div>
                <button
                  type="button"
                  className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger"
                  onClick={() => removeStep(previewIndex)}
                  disabled={steps.length <= 1}
                  aria-label="Supprimer cette étape"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>

              <InspectorField label="Titre">
                <Input
                  value={currentStep.title}
                  onChange={(event) => updateStep(previewIndex, { title: event.target.value })}
                  className="v4-inspector-v2__text"
                />
              </InspectorField>

              <InspectorField label="Description">
                <textarea
                  className="v4-form-inspector__textarea"
                  rows={2}
                  value={currentStep.description ?? ''}
                  onChange={(event) => updateStep(previewIndex, { description: event.target.value })}
                />
              </InspectorField>

              <div className="v4-form-inspector__inline-2">
                <InspectorField label="Bouton suivant">
                  <Input
                    value={currentStep.nextLabel ?? props.submitLabel ?? ''}
                    onChange={(event) => updateStep(previewIndex, { nextLabel: event.target.value })}
                    className="v4-inspector-v2__text"
                    placeholder="Suivant"
                  />
                </InspectorField>
                <InspectorField label="Bouton retour">
                  <Input
                    value={currentStep.backLabel ?? props.backLabel ?? ''}
                    onChange={(event) => updateStep(previewIndex, { backLabel: event.target.value })}
                    className="v4-inspector-v2__text"
                    placeholder="Retour"
                  />
                </InspectorField>
              </div>

            </div>
          ) : null}

          <div
            className="v4-form-inspector__card"
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes('application/x-v4-form-preset') || event.dataTransfer.types.includes('application/x-v4-field-id')) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const fieldId = event.dataTransfer.getData('application/x-v4-field-id');
              if (fieldId) {
                assignFieldToStep(fieldId, previewIndex);
                return;
              }
              const preset = resolveDroppedFieldPreset(event.dataTransfer);
              if (!preset) return;
              addFieldFromPreset(preset, true);
            }}
          >
            <div className="v4-form-inspector__card-head">
              <div>
                <h3 className="v4-form-inspector__card-title">Champs de l&apos;étape {previewIndex + 1}</h3>
                <p className="v4-form-inspector__card-sub">Ordre d&apos;affichage dans le formulaire</p>
              </div>
            </div>

            {currentStep && !isStepWithoutFields(currentStep) ? (
              <div className="v4-form-inspector__step-fields">
                {stepFields.map((field, index) => {
                  const Icon = fieldTypeIcon(field.type ?? 'text');
                  const globalIndex = fields.findIndex((f) => f.id === field.id);
                  return (
                    <div
                      key={field.id}
                      className="v4-form-inspector__step-field"
                      data-testid={`form-field-row-${globalIndex}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-v4-field-id', field.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      <span className="v4-form-inspector__step-field-icon" style={{ cursor: 'grab' }} aria-hidden>
                        <GripVertical size={12} style={{ opacity: 0.35 }} />
                      </span>
                      <span className="v4-form-inspector__step-field-icon">
                        <Icon size={14} aria-hidden />
                      </span>
                      <span className="v4-form-inspector__step-field-body">
                        <span className="v4-form-inspector__step-field-label">{field.label}</span>
                        <span className="v4-form-inspector__step-field-type">
                          {FORM_FIELD_TYPE_LABELS[field.type ?? 'text']}
                        </span>
                      </span>
                      <button
                        type="button"
                        className={`v4-form-inspector__badge ${field.required ? 'v4-form-inspector__badge--required' : 'v4-form-inspector__badge--step'}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, flexShrink: 0 }}
                        title={field.required ? 'Cliquer pour rendre optionnel' : 'Cliquer pour rendre obligatoire'}
                        onClick={() => updateField(globalIndex, { required: !field.required })}
                      >
                        {field.required ? 'Req.' : 'Opt.'}
                      </button>
                      <div className="v4-form-inspector__step-field-actions">
                        <button
                          type="button"
                          className="v4-form-inspector__icon-btn"
                          onClick={() => reorderStepField(field.id, -1)}
                          disabled={index === 0}
                          aria-label="Monter"
                        >
                          <ChevronUp size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="v4-form-inspector__icon-btn"
                          onClick={() => reorderStepField(field.id, 1)}
                          disabled={index === stepFields.length - 1}
                          aria-label="Descendre"
                        >
                          <ChevronDown size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="v4-form-inspector__icon-btn"
                          onClick={() => openFieldEditor(field.id)}
                          aria-label="Configurer"
                        >
                          <Pencil size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="v4-form-inspector__icon-btn v4-form-inspector__icon-btn--danger"
                          onClick={() => removeFieldFromStep(field.id)}
                          aria-label="Retirer de l'étape"
                        >
                          <Trash2 size={14} aria-hidden />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

          </div>
        </>
      ) : null}

      {view === 'fields' ? (
        <>
          <FormFieldLibraryPanel onAddPreset={(preset) => addFieldFromPreset(preset, true)} />

          {selectedField && selectedFieldIndex >= 0 ? (
            <FormFieldEditor
              field={selectedField}
              fieldIndex={selectedFieldIndex}
              steps={steps}
              onUpdate={(patch) => updateField(selectedFieldIndex, patch)}
              onAssignStep={(stepIndex) => assignFieldToStep(selectedField.id, stepIndex)}
              onDuplicate={() => duplicateField(selectedFieldIndex)}
              onDelete={() => removeField(selectedFieldIndex)}
              onClose={() => {
                setSelectedFieldId(null);
                setCanvasSelectedFieldId(null);
              }}
            />
          ) : (
            <div className="v4-form-inspector__empty">
              Sélectionnez un champ ci-dessous pour le configurer.
            </div>
          )}

          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <div>
                <h3 className="v4-form-inspector__card-title">Tous les champs ({fields.length})</h3>
                <p className="v4-form-inspector__card-sub">Bibliothèque globale du formulaire</p>
              </div>
            </div>

            <div className="v4-form-inspector__field-pick">
              {fields.map((field, index) => {
                const Icon = fieldTypeIcon(field.type ?? 'text');
                const stepNum = stepIndexForField(steps, field.id);
                return (
                  <button
                    key={field.id}
                    type="button"
                    className={[
                      'v4-form-inspector__field-pick-item',
                      selectedFieldId === field.id ? 'v4-form-inspector__field-pick-item--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => openFieldEditor(field.id)}
                    data-testid={`form-field-row-${index}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-v4-field-id', field.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <span className="v4-form-inspector__step-field-icon">
                      <Icon size={14} aria-hidden />
                    </span>
                    <span className="v4-form-inspector__step-field-body">
                      <span className="v4-form-inspector__step-field-label">{field.label}</span>
                      <span className="v4-form-inspector__step-field-type">
                        {FORM_FIELD_TYPE_LABELS[field.type ?? 'text']}
                      </span>
                    </span>
                    <button
                      type="button"
                      className={`v4-form-inspector__badge ${field.required ? 'v4-form-inspector__badge--required' : 'v4-form-inspector__badge--step'}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, flexShrink: 0 }}
                      title={field.required ? 'Cliquer pour rendre optionnel' : 'Cliquer pour rendre obligatoire'}
                      onClick={(e) => { e.stopPropagation(); updateField(index, { required: !field.required }); }}
                    >
                      {field.required ? 'Req.' : 'Opt.'}
                    </button>
                    {stepNum !== null ? (
                      <span className="v4-form-inspector__badge v4-form-inspector__badge--step">
                        É.{stepNum + 1}
                      </span>
                    ) : null}
                    <ArrowRight size={12} style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="v4-form-inspector__footer-btn"
              onClick={() => addField('text', true)}
              data-testid="form-add-field"
            >
              <Plus size={14} aria-hidden />
              Nouveau champ
            </button>
          </div>
        </>
      ) : null}

      {view === 'appearance' ? (
        <>
          {/* ── Submit button ───────────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <ArrowRight size={14} style={{ opacity: 0.6 }} aria-hidden />
              <h3 className="v4-form-inspector__card-title" style={{ flex: 1 }}>
                Bouton CTA
              </h3>
            </div>
            <InspectorField label="Texte du bouton">
              <Input
                className="v4-inspector-v2__text"
                placeholder="Suivant"
                value={props.submitLabel ?? ''}
                onChange={(event) => patchProps({ submitLabel: event.target.value })}
              />
            </InspectorField>
            <InspectorField label="Couleur bouton">
              <div className="v4-form-inspector__color-control">
                <input
                  type="color"
                  value={props.accentColor ?? '#e85d04'}
                  onChange={(event) => patchProps({ accentColor: event.target.value })}
                />
                <Input
                  value={props.accentColor ?? '#e85d04'}
                  onChange={(event) => patchProps({ accentColor: event.target.value })}
                  className="v4-inspector-v2__text"
                />
              </div>
            </InspectorField>
          </div>

          {/* ── Card styling ───────────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <Settings2 size={14} style={{ opacity: 0.6 }} aria-hidden />
              <h3 className="v4-form-inspector__card-title" style={{ flex: 1 }}>
                Carte du formulaire
              </h3>
            </div>
            <div className="v4-form-inspector__color-grid">
              <InspectorField label="Fond de carte">
                <div className="v4-form-inspector__color-control">
                  <input
                    type="color"
                    value={props.cardBackground ?? '#ffffff'}
                    onChange={(event) => patchProps({ cardBackground: event.target.value })}
                  />
                  <Input
                    value={props.cardBackground ?? '#ffffff'}
                    onChange={(event) => patchProps({ cardBackground: event.target.value })}
                    className="v4-inspector-v2__text"
                  />
                </div>
              </InspectorField>
              <InspectorField label="Couleur principale">
                <div className="v4-form-inspector__color-control">
                  <input
                    type="color"
                    value={props.accentColor ?? '#e85d04'}
                    onChange={(event) => patchProps({ accentColor: event.target.value })}
                  />
                  <Input
                    value={props.accentColor ?? '#e85d04'}
                    onChange={(event) => patchProps({ accentColor: event.target.value })}
                    className="v4-inspector-v2__text"
                  />
                </div>
              </InspectorField>
            </div>
            <InspectorField label={`Espacement intérieur · ${props.cardSpacing ?? 24}px`}>
              <input
                className="v4-form-inspector__range"
                type="range"
                min="16"
                max="40"
                step="2"
                value={props.cardSpacing ?? 24}
                onChange={(event) => patchProps({ cardSpacing: Number(event.target.value) })}
              />
            </InspectorField>
            <label className="v4-form-inspector__toggle">
              <input
                type="checkbox"
                checked={props.showProgress !== false}
                onChange={(event) => patchProps({ showProgress: event.target.checked })}
              />
              <span>Afficher la progression</span>
            </label>
          </div>
          <FormBusinessSection nodeId={nodeId} />
        </>
      ) : null}

      {view === 'submission' ? (
        <>
          {/* ── État succès ─────────────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Succès</h3>
            </div>
            <InspectorField label="Message de succès">
              <textarea
                className="v4-form-inspector__textarea"
                rows={3}
                placeholder="Merci, votre demande a bien été envoyée."
                value={props.successMessage ?? ''}
                onChange={(event) => patchProps({ successMessage: event.target.value })}
              />
            </InspectorField>
            <InspectorField label="Page de remerciement">
              <Input className="v4-inspector-v2__text" placeholder="/merci" value={props.thankYouPage ?? ''} onChange={(event) => patchProps({ thankYouPage: event.target.value })} />
            </InspectorField>
            <InspectorField label="URL de redirection">
              <Input className="v4-inspector-v2__text" placeholder="https://www.autohall.ma/merci" value={props.redirectUrl ?? ''} onChange={(event) => patchProps({ redirectUrl: event.target.value })} />
            </InspectorField>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <label className="v4-form-inspector__toggle">
                <input type="checkbox" checked={props.showConfetti ?? false} onChange={(e) => patchProps({ showConfetti: e.target.checked })} />
                <span>Confettis à la soumission</span>
              </label>
              <label className="v4-form-inspector__toggle">
                <input type="checkbox" checked={props.autoReset ?? false} onChange={(e) => patchProps({ autoReset: e.target.checked })} />
                <span>Réinitialiser automatiquement</span>
              </label>
              {props.autoReset ? (
                <InspectorField label={`Délai auto-reset · ${props.autoResetDelay ?? 5}s`}>
                  <input
                    className="v4-form-inspector__range"
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={props.autoResetDelay ?? 5}
                    onChange={(e) => patchProps({ autoResetDelay: Number(e.target.value) })}
                  />
                </InspectorField>
              ) : null}
            </div>
          </div>

          {/* ── État erreur ──────────────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Erreur</h3>
            </div>
            <InspectorField label="Message d'erreur">
              <textarea
                className="v4-form-inspector__textarea"
                rows={2}
                placeholder="Une erreur est survenue. Veuillez réessayer."
                value={props.errorMessage ?? ''}
                onChange={(event) => patchProps({ errorMessage: event.target.value })}
              />
            </InspectorField>
          </div>

          {/* ── État chargement ──────────────────────────────── */}
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Chargement</h3>
            </div>
            <InspectorField label="Message de chargement">
              <Input
                className="v4-inspector-v2__text"
                placeholder="Envoi en cours…"
                value={props.loadingMessage ?? ''}
                onChange={(event) => patchProps({ loadingMessage: event.target.value })}
              />
            </InspectorField>
          </div>
        </>
      ) : null}

      {view === 'advanced' ? (
        <>
          <div className="v4-form-inspector__card">
            <div className="v4-form-inspector__card-head">
              <h3 className="v4-form-inspector__card-title">Paramètres Avancés</h3>
            </div>
            
            <InspectorField label="Classe CSS">
              <Input
                className="v4-inspector-v2__text"
                placeholder="Ex: custom-form-style"
                value={props.customClass ?? ''}
                onChange={(event) => patchProps({ customClass: event.target.value })}
              />
            </InspectorField>
            
            <InspectorField label="Consentement">
              <textarea
                className="v4-form-inspector__textarea"
                rows={3}
                placeholder="J'accepte d'être contacté par Auto Hall."
                value={props.consentLabel ?? "J'accepte d'être contacté par Auto Hall."}
                onChange={(event) => patchProps({ consentLabel: event.target.value })}
              />
            </InspectorField>
          </div>
        </>
      ) : null}

    </div>
  );
}
