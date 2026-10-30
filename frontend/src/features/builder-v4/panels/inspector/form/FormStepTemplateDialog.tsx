import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import {
  FORM_STEP_TEMPLATE_LIST,
  type FormStepTemplateId,
} from '../../../lib/form-step-templates';

type FormStepTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateId: FormStepTemplateId) => void;
};

export function FormStepTemplateDialog({
  open,
  onOpenChange,
  onSelect,
}: FormStepTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="v4-form-dialog" data-testid="form-step-template-dialog">
        <DialogHeader>
          <DialogTitle>Choisir un template</DialogTitle>
          <DialogDescription>
            Chaque étape est pré-remplie avec un titre, une description et des champs.
          </DialogDescription>
        </DialogHeader>
        <div className="v4-form-dialog__options" role="radiogroup" aria-label="Templates d'étape">
          {FORM_STEP_TEMPLATE_LIST.map((template) => (
            <button
              key={template.id}
              type="button"
              className="v4-form-dialog__option"
              onClick={() => {
                onSelect(template.id);
                onOpenChange(false);
              }}
              data-testid={`form-step-template-${template.id}`}
            >
              <span className="v4-form-dialog__option-emoji" aria-hidden>
                {template.emoji}
              </span>
              <span className="v4-form-dialog__option-body">
                <span className="v4-form-dialog__option-title">{template.label}</span>
                <span className="v4-form-dialog__option-desc">{template.description}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
