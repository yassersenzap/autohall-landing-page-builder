import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  canManageLandingPages,
  createLandingPage,
  listLandingPages,
  slugifyTitle,
  type LandingPageListItem,
} from '../lib/landing-pages';

type LocationState = {
  campaignName?: string;
};

export default function CampaignLandingPagesPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const campaignName =
    (location.state as LocationState | null)?.campaignName ?? null;

  const [landingPages, setLandingPages] = useState<LandingPageListItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const loadData = useCallback(async () => {
    if (!campaignId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [profile, landingPagesResponse] = await Promise.all([
        meRequest(),
        listLandingPages(campaignId),
      ]);
      setRole(profile.data.role);
      setLandingPages(landingPagesResponse.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les landing pages.',
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createLandingPage(campaignId, { title, slug });
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer la landing page.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = role ? canManageLandingPages(role) : false;

  if (!campaignId) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">Identifiant de campagne invalide.</p>
        <Link to="/campaigns">Retour aux campagnes</Link>
      </main>
    );
  }

  return (
    <main className="dashboard campaigns-page">
      <header className="dashboard__header">
        <div>
          <h1>Landing pages</h1>
          <p className="dashboard__subtitle">
            {campaignName
              ? `Campagne : ${campaignName}`
              : `Campagne ${campaignId}`}
          </p>
        </div>
        <Link to="/campaigns" className="dashboard__link">
          Retour aux campagnes
        </Link>
      </header>

      {loading ? <p>Chargement des landing pages…</p> : null}
      {error ? <p className="dashboard__error">{error}</p> : null}

      {canWrite ? (
        <section className="dashboard__card campaigns-form">
          <h2>Nouvelle landing page</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <label className="auth-form__field">
              <span>Titre</span>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                maxLength={180}
              />
            </label>
            <label className="auth-form__field">
              <span>Slug (URL)</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                required
                maxLength={180}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                title="Minuscules, chiffres et tirets uniquement"
              />
            </label>
            <button
              type="submit"
              className="auth-form__submit"
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer la landing page'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="dashboard__card">
        <h2>Landing pages ({landingPages.length})</h2>
        {landingPages.length === 0 && !loading ? (
          <p>Aucune landing page pour cette campagne.</p>
        ) : (
          <ul className="campaigns-list">
            {landingPages.map((page) => (
              <li key={page.id} className="campaigns-list__item">
                <div className="campaigns-list__title">{page.title}</div>
                <div className="campaigns-list__meta">
                  <span>/{page.slug}</span>
                  <span
                    className={`campaigns-list__status status-${page.status.toLowerCase()}`}
                  >
                    {page.status}
                  </span>
                </div>
                {page.lastExportedAt ? (
                  <div className="campaigns-list__meta">
                    Dernier export :{' '}
                    {new Date(page.lastExportedAt).toLocaleString('fr-FR')}
                  </div>
                ) : null}
                <div className="campaigns-list__actions">
                  <Link
                    to={`/landing-pages/${page.id}/versions`}
                    state={{
                      landingPageTitle: page.title,
                      campaignId,
                      campaignName,
                    }}
                  >
                    Versions
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
