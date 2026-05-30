import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LeadDashboardSection from '../components/dashboard/LeadDashboardSection';
import { ApiError, logoutClient, logoutRequest, meRequest, type AuthUser } from '../lib/api';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '../lib/lead-dashboard';
import { canViewLeads } from '../lib/leads';

export default function DashboardPage() {
  const navigate = useNavigate();
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
        if (cancelled) {
          return;
        }

        setUser(response.data);

        if (canViewLeads(response.data.role)) {
          try {
            const dashboard = await getLeadDashboardKpis();
            if (!cancelled) {
              setKpis(dashboard.data);
            }
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
      } catch (err) {
        if (!cancelled) {
          logoutClient();
          if (err instanceof ApiError && err.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
          setError('Impossible de charger le profil utilisateur.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // JWT stateless : la déconnexion côté client reste valide.
    } finally {
      logoutClient();
      navigate('/login', { replace: true });
    }
  }

  if (loading) {
    return (
      <main className="dashboard">
        <p>Chargement du tableau de bord…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">{error}</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="dashboard__subtitle">
            Espace interne AutoHall — campagnes, landing pages et suivi des leads.
          </p>
        </div>
        <button type="button" className="dashboard__logout" onClick={handleLogout}>
          Se déconnecter
        </button>
      </header>

      {user ? (
        <section className="dashboard__card">
          <h2>Session active</h2>
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
        </section>
      ) : null}

      {user && canViewLeads(user.role) ? (
        <>
          {kpisError ? <p className="dashboard__error">{kpisError}</p> : null}
          {kpis ? <LeadDashboardSection kpis={kpis} /> : null}
        </>
      ) : null}

      <p className="dashboard__nav">
        <Link to="/campaigns">Gérer les campagnes</Link>
        {' · '}
        {user && canViewLeads(user.role) ? (
          <>
            <Link to="/leads">Consulter les leads</Link>
            {' · '}
          </>
        ) : null}
        <Link to="/">Retour à l&apos;accueil public</Link>
      </p>
    </main>
  );
}
