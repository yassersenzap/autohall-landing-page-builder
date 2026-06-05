import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Eye,
  LayoutGrid,
  PenLine,
  Plus,
  Users,
} from 'lucide-react';
import { LeadDashboardMetrics } from '@/components/dashboard/LeadDashboardMetrics';
import { StudioPageHeader } from '@/components/studio/StudioPageHeader';
import { ActionBar, QuickActionCard } from '@/components/ui/app';
import {
  Card,
  CardContent,
  MetricCard,
  ShadButton,
  buttonVariants,
} from '@/components/ui/primitives';
import { useStudioSession } from '@/hooks/useStudioSession';
import { cn } from '@/lib/utils';
import { ApiError, meRequest, type AuthUser } from '@/lib/api';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { canViewLeads } from '@/lib/leads';
import { studioNavState } from '@/lib/studio-session';
import { downloadStudioV2Export } from '@/features/visual-studio-v2/api/studio-v2-preview.api';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<LeadDashboardKpis | null>(null);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const session = useStudioSession();

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await meRequest();
        if (cancelled) return;

        setUser(response.data);

        if (canViewLeads(response.data.role)) {
          try {
            const dashboard = await getLeadDashboardKpis();
            if (!cancelled) setKpis(dashboard.data);
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
      } catch {
        if (!cancelled) setError('Impossible de charger le profil utilisateur.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExportLatest() {
    if (!session) return;
    setExporting(true);
    try {
      await downloadStudioV2Export(session.pageVersionId);
    } catch {
      // export errors surfaced by API layer
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted-foreground">
        Chargement du centre de commande…
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  const showLeads = user && canViewLeads(user.role);
  const studioState = session ? studioNavState(session) : undefined;

  return (
    <div className="studio-stack font-sans">
      <StudioPageHeader
        title="Centre de commande"
        description={
          user
            ? `Bienvenue, ${user.fullName} — production de landing pages Auto Hall.`
            : 'Production de landing pages Auto Hall.'
        }
        actions={
          <ActionBar>
            {session ? (
              <Link
                to={getStudioRoute(session.pageVersionId)}
                state={studioState}
                className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
              >
                <PenLine className="h-3.5 w-3.5" />
                Ouvrir le Studio
              </Link>
            ) : (
              <ShadButton variant="default" size="sm" disabled>
                <PenLine className="h-3.5 w-3.5" />
                Ouvrir le Studio
              </ShadButton>
            )}
            <Link to="/campaigns" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
              <LayoutGrid className="h-3.5 w-3.5" />
              Campagnes
            </Link>
          </ActionBar>
        }
      />

      <section aria-label="Actions rapides">
        <h2 className="ah-section-title mb-3">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Ouvrir le Studio"
            description={session ? session.label : 'Ouvrez une version pour activer le Studio.'}
            icon={PenLine}
            href={session ? getStudioRoute(session.pageVersionId) : undefined}
            variant="primary"
            disabled={!session}
            disabledHint="Créez une campagne, une landing et une version pour démarrer."
          />
          <QuickActionCard
            title="Créer une campagne"
            description="Lancez une nouvelle campagne marketing et ses landing pages."
            icon={Plus}
            href="/campaigns"
          />
          <QuickActionCard
            title="Voir les campagnes"
            description="Accédez aux landings, versions et actions de production."
            icon={LayoutGrid}
            href="/campaigns"
          />
          {session ? (
            <QuickActionCard
              title="Aperçu de la dernière version"
              description={`Prévisualiser ${session.label}`}
              icon={Eye}
              href={getPreviewRoute(session.pageVersionId)}
            />
          ) : (
            <QuickActionCard
              title="Aperçu"
              description="Disponible après ouverture d’une version dans le Studio."
              icon={Eye}
              disabled
              disabledHint="Aucune version récente en session."
            />
          )}
          {session ? (
            <QuickActionCard
              title="Export ZIP"
              description="Télécharger le package de la dernière version."
              icon={Download}
              onClick={() => void handleExportLatest()}
              disabled={exporting}
              disabledHint={exporting ? 'Export en cours…' : undefined}
            />
          ) : (
            <QuickActionCard
              title="Export ZIP"
              description="Disponible pour une version publiée ou prête."
              icon={Download}
              disabled
              disabledHint="Ouvrez le Studio sur une version pour exporter."
            />
          )}
          {showLeads ? (
            <QuickActionCard
              title="Voir les leads"
              description="Suivi des demandes et conversions landing."
              icon={Users}
              href="/leads"
            />
          ) : null}
        </div>
      </section>

      {!showLeads ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Produit" value="Landing Studio" hint="Éditeur officiel" />
          <Link to="/campaigns" className="block transition-opacity hover:opacity-90">
            <MetricCard label="Campagnes" value="→" hint="Gérer les landings" trend="positive" />
          </Link>
        </div>
      ) : null}

      {kpisError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {kpisError}
        </p>
      ) : null}

      {showLeads && kpis ? <LeadDashboardMetrics kpis={kpis} /> : null}

      {showLeads && !kpis && !kpisError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Indicateurs indisponibles. Actualisez la page.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
