import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Download, Eye, PenLine } from 'lucide-react';
import { StudioPageHeader } from '@/components/studio/StudioPageHeader';
import { ActionBar, WorkflowSteps } from '@/components/ui/app';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ShadButton,
  ShadInput,
  buttonVariants,
} from '@/components/ui/primitives';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { downloadStudioV2Export } from '@/features/visual-studio-v2/api/studio-v2-preview.api';
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
import { cn } from '@/lib/utils';

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
      await downloadStudioV2Export(version.id);
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
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Identifiant de landing page invalide.
      </p>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <StudioPageHeader
        title="Centre de production"
        description={
          landingPageTitle
            ? `Landing : ${landingPageTitle}`
            : `Landing ${landingPageId}`
        }
        backTo={backLink.to}
        backState={backLink.state}
        backLabel={backLink.label}
        actions={
          latestVersion ? (
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
              className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
            >
              <PenLine className="h-3.5 w-3.5" />
              Ouvrir le Studio
            </Link>
          ) : null
        }
      />

      <WorkflowSteps
        steps={[
          { id: 'campaign', label: 'Campagne', done: true },
          { id: 'landing', label: 'Landing', done: true },
          { id: 'versions', label: 'Versions', active: true },
          { id: 'studio', label: 'Studio', done: !!latestVersion },
        ]}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className={latestVersion ? 'border-primary/25' : undefined}>
        <CardHeader>
          <CardTitle>Dernière version</CardTitle>
          <CardDescription>
            Point d’entrée principal vers le Studio, l’aperçu et l’export ZIP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestVersion ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-foreground">
                  v{latestVersion.versionNumber}
                  {latestVersion.label ? ` — ${latestVersion.label}` : ''}
                </p>
                <StatusBadge status={latestVersion.status} />
              </div>
              <ActionBar>
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
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Ouvrir le Studio
                </Link>
                <Link
                  to={getPreviewRoute(latestVersion.id)}
                  state={versionNavState(
                    latestVersion,
                    landingPageId,
                    landingPageTitle,
                    campaignId,
                    campaignName,
                  )}
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Aperçu
                </Link>
                {canWrite && latestVersion.status === 'DRAFT' ? (
                  <ShadButton
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={publishingId === latestVersion.id}
                    onClick={() => void handlePublish(latestVersion.id)}
                  >
                    {publishingId === latestVersion.id ? 'Publication…' : 'Publier'}
                  </ShadButton>
                ) : null}
                {canWrite && latestVersion.status === 'PUBLISHED' ? (
                  <ShadButton
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={exportingId === latestVersion.id}
                    onClick={() => void handleExport(latestVersion)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {exportingId === latestVersion.id ? 'Export…' : 'Export ZIP'}
                  </ShadButton>
                ) : null}
              </ActionBar>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Créez une première version pour ouvrir le Studio et démarrer la production.
            </p>
          )}
        </CardContent>
      </Card>

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle version</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex max-w-md flex-col gap-4" onSubmit={handleCreate}>
              <ShadInput
                label="Libellé (optionnel)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={120}
                placeholder="Ex. Promo été"
              />
              <ShadButton type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer la version'}
              </ShadButton>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historique ({versions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 && !loading ? (
            <EmptyState
              title="Aucune version"
              description="Créez une version pour commencer la production dans le Studio."
            />
          ) : (
            <ul className="divide-y divide-border">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      v{version.versionNumber}
                      {version.label ? ` — ${version.label}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créée le {new Date(version.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <ActionBar align="end">
                    <StatusBadge status={version.status} />
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
                      className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                    >
                      Ouvrir le Studio
                    </Link>
                    <Link
                      to={getPreviewRoute(version.id)}
                      state={versionNavState(
                        version,
                        landingPageId,
                        landingPageTitle,
                        campaignId,
                        campaignName,
                      )}
                      className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                    >
                      Aperçu
                    </Link>
                    {canWrite && version.status === 'DRAFT' ? (
                      <ShadButton
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={publishingId === version.id}
                        onClick={() => void handlePublish(version.id)}
                      >
                        Publier
                      </ShadButton>
                    ) : null}
                    {canWrite && version.status === 'PUBLISHED' ? (
                      <ShadButton
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={exportingId === version.id}
                        onClick={() => void handleExport(version)}
                      >
                        Export ZIP
                      </ShadButton>
                    ) : null}
                  </ActionBar>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
