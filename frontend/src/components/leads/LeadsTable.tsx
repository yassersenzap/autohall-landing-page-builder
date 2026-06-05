import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import {
  formatLeadDate,
  type LeadEventListItem,
  type LeadsPagination,
} from '../../lib/leads';

type LeadsTableProps = {
  leads: LeadEventListItem[];
  pagination: LeadsPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(value: string, max = 42): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export default function LeadsTable({
  leads,
  pagination,
  loading,
  onPageChange,
}: LeadsTableProps) {
  if (loading) {
    return <p className="ui-table-panel__loading">Chargement des leads…</p>;
  }

  if (leads.length === 0) {
    return (
      <p className="ui-table-panel__empty">
        Aucun lead trouvé pour ces critères de filtrage.
      </p>
    );
  }

  return (
    <>
      <div className="ui-table-panel__head">
        <h2 className="ui-table-panel__title">Résultats</h2>
        <span className="ui-table-panel__meta">
          {pagination.total} lead{pagination.total > 1 ? 's' : ''} · page{' '}
          {pagination.page} / {pagination.totalPages}
        </span>
      </div>
      <div className="leads-table-scroll">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Contact</th>
              <th>Campagne</th>
              <th>Landing</th>
              <th>Priorité</th>
              <th>Assigné</th>
              <th>Relance</th>
              <th>Statut</th>
              <th className="leads-table__col-source">Source</th>
              <th className="leads-table__col-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="leads-table__date">{formatDate(lead.createdAt)}</td>
                <td>
                  <span className="leads-table__name">{lead.fullName}</span>
                  <span className="leads-table__contact-line">{lead.phone}</span>
                  {lead.email ? (
                    <span className="leads-table__contact-line">{lead.email}</span>
                  ) : null}
                </td>
                <td>
                  <span className="leads-table__cell-primary">{lead.campaignName}</span>
                  {(lead.brand ?? lead.model) ? (
                    <span className="leads-table__contact-line">
                      {[lead.brand, lead.model].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                </td>
                <td>
                  <span className="leads-table__landing-title">
                    {lead.landingPageTitle}
                  </span>
                  <span className="leads-table__landing-slug">
                    /{lead.landingPageSlug}
                  </span>
                </td>
                <td>
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td>{lead.assignedToName ?? '—'}</td>
                <td
                  className={
                    lead.isFollowUpOverdue ? 'leads-table__overdue' : undefined
                  }
                >
                  {formatLeadDate(lead.nextFollowUpAt)}
                  {lead.isFollowUpOverdue ? (
                    <span className="leads-table__overdue-badge">En retard</span>
                  ) : null}
                </td>
                <td>
                  <StatusBadge status={lead.status} />
                </td>
                <td className="leads-table__source leads-table__col-source" title={lead.sourceUrl}>
                  {truncateText(lead.sourceUrl)}
                </td>
                <td className="leads-table__actions">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="ui-btn ui-btn--ghost ui-btn--sm"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 ? (
        <div className="leads-pagination">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Page précédente
          </Button>
          <span className="leads-pagination__meta">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Page suivante
          </Button>
        </div>
      ) : null}
    </>
  );
}
