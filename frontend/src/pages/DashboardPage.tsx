import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LeadDashboardSection from '../components/dashboard/LeadDashboardSection';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { ApiError, meRequest, type AuthUser } from '../lib/api';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '../lib/lead-dashboard';
import { canViewLeads } from '../lib/leads';

const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';

type LastDraftRef = {
  pageVersionId: string;
  label: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<LeadDashboardKpis | null>(null);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastDraft, setLastDraft] = useState<LastDraftRef | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<LastDraftRef>;
      if (parsed.pageVersionId && parsed.label) {
        setLastDraft({
          pageVersionId: parsed.pageVersionId,
          label: parsed.label,
        });
      }
    } catch {
      setLastDraft(null);
    }
  }, []);

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

      <Card title="Workflow studio">
        <ol className="studio-workflow">
          <li className="studio-workflow__item">Campagnes</li>
          <li className="studio-workflow__item">Landing pages et versions</li>
          <li className="studio-workflow__item">Visual editor</li>
          <li className="studio-workflow__item">Preview</li>
          <li className="studio-workflow__item">Publish</li>
          <li className="studio-workflow__item">Export ZIP</li>
          <li className="studio-workflow__item">Suivi des leads</li>
        </ol>
      </Card>

      <Card title="Actions rapides">
        <div className="dashboard-quick-actions dashboard-quick-actions--stack">
          <Link to="/campaigns" className="ui-btn ui-btn--primary ui-btn--md">
            Créer une landing page
          </Link>
          <Link to="/campaigns" className="ui-btn ui-btn--secondary ui-btn--md">
            Voir les campagnes
          </Link>
          {user && canViewLeads(user.role) ? (
            <Link to="/leads" className="ui-btn ui-btn--secondary ui-btn--md">
              Consulter les leads
            </Link>
          ) : null}
          {lastDraft ? (
            <Link
              to={`/page-versions/${lastDraft.pageVersionId}/blocks`}
              className="ui-btn ui-btn--ghost ui-btn--md"
            >
              Ouvrir le dernier brouillon ({lastDraft.label})
            </Link>
          ) : (
            <button type="button" className="ui-btn ui-btn--ghost ui-btn--md" disabled>
              Ouvrir le dernier brouillon (indisponible)
            </button>
          )}
        </div>
      </Card>

      {user ? (
        <Card title="Session active">
          <ul className="dashboard-session__list">
            <li className="dashboard-session__item">
              <strong>Nom</strong>
              <span>{user.fullName}</span>
            </li>
            <li className="dashboard-session__item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </li>
            <li className="dashboard-session__item">
              <strong>Rôle</strong>
              <span>{user.role}</span>
            </li>
          </ul>
        </Card>
      ) : null}

      {user && canViewLeads(user.role) ? (
        <>
          {kpisError ? <p className="ui-alert ui-alert--error">{kpisError}</p> : null}
          {kpis ? (
            <LeadDashboardSection kpis={kpis} />
          ) : (
            <Card title="Indicateurs leads">
              <EmptyState
                title="Indicateurs indisponibles"
                description="Les données leads ne sont pas encore chargées. Actualisez la page pour réessayer."
              />
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
