import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LeadDashboardSection from '../components/dashboard/LeadDashboardSection';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { ApiError, meRequest, type AuthUser } from '../lib/api';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '../lib/lead-dashboard';
import { canViewLeads } from '../lib/leads';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<LeadDashboardKpis | null>(null);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await meRequest();
        if (cancelled) return;

        setUser(response.data);

        if (canViewLeads(response.data.role)) {
          try {
            const dashboard = await getLeadDashboardKpis();
            if (!cancelled) setKpis(dashboard.data);
          } catch (err) {
            if (!cancelled) {
              setKpisError(
                err instanceof ApiError
                  ? err.message
                  : 'Impossible de charger les indicateurs leads.',
              );
            }
          }
        }
      } catch {
        if (!cancelled) setError('Impossible de charger le profil utilisateur.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="ui-page-header__subtitle">Chargement du tableau de bord…</p>;
  }

  if (error) {
    return <p className="ui-alert ui-alert--error">{error}</p>;
  }

  return (
    <div className="studio-stack">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d’ensemble — campagnes, landing pages et performance des leads."
      />

      {user ? (
        <Card title="Session active">
          <ul className="dashboard__meta">
            <li>
              <strong>Nom :</strong> {user.fullName}
            </li>
            <li>
              <strong>Email :</strong> {user.email}
            </li>
            <li>
              <strong>Rôle :</strong> {user.role}
            </li>
          </ul>
        </Card>
      ) : null}

      {user && canViewLeads(user.role) ? (
        <>
          {kpisError ? <p className="ui-alert ui-alert--error">{kpisError}</p> : null}
          {kpis ? <LeadDashboardSection kpis={kpis} /> : null}
        </>
      ) : null}

      <nav className="dashboard__nav" aria-label="Raccourcis">
        <Link to="/campaigns">Gérer les campagnes</Link>
        {user && canViewLeads(user.role) ? (
          <>
            {' · '}
            <Link to="/leads">Consulter les leads</Link>
          </>
        ) : null}
      </nav>
    </div>
  );
}
