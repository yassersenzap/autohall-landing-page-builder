import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  canManagePageVersions,
  createPageVersion,
  listPageVersions,
  publishPageVersion,
  type PageVersionListItem,
} from '../lib/page-versions';

type LocationState = {
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

export default function LandingPageVersionsPage() {
  const { landingPageId } = useParams<{ landingPageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const landingPageTitle = state.landingPageTitle ?? null;
  const campaignId = state.campaignId ?? null;
  const campaignName = state.campaignName ?? null;

  const [versions, setVersions] = useState<PageVersionListItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');

  const loadData = useCallback(async () => {
    if (!landingPageId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [profile, versionsResponse] = await Promise.all([
        meRequest(),
        listPageVersions(landingPageId),
      ]);
      setRole(profile.data.role);
      setVersions(versionsResponse.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les versions.',
      );
    } finally {
      setLoading(false);
    }
  }, [landingPageId, navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!landingPageId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createPageVersion(landingPageId, {
        label: label.trim() || undefined,
      });
      setLabel('');
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer la version.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = role ? canManagePageVersions(role) : false;

  async function handlePublish(versionId: string) {
    setPublishingId(versionId);
    setError(null);

    try {
      await publishPageVersion(versionId);
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de publier la version.',
      );
    } finally {
      setPublishingId(null);
    }
  }

  const backLink =
    campaignId != null
      ? {
          to: `/campaigns/${campaignId}/landing-pages`,
          state: { campaignName },
          label: campaignName
            ? `Retour aux landing pages (${campaignName})`
            : 'Retour aux landing pages',
        }
      : { to: '/campaigns', state: undefined, label: 'Retour aux campagnes' };

  if (!landingPageId) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">Identifiant de landing page invalide.</p>
        <Link to="/campaigns">Retour aux campagnes</Link>
      </main>
    );
  }

  return (
    <main className="dashboard campaigns-page">
      <header className="dashboard__header">
        <div>
          <h1>Versions de page</h1>
          <p className="dashboard__subtitle">
            {landingPageTitle
              ? `Landing : ${landingPageTitle}`
              : `Landing ${landingPageId}`}
          </p>
        </div>
        <Link to={backLink.to} state={backLink.state} className="dashboard__link">
          {backLink.label}
        </Link>
      </header>

      {loading ? <p>Chargement des versions…</p> : null}
      {error ? <p className="dashboard__error">{error}</p> : null}

      {canWrite ? (
        <section className="dashboard__card campaigns-form">
          <h2>Nouvelle version</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <label className="auth-form__field">
              <span>Libellé (optionnel)</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={120}
                placeholder="Ex. Version 2 — promo été"
              />
            </label>
            <button
              type="submit"
              className="auth-form__submit"
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer la version'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="dashboard__card">
        <h2>Versions ({versions.length})</h2>
        {versions.length === 0 && !loading ? (
          <p>Aucune version pour cette landing page.</p>
        ) : (
          <ul className="campaigns-list">
            {versions.map((version) => (
              <li key={version.id} className="campaigns-list__item">
                <div className="campaigns-list__title">
                  v{version.versionNumber}
                  {version.label ? ` — ${version.label}` : ''}
                  <span
                    className={`campaigns-list__status status-${version.status.toLowerCase()}`}
                  >
                    {version.status}
                  </span>
                </div>
                <div className="campaigns-list__meta">
                  Créée le{' '}
                  {new Date(version.createdAt).toLocaleString('fr-FR')}
                </div>
                <div className="campaigns-list__actions">
                  {canWrite && version.status === 'DRAFT' ? (
                    <>
                      <button
                        type="button"
                        className="versions-list__publish"
                        disabled={publishingId === version.id}
                        onClick={() => void handlePublish(version.id)}
                      >
                        {publishingId === version.id
                          ? 'Publication…'
                          : 'Publier'}
                      </button>
                      {' · '}
                    </>
                  ) : null}
                  <Link
                    to={`/page-versions/${version.id}/blocks`}
                    state={{
                      versionNumber: version.versionNumber,
                      versionLabel: version.label,
                      versionStatus: version.status,
                      landingPageId,
                      landingPageTitle,
                      campaignId,
                      campaignName,
                    }}
                  >
                    Blocs
                  </Link>
                  {' · '}
                  <Link
                    to={`/page-versions/${version.id}/preview`}
                    state={{
                      versionNumber: version.versionNumber,
                      versionLabel: version.label,
                      landingPageId,
                      landingPageTitle,
                      campaignId,
                      campaignName,
                    }}
                  >
                    Preview
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
