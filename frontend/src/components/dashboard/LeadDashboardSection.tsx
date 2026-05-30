import { Link } from 'react-router-dom';
import { STATUS_LABELS, type LeadDashboardKpis } from '../../lib/lead-dashboard';
import { formatLeadDate, PRIORITY_LABELS } from '../../lib/leads';

type LeadDashboardSectionProps = {
  kpis: LeadDashboardKpis;
};

function KpiCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: 'warning' | 'accent';
}) {
  const className = [
    'kpi-card',
    highlight === 'warning' ? 'kpi-card--warning' : '',
    highlight === 'accent' ? 'kpi-card--accent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className}>
      <p className="kpi-card__label">{label}</p>
      <p className="kpi-card__value">{value}</p>
    </article>
  );
}

function BreakdownTable({
  title,
  rows,
  labelKey,
}: {
  title: string;
  rows: { label: string; count: number }[];
  labelKey?: string;
}) {
  if (rows.length === 0) {
    return (
      <section className="dashboard__card kpi-breakdown">
        <h3>{title}</h3>
        <p className="lead-detail__text">Aucune donnée.</p>
      </section>
    );
  }

  return (
    <section className="dashboard__card kpi-breakdown">
      <h3>{title}</h3>
      <table className="kpi-table">
        <thead>
          <tr>
            <th>{labelKey ?? 'Libellé'}</th>
            <th>Leads</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function LeadDashboardSection({ kpis }: LeadDashboardSectionProps) {
  const byStatus = kpis.byStatus.map((row) => ({
    label: STATUS_LABELS[row.status] ?? row.status,
    count: row.count,
  }));

  const byPriority = kpis.byPriority.map((row) => ({
    label: PRIORITY_LABELS[row.priority] ?? row.priority,
    count: row.count,
  }));

  const byCampaign = kpis.byCampaign.map((row) => ({
    label: row.campaignName,
    count: row.count,
  }));

  const byLanding = kpis.byLandingPage.map((row) => ({
    label: `${row.title} (/${row.slug})`,
    count: row.count,
  }));

  return (
    <div className="lead-dashboard">
      <h2 className="lead-dashboard__title">Indicateurs leads</h2>
      <p className="dashboard__subtitle lead-dashboard__intro">
        Vue opérationnelle du volume, du suivi et de la performance des campagnes.
      </p>

      <div className="kpi-cards">
        <KpiCard label="Total leads" value={kpis.totalLeads} />
        <KpiCard label="Reçus aujourd&apos;hui" value={kpis.receivedToday} highlight="accent" />
        <KpiCard label="Reçus cette semaine" value={kpis.receivedThisWeek} />
        <KpiCard
          label="Relances en retard"
          value={kpis.overdueFollowUps}
          highlight={kpis.overdueFollowUps > 0 ? 'warning' : undefined}
        />
        <KpiCard
          label="Taux contactés"
          value={`${kpis.contactedRatePercent} %`}
        />
      </div>

      <div className="kpi-breakdown-grid">
        <BreakdownTable title="Par statut" rows={byStatus} labelKey="Statut" />
        <BreakdownTable title="Par priorité" rows={byPriority} labelKey="Priorité" />
        <BreakdownTable title="Par campagne (top 10)" rows={byCampaign} labelKey="Campagne" />
        <BreakdownTable
          title="Par landing page (top 10)"
          rows={byLanding}
          labelKey="Landing"
        />
      </div>

      <section className="dashboard__card kpi-breakdown">
        <h3>Relances en retard</h3>
        {kpis.overdueLeads.length === 0 ? (
          <p className="lead-detail__text">Aucune relance en retard.</p>
        ) : (
          <div className="leads-table-scroll">
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Campagne</th>
                  <th>Landing</th>
                  <th>Relance</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {kpis.overdueLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.fullName}</td>
                    <td>{lead.campaignName}</td>
                    <td>{lead.landingPageTitle}</td>
                    <td className="leads-table__overdue">
                      {formatLeadDate(lead.nextFollowUpAt)}
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
        )}
        {kpis.overdueFollowUps > kpis.overdueLeads.length ? (
          <p className="dashboard__nav">
            <Link to="/leads?overdueOnly=true">Voir tous les leads en retard</Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
