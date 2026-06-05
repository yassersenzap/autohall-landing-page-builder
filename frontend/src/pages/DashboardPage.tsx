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
import { ShadButton, buttonVariants } from '@/components/ui/primitives';
import {
  ActionCard,
  ActionCardGrid,
  CommandHero,
  MetricStrip,
  MetricTile,
} from '@/design-system';
import { useStudioSession } from '@/hooks/useStudioSession';
import { cn } from '@/lib/utils';
import { ApiError, meRequest, type AuthUser } from '@/lib/api';
import { getPreviewRoute, getStudioRoute } from '@/lib/landing-studio-routes';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { canViewLeads } from '@/lib/leads';
import { studioNavState } from '@/lib/studio-session';
import { downloadLandingExport } from '@/lib/landing-export.api';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<LeadDashboardKpis | null>(null);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
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
    setExportError(null);
    try {
      await downloadLandingExport(session.pageVersionId);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'Impossible d’exporter la version.',
      );
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
    <div className="ds-page-stack font-sans">
      <CommandHero
        title="Centre de commande"
        description={
          user
            ? `Bienvenue, ${user.fullName} — pilotez la production de landing pages Auto Hall.`
            : 'Pilotez la production de landing pages Auto Hall.'
        }
        actions={
          <>
            {session ? (
              <Link
                to={getStudioRoute(session.pageVersionId)}
                state={studioState}
                className={cn(buttonVariants({ variant: 'default', size: 'default' }))}
              >
                <PenLine className="h-4 w-4" />
                Ouvrir le Studio
              </Link>
            ) : (
              <ShadButton variant="default" disabled>
                <PenLine className="h-4 w-4" />
                Ouvrir le Studio
              </ShadButton>
            )}
            <Link
              to="/campaigns"
              className={cn(buttonVariants({ variant: 'secondary', size: 'default' }))}
            >
              <LayoutGrid className="h-4 w-4" />
              Campagnes
            </Link>
          </>
        }
      />

      <MetricStrip>
        <MetricTile label="Produit" value="Landing Studio" />
        <MetricTile label="Session Studio" value={session ? 'Active' : '—'} />
        {showLeads && kpis ? (
          <>
            <MetricTile label="Leads totaux" value={kpis.totalLeads} />
            <MetricTile label="Contactés" value={`${kpis.contactedRatePercent} %`} />
            <MetricTile
              label="Relances"
              value={kpis.overdueFollowUps}
            />
          </>
        ) : (
          <Link to="/campaigns" className="block transition-opacity hover:opacity-90">
            <MetricTile label="Campagnes" value="Gérer →" />
          </Link>
        )}
      </MetricStrip>

      <section aria-label="Actions de production">
        <h2 className="ds-section-title mb-3">Production</h2>
        <ActionCardGrid>
          <ActionCard
            title="Ouvrir le Studio"
            description={
              session
                ? `Reprendre ${session.label} — éditeur visuel officiel.`
                : 'Ouvrez une version pour activer le Studio.'
            }
            icon={PenLine}
            href={session ? getStudioRoute(session.pageVersionId) : undefined}
            variant="primary"
            size="large"
            disabled={!session}
            disabledHint="Créez une campagne, une landing et une version pour démarrer."
            spanClass="ds-bento__span-6"
          />
          <ActionCard
            title="Créer une campagne"
            description="Lancez une nouvelle campagne et ses landing pages."
            icon={Plus}
            href="/campaigns"
            spanClass="ds-bento__span-3"
          />
          <ActionCard
            title="Campagnes"
            description="Landings, versions et actions de production."
            icon={LayoutGrid}
            href="/campaigns"
            spanClass="ds-bento__span-3"
          />
          {session ? (
            <ActionCard
              title="Aperçu"
              description={`Prévisualiser ${session.label}`}
              icon={Eye}
              href={getPreviewRoute(session.pageVersionId)}
              spanClass="ds-bento__span-3"
            />
          ) : (
            <ActionCard
              title="Aperçu"
              description="Disponible après ouverture d'une version."
              icon={Eye}
              disabled
              disabledHint="Aucune version en session."
              spanClass="ds-bento__span-3"
            />
          )}
          {session ? (
            <ActionCard
              title="Export ZIP"
              description="Télécharger le package de la dernière version."
              icon={Download}
              onClick={() => void handleExportLatest()}
              disabled={exporting}
              disabledHint={exporting ? 'Export en cours…' : undefined}
              spanClass="ds-bento__span-3"
            />
          ) : (
            <ActionCard
              title="Export ZIP"
              description="Disponible pour une version prête."
              icon={Download}
              disabled
              disabledHint="Ouvrez le Studio sur une version."
              spanClass="ds-bento__span-3"
            />
          )}
          {showLeads ? (
            <ActionCard
              title="Leads"
              description="Suivi des demandes et conversions landing."
              icon={Users}
              href="/leads"
              spanClass="ds-bento__span-3"
            />
          ) : null}
        </ActionCardGrid>
      </section>

      {kpisError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {kpisError}
        </p>
      ) : null}

      {exportError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {exportError}
        </p>
      ) : null}

      {showLeads && kpis ? <LeadDashboardMetrics kpis={kpis} /> : null}
    </div>
  );
}
