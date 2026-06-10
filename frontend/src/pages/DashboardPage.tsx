import { useEffect, useState } from 'react';

import { DASHBOARD01_CONTENT_PAD } from '@/components/admin/dashboard01-layout';
import { DashboardKpiStrip } from '@/components/dashboard/DashboardKpiStrip';
import { DashboardLeadPerformance } from '@/components/dashboard/DashboardLeadPerformance';
import { DashboardProductionPanel } from '@/components/dashboard/DashboardProductionPanel';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { useStudioSession } from '@/hooks/useStudioSession';
import { ApiError, meRequest, type AuthUser } from '@/lib/api';
import { getLeadDashboardKpis, type LeadDashboardKpis } from '@/lib/lead-dashboard';
import { canViewLeads } from '@/lib/leads';
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
      <div className="flex min-h-48 items-center justify-center px-4 text-sm text-muted-foreground lg:px-6">
        Chargement du tableau de bord…
      </div>
    );
  }

  if (error) {
    return (
      <p className="mx-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:mx-6">
        {error}
      </p>
    );
  }

  const showLeads = Boolean(user && canViewLeads(user.role));

  return (
    <>
      <p className={`${DASHBOARD01_CONTENT_PAD} -mt-2 text-sm text-muted-foreground`}>
        Pilotez les campagnes, landing pages et leads Auto Hall.
      </p>

      <DashboardKpiStrip
        sessionActive={Boolean(session)}
        sessionLabel={session?.label}
        kpis={kpis}
        showLeads={showLeads}
      />

      <DashboardProductionPanel
        session={session}
        exporting={exporting}
        onExport={() => void handleExportLatest()}
      />

      <DashboardQuickActions showLeads={showLeads} />

      {kpisError ? (
        <p className="mx-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:mx-6">
          {kpisError}
        </p>
      ) : null}

      {exportError ? (
        <p className="mx-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:mx-6">
          {exportError}
        </p>
      ) : null}

      {showLeads && kpis ? <DashboardLeadPerformance kpis={kpis} /> : null}
    </>
  );
}
