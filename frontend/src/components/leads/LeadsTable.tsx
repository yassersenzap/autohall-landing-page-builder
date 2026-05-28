import type { LeadEventListItem, LeadsPagination } from '../../lib/leads';

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
              <th>Statut</th>
              <th>Source</th>
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
                    className={`campaigns-list__status status-${lead.status.toLowerCase()}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="leads-table__source" title={lead.sourceUrl}>
                  {lead.sourceUrl}
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
