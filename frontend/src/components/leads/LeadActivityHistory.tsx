import { StatusBadge } from '@/components/ui/StatusBadge';
import type { LeadStatusHistoryItem } from '../../lib/leads';

type LeadActivityHistoryProps = {
  items: LeadStatusHistoryItem[];
  loading: boolean;
  error: string | null;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR');
}

export default function LeadActivityHistory({
  items,
  loading,
  error,
}: LeadActivityHistoryProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement de l&apos;historique…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune activité enregistrée pour ce lead.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((entry) => (
        <li key={entry.id} className="ah-lead-history-item">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            {entry.eventType === 'FOLLOW_UP_UPDATE' ? (
              <span className="text-sm font-medium">Suivi interne</span>
            ) : (
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={entry.previousStatus} />
                <span className="text-muted-foreground" aria-hidden>
                  →
                </span>
                <StatusBadge status={entry.newStatus} />
              </span>
            )}
            <time className="text-xs text-muted-foreground" dateTime={entry.changedAt}>
              {formatDate(entry.changedAt)}
            </time>
          </div>
          <p className="text-sm text-muted-foreground">
            Par : {entry.changedByName ?? 'Utilisateur inconnu'}
          </p>
          {entry.activityNote?.trim() ? (
            <p className="mt-2 text-sm leading-relaxed">{entry.activityNote}</p>
          ) : null}
          {entry.internalComment?.trim() ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {entry.internalComment}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
