import { ShadButton } from '@/components/ui/primitives';

type TemplateConfirmDialogProps = {
  templateLabel: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TemplateConfirmDialog({
  templateLabel,
  open,
  onConfirm,
  onCancel,
}: TemplateConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="vs2-template-dialog" role="dialog" aria-modal="true" aria-labelledby="vs2-template-dialog-title">
      <div className="vs2-template-dialog__backdrop" onClick={onCancel} aria-hidden />
      <div className="vs2-template-dialog__panel">
        <h3 id="vs2-template-dialog-title" className="vs2-template-dialog__title">
          Remplacer le contenu ?
        </h3>
        <p className="vs2-template-dialog__body">
          Le modèle <strong>{templateLabel}</strong> va remplacer tous les blocs actuels de la page.
          Enregistrez avant si vous souhaitez conserver une copie.
        </p>
        <div className="vs2-template-dialog__actions">
          <ShadButton type="button" variant="secondary" size="sm" onClick={onCancel}>
            Annuler
          </ShadButton>
          <ShadButton type="button" variant="default" size="sm" onClick={onConfirm}>
            Appliquer le modèle
          </ShadButton>
        </div>
      </div>
    </div>
  );
}
