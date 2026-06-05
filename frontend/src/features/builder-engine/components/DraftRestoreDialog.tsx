import { ShadButton } from '@/components/ui/primitives';

type DraftRestoreDialogProps = {
  updatedAt: number;
  onRestore: () => void;
  onIgnore: () => void;
};

function formatDraftTime(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
}

export function DraftRestoreDialog({
  updatedAt,
  onRestore,
  onIgnore,
}: DraftRestoreDialogProps) {
  const timeLabel = formatDraftTime(updatedAt);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-restore-title"
      >
        <h2 id="draft-restore-title" className="text-lg font-semibold tracking-tight">
          Modifications non enregistrées retrouvées
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Une sauvegarde locale de votre travail a été trouvée
          {timeLabel ? ` (${timeLabel})` : ''}. Souhaitez-vous la restaurer ?
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Rien ne sera écrit en base tant que vous n’avez pas cliqué sur Sauvegarder.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <ShadButton type="button" variant="ghost" size="sm" onClick={onIgnore}>
            Ignorer
          </ShadButton>
          <ShadButton type="button" size="sm" onClick={onRestore}>
            Restaurer
          </ShadButton>
        </div>
      </div>
    </div>
  );
}
