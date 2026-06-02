import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { downloadPageVersionExport } from '../lib/page-export';
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
  const [exportingId, setExportingId] = useState<string | null>(null);
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
  const latestVersion =
    versions.length > 0
      ? [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0]
      : null;

  async function handleExport(version: PageVersionListItem) {
    setExportingId(version.id);
    setError(null);

    try {
      await downloadPageVersionExport(
        version.id,
        `landing-v${version.versionNumber}.zip`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible d’exporter la version.',
      );
    } finally {
      setExportingId(null);
    }
  }

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
    <div className="studio-stack">
      <PageHeader
        title="Versions de page"
        subtitle={
          landingPageTitle
            ? `Landing : ${landingPageTitle}`
            : `Landing ${landingPageId}`
        }
        backTo={backLink.to}
        backState={backLink.state}
        backLabel={backLink.label}
      />

      {loading ? <p className="ui-page-header__subtitle">Chargement…</p> : null}
      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}

      <Card title="Centre de contrôle">
        {latestVersion ? (
          <div className="versions-control">
            <p className="versions-control__meta">
              Dernière version : <strong>v{latestVersion.versionNumber}</strong>
              {latestVersion.label ? ` — ${latestVersion.label}` : ''}
            </p>
            <div className="version-actions">
              <StatusBadge status={latestVersion.status} />
              <Link
                to={`/page-versions/${latestVersion.id}/blocks`}
                state={{
                  versionNumber: latestVersion.versionNumber,
                  versionLabel: latestVersion.label,
                  versionStatus: latestVersion.status,
                  landingPageId,
                  landingPageTitle,
                  campaignId,
                  campaignName,
                }}
                className="ui-btn ui-btn--primary ui-btn--sm"
              >
                Éditer
              </Link>
              <Link
                to={`/page-versions/${latestVersion.id}/preview`}
                state={{
                  versionNumber: latestVersion.versionNumber,
                  versionLabel: latestVersion.label,
                  landingPageId,
                  landingPageTitle,
                  campaignId,
                  campaignName,
                }}
                className="ui-btn ui-btn--secondary ui-btn--sm"
              >
                Preview
              </Link>
              {canWrite && latestVersion.status === 'DRAFT' ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={publishingId === latestVersion.id}
                  onClick={() => void handlePublish(latestVersion.id)}
                >
                  {publishingId === latestVersion.id ? 'Publication…' : 'Publier'}
                </Button>
              ) : null}
              {canWrite && latestVersion.status === 'PUBLISHED' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={exportingId === latestVersion.id}
                  onClick={() => void handleExport(latestVersion)}
                >
                  {exportingId === latestVersion.id ? 'Export…' : 'Exporter ZIP'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="ui-page-header__subtitle">
            Créez une première version pour ouvrir l’éditeur visuel et démarrer la production.
          </p>
        )}
      </Card>

      {canWrite ? (
        <Card title="Nouvelle version">
          <form className="ui-form-stack" onSubmit={handleCreate}>
            <Input
              label="Libellé (optionnel)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={120}
              placeholder="Ex. Version 2 — promo été"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Création…' : 'Créer la version'}
            </Button>
          </form>
        </Card>
      ) : null}

      <Card title={`Versions (${versions.length})`}>
        {versions.length === 0 && !loading ? (
          <EmptyState
            title="Aucune version pour cette landing page"
            description="Créez une version pour commencer l’édition, lancer la preview puis publier."
          />
        ) : (
          <ul className="campaigns-list">
            {versions.map((version) => (
              <li key={version.id} className="campaigns-list__item">
                <div className="campaigns-list__title">
                  v{version.versionNumber}
                  {version.label ? ` — ${version.label}` : ''}
                  <StatusBadge status={version.status} />
                </div>
                <div className="campaigns-list__meta">
                  Créée le{' '}
                  {new Date(version.createdAt).toLocaleString('fr-FR')}
                </div>
                <div className="version-actions">
                  {canWrite && version.status === 'DRAFT' ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={publishingId === version.id}
                      onClick={() => void handlePublish(version.id)}
                    >
                      {publishingId === version.id ? 'Publication…' : 'Publier'}
                    </Button>
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
                    className="ui-btn ui-btn--secondary ui-btn--sm"
                  >
                    Éditeur
                  </Link>
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
                    className="ui-btn ui-btn--ghost ui-btn--sm"
                  >
                    Preview
                  </Link>
                  {canWrite && version.status === 'PUBLISHED' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={exportingId === version.id}
                      onClick={() => void handleExport(version)}
                    >
                      {exportingId === version.id ? 'Export…' : 'ZIP'}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
