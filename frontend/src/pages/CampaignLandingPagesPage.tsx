import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
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
    <div className="studio-stack">
      <PageHeader
        title="Landing pages"
        subtitle={
          campaignName
            ? `Campagne : ${campaignName}`
            : `Campagne ${campaignId}`
        }
        backTo="/campaigns"
        backLabel="Campagnes"
      />

      {loading ? <p className="ui-page-header__subtitle">Chargement…</p> : null}
      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}

      <Card title="Étape en cours">
        <ol className="studio-workflow">
          <li className="studio-workflow__item">Campagnes</li>
          <li className="studio-workflow__item studio-workflow__item--active">Landing pages</li>
          <li className="studio-workflow__item">Versions</li>
          <li className="studio-workflow__item">Editor / Preview / Publish / Export</li>
        </ol>
      </Card>

      {canWrite ? (
        <Card title="Nouvelle landing page">
          <form className="ui-form-stack" onSubmit={handleCreate}>
            <Input
              label="Titre"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              maxLength={180}
            />
            <Input
              label="Slug (URL)"
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Création…' : 'Créer la landing page'}
            </Button>
          </form>
        </Card>
      ) : null}

      <Card title={`Landing pages (${landingPages.length})`}>
        {landingPages.length === 0 && !loading ? (
          <EmptyState
            title="Aucune landing page pour cette campagne"
            description="Créez une landing page puis une version pour passer à l’éditeur visuel."
          />
        ) : (
          <ul className="campaigns-list">
            {landingPages.map((page) => (
              <li key={page.id} className="campaigns-list__item">
                <div className="campaigns-list__title">
                  {page.title}
                  <StatusBadge status={page.status} />
                </div>
                <div className="campaigns-list__meta">
                  <span>/{page.slug}</span>
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
      </Card>
    </div>
  );
}
