import { CalendarDays, CheckSquare2, ChevronDown, Mail, Phone, Type } from 'lucide-react';
import {
  FORM_FIELD_LIBRARY_CATEGORIES,
  createFieldFromLibraryPreset,
  findLibraryPreset,
  type FormFieldLibraryPreset,
} from '../../../lib/form-field-library';

type FormFieldLibraryPanelProps = {
  onAddPreset: (preset: FormFieldLibraryPreset) => void;
};

export function FormFieldLibraryPanel({ onAddPreset }: FormFieldLibraryPanelProps) {
  const icons = {
    select: ChevronDown,
    text: Type,
    phone: Phone,
    date: CalendarDays,
    email: Mail,
    rgpd: CheckSquare2,
  } as const;

  return (
    <div className="v4-field-library">
      <p className="v4-field-library__intro">
        Ajoutez un champ à l’étape affichée sur le canvas.
      </p>
      {FORM_FIELD_LIBRARY_CATEGORIES.map((category) => (
        <section key={category.id} className="v4-field-library__section">
          <h4 className="v4-field-library__section-title">{category.label}</h4>
          <div className="v4-field-library__items">
            {category.items.map((preset) => (
              (() => {
                const Icon = icons[preset.id as keyof typeof icons] ?? Type;
                return (
              <button
                key={preset.id}
                type="button"
                className="v4-field-library__item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/x-v4-form-preset', preset.id);
                  event.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddPreset(preset)}
                data-testid={`form-library-${preset.id}`}
              >
                <Icon size={15} aria-hidden />
                <span>{preset.label}</span>
              </button>
                );
              })()
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function resolveDroppedFieldPreset(dataTransfer: DataTransfer): FormFieldLibraryPreset | null {
  const presetId = dataTransfer.getData('application/x-v4-form-preset');
  if (!presetId) return null;
  return findLibraryPreset(presetId) ?? null;
}

export function fieldFromPreset(preset: FormFieldLibraryPreset, index: number) {
  return createFieldFromLibraryPreset(preset, index);
}
