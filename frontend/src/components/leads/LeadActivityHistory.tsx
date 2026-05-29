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
    return <p>Chargement de l&apos;historique…</p>;
  }

  if (error) {
    return <p className="dashboard__error">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="lead-detail__text">Aucun changement de statut enregistré.</p>;
  }

  return (
    <ul className="lead-history">
      {items.map((entry) => (
        <li key={entry.id} className="lead-history__item">
          <div className="lead-history__header">
            <span className="lead-history__transition">
              <span
                className={`campaigns-list__status status-${entry.previousStatus.toLowerCase()}`}
              >
                {entry.previousStatus}
              </span>
              <span className="lead-history__arrow">→</span>
              <span
                className={`campaigns-list__status status-${entry.newStatus.toLowerCase()}`}
              >
                {entry.newStatus}
              </span>
            </span>
            <time className="lead-history__date" dateTime={entry.changedAt}>
              {formatDate(entry.changedAt)}
            </time>
          </div>
          <p className="lead-history__meta">
            Par : {entry.changedByName ?? 'Utilisateur inconnu'}
          </p>
          {entry.internalComment?.trim() ? (
            <p className="lead-history__comment">{entry.internalComment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
