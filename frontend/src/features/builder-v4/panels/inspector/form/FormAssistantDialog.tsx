import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import {
  FORM_ASSISTANT_DEFAULT,
  type FormAssistantSelection,
  buildJourneyFromAssistant,
} from '../../../lib/form-journey-assistant';

type FormAssistantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: ReturnType<typeof buildJourneyFromAssistant>) => void;
};

const ASSISTANT_ITEMS: { key: keyof FormAssistantSelection; label: string }[] = [
  { key: 'vehicle', label: 'Véhicule' },
  { key: 'city', label: 'Ville' },
  { key: 'testDate', label: 'Date essai' },
  { key: 'name', label: 'Nom' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'email', label: 'Email' },
  { key: 'consent', label: 'Consentement' },
];

export function FormAssistantDialog({ open, onOpenChange, onApply }: FormAssistantDialogProps) {
  const [selection, setSelection] = useState<FormAssistantSelection>(FORM_ASSISTANT_DEFAULT);

  function toggle(key: keyof FormAssistantSelection) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleApply() {
    onApply(buildJourneyFromAssistant(selection));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="v4-form-dialog" data-testid="form-assistant-dialog">
        <DialogHeader>
          <DialogTitle>Assistant parcours</DialogTitle>
          <DialogDescription>Que voulez-vous demander au prospect ?</DialogDescription>
        </DialogHeader>
        <div className="v4-form-assistant__grid">
          {ASSISTANT_ITEMS.map(({ key, label }) => (
            <label key={key} className="v4-form-assistant__item">
              <input
                type="checkbox"
                checked={selection[key]}
                onChange={() => toggle(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          className="v4-form-inspector__footer-btn"
          onClick={handleApply}
          data-testid="form-assistant-apply"
        >
          Générer le parcours
        </button>
      </DialogContent>
    </Dialog>
  );
}
