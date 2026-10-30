import { Loader2, AlertTriangle } from 'lucide-react';
import { useBuilderV4Store } from '../store/document.store';
import { cn } from '@/lib/utils';

export function SaveStatusIndicator() {
  const saveState = useBuilderV4Store(
    (s) => s.saveState || (s.isSaving ? 'saving' : s.hasUnsavedChanges ? 'draft' : 'success'),
  );

  type StatusVariant = 'dirty' | 'saving' | 'saved' | 'error';

  let label: string;
  let status: StatusVariant;

  if (saveState === 'saving') {
    label  = 'Sauvegarde…';
    status = 'saving';
  } else if (saveState === 'error') {
    label  = 'Erreur';
    status = 'error';
  } else if (saveState === 'draft') {
    label  = 'Non sauvegardé';
    status = 'dirty';
  } else {
    label  = 'Sauvegardé';
    status = 'saved';
  }

  return (
    <span
      className={cn(
        'v4-save-badge',
        status === 'saved'  && 'v4-save-badge--saved',
        status === 'saving' && 'v4-save-badge--saving',
        status === 'dirty'  && 'v4-save-badge--dirty',
        status === 'error'  && 'v4-save-badge--error',
      )}
      data-status={status}
      data-testid="save-status-indicator"
      title="Ctrl+S pour sauvegarder"
    >
      {/* LED dot */}
      {status === 'saving' ? (
        <Loader2 size={9} aria-hidden className="v4-save-badge__spin" />
      ) : status === 'error' ? (
        <AlertTriangle size={9} aria-hidden className="v4-save-badge__dot" />
      ) : (
        <span
          className={cn(
            'v4-save-badge__led',
            status === 'saved' && 'v4-save-badge__led--green',
            status === 'dirty' && 'v4-save-badge__led--amber',
          )}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}
