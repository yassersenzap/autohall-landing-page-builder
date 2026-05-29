import { Link } from 'react-router-dom';
import {
  formatLeadDate,
  PRIORITY_LABELS,
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
  return new Date(value).toLocaleString('fr-FR');
}

export default function LeadsTable({
  leads,
  pagination,
  loading,
  onPageChange,
}: LeadsTableProps) {
  if (loading) {
    return <p>Chargement des leads…</p>;
  }

  if (leads.length === 0) {
    return (
      <section className="dashboard__card">
        <p>Aucun lead trouvé pour ces critères.</p>
      </section>
    );
  }

  return (
    <section className="dashboard__card leads-table-wrap">
      <h2>
        Leads ({pagination.total})
      </h2>
      <div className="leads-table-scroll">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Campagne</th>
              <th>Landing</th>
              <th>Priorité</th>
              <th>Assigné à</th>
              <th>Relance</th>
              <th>Statut</th>
              <th>Source</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{formatDate(lead.createdAt)}</td>
                <td>{lead.fullName}</td>
                <td>{lead.phone}</td>
                <td>{lead.email ?? '—'}</td>
                <td>{lead.brand ?? '—'}</td>
                <td>{lead.model ?? '—'}</td>
                <td>{lead.campaignName}</td>
                <td>
                  <span className="leads-table__landing-title">
                    {lead.landingPageTitle}
                  </span>
                  <span className="leads-table__landing-slug">
                    /{lead.landingPageSlug}
                  </span>
                </td>
                <td>
                  <span
                    className={`campaigns-list__status priority-${lead.priority.toLowerCase()}`}
                  >
                    {PRIORITY_LABELS[lead.priority] ?? lead.priority}
                  </span>
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
                  <span
                    className={`campaigns-list__status status-${lead.status.toLowerCase()}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="leads-table__source" title={lead.sourceUrl}>
                  {lead.sourceUrl}
                </td>
                <td>
                  <Link to={`/leads/${lead.id}`} className="dashboard__link">
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
          <button
            type="button"
            className="dashboard__logout"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Page précédente
          </button>
          <span>
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            className="dashboard__logout"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Page suivante
          </button>
        </div>
      ) : null}
    </section>
  );
}
