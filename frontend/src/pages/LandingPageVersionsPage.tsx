import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Download, Eye, PenLine } from 'lucide-react';

import {
  AutoHallEmptyState,
  AutoHallPanel,
  AutoHallSubpageBack,
  AutoHallWorkflowSteps,
  ADMIN_CONTENT_PAD,
} from '@/components/admin';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { downloadLandingExport } from '@/lib/landing-export.api';
import { ApiError, logoutClient, meRequest } from '@/lib/api';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import {
  canManagePageVersions,
  createPageVersion,
  listPageVersions,
  publishPageVersion,
  type PageVersionListItem,
} from '@/lib/page-versions';
import { persistStudioSessionFromVersion } from '@/lib/studio-session';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';

type LocationState = {
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

function versionNavState(
  version: PageVersionListItem,
  landingPageId: string,
  landingPageTitle: string | null,
  campaignId: string | null,
  campaignName: string | null,
) {
  return {
    versionNumber: version.versionNumber,
    versionLabel: version.label,
    versionStatus: version.status,
    landingPageId,
    landingPageTitle,
    campaignId,
    campaignName,
  };
}

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
    if (!landingPageId) return;

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
        err instanceof ApiError ? err.message : 'Impossible de charger les versions.',
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
    if (!landingPageId) return;

    setSubmitting(true);
    setError(null);

    try {
      await createPageVersion(landingPageId, { label: label.trim() || undefined });
      setLabel('');
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Impossible de créer la version.',
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
      await downloadLandingExport(version.id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Impossible d’exporter la version.',
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
        err instanceof ApiError ? err.message : 'Impossible de publier la version.',
      );
    } finally {
      setPublishingId(null);
    }
  }

  function handleOpenStudio(version: PageVersionListItem) {
    if (!landingPageId) return;
    persistStudioSessionFromVersion({
      pageVersionId: version.id,
      versionNumber: version.versionNumber,
      versionLabel: version.label,
      landingPageId,
      landingPageTitle,
      campaignId,
      campaignName,
    });
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
      <p
        className={`${ADMIN_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
      >
        Identifiant de landing page invalide.
      </p>
    );
  }

  return (
    <>
      <AutoHallSubpageBack to={backLink.to} label={backLink.label} state={backLink.state} />

      <p className={`${ADMIN_CONTENT_PAD} -mt-2 text-sm text-muted-foreground`}>
        {landingPageTitle ? `Landing : ${landingPageTitle}` : `Landing ${landingPageId}`}
      </p>

      {latestVersion ? (
        <section className={`${ADMIN_CONTENT_PAD} flex justify-end`}>
          <Button variant="outline" size="sm" className="ah-cta-studio" asChild>
            <Link
              to={getStudioRoute(latestVersion.id)}
              state={versionNavState(
                latestVersion,
                landingPageId,
                landingPageTitle,
                campaignId,
                campaignName,
              )}
              onClick={() => handleOpenStudio(latestVersion)}
            >
              <PenLine className="size-3.5" />
              Ouvrir le Studio
            </Link>
          </Button>
        </section>
      ) : null}

      <section className={ADMIN_CONTENT_PAD}>
        <AutoHallWorkflowSteps
          steps={[
            { id: 'campaign', label: 'Campagne', done: true },
            { id: 'landing', label: 'Landing', done: true },
            { id: 'versions', label: 'Versions', active: true },
            { id: 'studio', label: 'Studio', done: !!latestVersion },
          ]}
        />
      </section>

      {loading ? (
        <p className={`${ADMIN_CONTENT_PAD} text-sm text-muted-foreground`}>Chargement…</p>
      ) : null}

      {error ? (
        <p
          className={`${ADMIN_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
        >
          {error}
        </p>
      ) : null}

      <section className={ADMIN_CONTENT_PAD}>
        <AutoHallPanel
          title="Dernière version"
          description="Point d’entrée principal vers le Studio, l’aperçu et l’export ZIP."
          className={latestVersion ? 'ah-target-panel-card--emphasis' : undefined}
        >
          {latestVersion ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium">
                  v{latestVersion.versionNumber}
                  {latestVersion.label ? ` — ${latestVersion.label}` : ''}
                </p>
                <StatusBadge status={latestVersion.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="ah-cta-studio" asChild>
                  <Link
                    to={getStudioRoute(latestVersion.id)}
                    state={versionNavState(
                      latestVersion,
                      landingPageId,
                      landingPageTitle,
                      campaignId,
                      campaignName,
                    )}
                    onClick={() => handleOpenStudio(latestVersion)}
                  >
                    <PenLine className="size-3.5" />
                    Ouvrir le Studio
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={getPreviewRoute(latestVersion.id)}
                    state={versionNavState(
                      latestVersion,
                      landingPageId,
                      landingPageTitle,
                      campaignId,
                      campaignName,
                    )}
                  >
                    <Eye className="size-3.5" />
                    Aperçu
                  </Link>
                </Button>
                {canWrite && latestVersion.status === 'DRAFT' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                    variant="outline"
                    disabled={exportingId === latestVersion.id}
                    onClick={() => void handleExport(latestVersion)}
                  >
                    <Download className="size-3.5" />
                    {exportingId === latestVersion.id ? 'Export…' : 'Export ZIP'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Créez une première version pour ouvrir le Studio et démarrer la production.
            </p>
          )}
        </AutoHallPanel>
      </section>

      {canWrite ? (
        <section className={ADMIN_CONTENT_PAD}>
          <AutoHallPanel title="Nouvelle version">
            <form className="grid max-w-md gap-4" onSubmit={handleCreate}>
              <div className="grid gap-2">
                <Label htmlFor="version-label">Libellé (optionnel)</Label>
                <Input
                  id="version-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={120}
                  placeholder="Ex. Promo été"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer la version'}
              </Button>
            </form>
          </AutoHallPanel>
        </section>
      ) : null}

      <section className={ADMIN_CONTENT_PAD}>
        <AutoHallPanel title={`Historique (${versions.length})`} contentClassName="min-w-0">
          {versions.length === 0 && !loading ? (
            <AutoHallEmptyState
              title="Aucune version"
              description="Créez une version pour commencer la production dans le Studio."
              className="ah-target-empty-state"
            />
          ) : (
            <ul className="divide-y divide-border ah-admin-list-row">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      v{version.versionNumber}
                      {version.label ? ` — ${version.label}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créée le {new Date(version.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <StatusBadge status={version.status} />
                    <Button variant="outline" size="sm" className="ah-cta-studio" asChild>
                      <Link
                        to={getStudioRoute(version.id)}
                        state={versionNavState(
                          version,
                          landingPageId,
                          landingPageTitle,
                          campaignId,
                          campaignName,
                        )}
                        onClick={() => handleOpenStudio(version)}
                      >
                        Ouvrir le Studio
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={getPreviewRoute(version.id)}
                        state={versionNavState(
                          version,
                          landingPageId,
                          landingPageTitle,
                          campaignId,
                          campaignName,
                        )}
                      >
                        Aperçu
                      </Link>
                    </Button>
                    {canWrite && version.status === 'DRAFT' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={publishingId === version.id}
                        onClick={() => void handlePublish(version.id)}
                      >
                        Publier
                      </Button>
                    ) : null}
                    {canWrite && version.status === 'PUBLISHED' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={exportingId === version.id}
                        onClick={() => void handleExport(version)}
                      >
                        Export ZIP
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AutoHallPanel>
      </section>
    </>
  );
}
