import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, logoutClient, logoutRequest, meRequest, type AuthUser } from '../lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await meRequest();
        if (!cancelled) {
          setUser(response.data);
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
            Espace interne — modules métier à venir (campagnes, landing pages,
            export).
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

      <p>
        <Link to="/">Retour à l&apos;accueil public</Link>
      </p>
    </main>
  );
}
