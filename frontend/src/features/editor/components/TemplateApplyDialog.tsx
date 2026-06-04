import { ShadButton } from '@/components/ui/primitives';
import { getLandingTemplate, type LandingTemplateId } from '../../landing/landing-templates';

export type TemplateApplyMode = 'replace' | 'append';

type TemplateApplyDialogProps = {
  templateId: LandingTemplateId;
  existingBlockCount: number;
  applying?: boolean;
  onCancel: () => void;
  onConfirm: (mode: TemplateApplyMode) => void;
};

export function TemplateApplyDialog({
  templateId,
  existingBlockCount,
  applying = false,
  onCancel,
  onConfirm,
}: TemplateApplyDialogProps) {
  const template = getLandingTemplate(templateId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-apply-title"
      >
        <h2 id="template-apply-title" className="text-lg font-semibold tracking-tight">
          Appliquer le modèle « {template?.name ?? templateId} » ?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Cette version contient déjà {existingBlockCount} section
          {existingBlockCount > 1 ? 's' : ''}. Choisissez comment intégrer le modèle (
          {template?.blocks.length ?? 0} sections).
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <ShadButton type="button" variant="ghost" size="sm" disabled={applying} onClick={onCancel}>
            Annuler
          </ShadButton>
          <ShadButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={applying}
            onClick={() => onConfirm('append')}
          >
            Ajouter à la fin
          </ShadButton>
          <ShadButton type="button" size="sm" disabled={applying} onClick={() => onConfirm('replace')}>
            {applying ? 'Application…' : 'Remplacer tout'}
          </ShadButton>
        </div>
      </div>
    </div>
  );
}
