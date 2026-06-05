import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PenLine } from 'lucide-react';
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
import { useStudioSession } from '@/hooks/useStudioSession';
import { ApiError, logoutClient, meRequest } from '@/lib/api';
import { getStudioRoute } from '@/lib/landing-studio-routes';
import {
  canManageLandingPages,
  createLandingPage,
  listLandingPages,
  slugifyTitle,
  type LandingPageListItem,
} from '@/lib/landing-pages';
import { studioNavState } from '@/lib/studio-session';
import { cn } from '@/lib/utils';

type LocationState = {
  campaignName?: string;
};

export default function CampaignLandingPagesPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const campaignName = (location.state as LocationState | null)?.campaignName ?? null;
  const studioSession = useStudioSession();

  const [landingPages, setLandingPages] = useState<LandingPageListItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const loadData = useCallback(async () => {
    if (!campaignId) return;

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
        err instanceof ApiError ? err.message : 'Impossible de charger les landing pages.',
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
    if (!slugTouched) setSlug(slugifyTitle(value));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignId) return;

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
        err instanceof ApiError ? err.message : 'Impossible de créer la landing page.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = role ? canManageLandingPages(role) : false;
  const campaignStudio =
    studioSession?.campaignId === campaignId ? studioSession : null;

  if (!campaignId) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Identifiant de campagne invalide.
      </p>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <StudioPageHeader
        title="Landing pages"
        description={campaignName ? `Campagne : ${campaignName}` : `Campagne ${campaignId}`}
        backTo="/campaigns"
        backLabel="Campagnes"
        actions={
          campaignStudio ? (
            <Link
              to={getStudioRoute(campaignStudio.pageVersionId)}
              state={studioNavState(campaignStudio)}
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
          { id: 'campaigns', label: 'Campagnes', done: true },
          { id: 'landings', label: 'Landing pages', active: true },
          { id: 'versions', label: 'Versions' },
          { id: 'studio', label: 'Studio' },
        ]}
      />

      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : null}
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Créer une landing page</CardTitle>
            <CardDescription>
              Chaque landing dispose de versions gérées dans le centre de production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex max-w-md flex-col gap-4" onSubmit={handleCreate}>
              <ShadInput
                label="Titre"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                maxLength={180}
              />
              <ShadInput
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
              <ShadButton type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer la landing page'}
              </ShadButton>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Liste ({landingPages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {landingPages.length === 0 && !loading ? (
            <EmptyState
              title="Aucune landing page"
              description="Créez une landing puis une version pour ouvrir le Studio."
            />
          ) : (
            <ul className="divide-y divide-border">
              {landingPages.map((page) => (
                <li
                  key={page.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                      {page.title}
                      <StatusBadge status={page.status} />
                    </p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    {page.lastExportedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Dernier export :{' '}
                        {new Date(page.lastExportedAt).toLocaleString('fr-FR')}
                      </p>
                    ) : null}
                  </div>
                  <ActionBar align="end">
                    <Link
                      to={`/landing-pages/${page.id}/versions`}
                      state={{
                        landingPageTitle: page.title,
                        campaignId,
                        campaignName,
                      }}
                      className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                    >
                      Versions & Studio
                    </Link>
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
