import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileEdit, LayoutGrid, Users } from 'lucide-react';
import { LeadDashboardMetrics } from '@/components/dashboard/LeadDashboardMetrics';
import { StudioPageHeader } from '@/components/studio/StudioPageHeader';
import {
  Card,
  CardContent,
  MetricCard,
  ShadButton,
  buttonVariants,
} from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { ApiError, meRequest, type AuthUser } from '@/lib/api';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { canViewLeads } from '@/lib/leads';

const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';

type LastDraftRef = {
  pageVersionId: string;
  label: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<LeadDashboardKpis | null>(null);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastDraft, setLastDraft] = useState<LastDraftRef | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<LastDraftRef>;
      if (parsed.pageVersionId && parsed.label) {
        setLastDraft({
          pageVersionId: parsed.pageVersionId,
          label: parsed.label,
        });
      }
    } catch {
      setLastDraft(null);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted-foreground">
        Chargement du tableau de bord…
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

  return (
    <div className="space-y-8 font-sans">
      <StudioPageHeader
        title="Tableau de bord"
        description={
          user
            ? `Bienvenue, ${user.fullName} — vue d’ensemble des campagnes et des leads.`
            : 'Vue d’ensemble des campagnes et des leads.'
        }
        actions={
          <>
            <Link to="/campaigns" className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}>
              <LayoutGrid className="h-3.5 w-3.5" />
              Campagnes
            </Link>
            {showLeads ? (
              <Link to="/leads" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                <Users className="h-3.5 w-3.5" />
                Leads
              </Link>
            ) : null}
            {lastDraft ? (
              <Link
                to={`/page-versions/${lastDraft.pageVersionId}/studio`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <FileEdit className="h-3.5 w-3.5" />
                {lastDraft.label}
              </Link>
            ) : (
              <ShadButton variant="outline" size="sm" disabled>
                <FileEdit className="h-3.5 w-3.5" />
                Aucun brouillon
              </ShadButton>
            )}
          </>
        }
      />

      {!showLeads ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Espace" value="Studio" hint="Connecté au builder" />
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
