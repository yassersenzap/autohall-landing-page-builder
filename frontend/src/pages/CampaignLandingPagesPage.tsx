import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PenLine } from 'lucide-react';

import {
  AutoHallEmptyState,
  AutoHallPanel,
  AutoHallSubpageBack,
  AutoHallWorkflowSteps,
  DASHBOARD01_CONTENT_PAD,
} from '@/components/admin';
import { StatusBadge } from '@/components/ui/primitives/status-badge';
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
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';

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
      <p
        className={`${DASHBOARD01_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
      >
        Identifiant de campagne invalide.
      </p>
    );
  }

  return (
    <>
      <AutoHallSubpageBack to="/campaigns" label="Campagnes" />

      <p className={`${DASHBOARD01_CONTENT_PAD} -mt-2 text-sm text-muted-foreground`}>
        {campaignName ? `Campagne : ${campaignName}` : `Campagne ${campaignId}`}
      </p>

      {campaignStudio ? (
        <section className={`${DASHBOARD01_CONTENT_PAD} flex justify-end`}>
          <Button variant="outline" size="sm" className="ah-cta-studio" asChild>
            <Link
              to={getStudioRoute(campaignStudio.pageVersionId)}
              state={studioNavState(campaignStudio)}
            >
              <PenLine className="size-3.5" />
              Ouvrir le Studio
            </Link>
          </Button>
        </section>
      ) : null}

      <section className={DASHBOARD01_CONTENT_PAD}>
        <AutoHallWorkflowSteps
          steps={[
            { id: 'campaigns', label: 'Campagnes', done: true },
            { id: 'landings', label: 'Landing pages', active: true },
            { id: 'versions', label: 'Versions' },
            { id: 'studio', label: 'Studio' },
          ]}
        />
      </section>

      {loading ? (
        <p className={`${DASHBOARD01_CONTENT_PAD} text-sm text-muted-foreground`}>Chargement…</p>
      ) : null}

      {error ? (
        <p
          className={`${DASHBOARD01_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
        >
          {error}
        </p>
      ) : null}

      {canWrite ? (
        <section className={DASHBOARD01_CONTENT_PAD}>
          <AutoHallPanel
            title="Créer une landing page"
            description="Chaque landing dispose de versions gérées dans le centre de production."
          >
            <form className="grid max-w-md gap-4" onSubmit={handleCreate}>
              <div className="grid gap-2">
                <Label htmlFor="landing-title">Titre</Label>
                <Input
                  id="landing-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  maxLength={180}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="landing-slug">Slug (URL)</Label>
                <Input
                  id="landing-slug"
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
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer la landing page'}
              </Button>
            </form>
          </AutoHallPanel>
        </section>
      ) : null}

      <section className={DASHBOARD01_CONTENT_PAD}>
        <AutoHallPanel title={`Liste (${landingPages.length})`} contentClassName="min-w-0">
          {landingPages.length === 0 && !loading ? (
            <AutoHallEmptyState
              title="Aucune landing page"
              description="Créez une landing puis une version pour ouvrir le Studio."
              className="ah-target-empty-state"
            />
          ) : (
            <ul className="divide-y divide-border ah-admin-list-row">
              {landingPages.map((page) => (
                <li
                  key={page.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
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
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/landing-pages/${page.id}/versions`}
                      state={{
                        landingPageTitle: page.title,
                        campaignId,
                        campaignName,
                      }}
                    >
                      Versions & Studio
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AutoHallPanel>
      </section>
    </>
  );
}
