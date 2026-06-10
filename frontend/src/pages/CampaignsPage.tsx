import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { AutoHallMetricCard, AutoHallMetricGrid } from '@/components/admin/AutoHallMetricCard';
import { AutoHallPanel } from '@/components/admin/AutoHallPanel';
import { ADMIN_CONTENT_PAD } from '@/components/admin/admin-layout';
import { createCampaignsTableColumns } from '@/components/campaigns/campaigns-table-columns';
import { useStudioSession } from '@/hooks/useStudioSession';
import { CreateCampaignPanel } from '@/components/campaigns/CreateCampaignPanel';
import { DataTable } from '@/components/ui/data-table';
import { ApiError, logoutClient, meRequest } from '@/lib/api';
import {
  canManageCampaigns,
  listCampaigns,
  type CampaignListItem,
} from '@/lib/campaigns';
import { Button } from '@/components/ui/shadcn/button';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const studioSession = useStudioSession();
  const columns = createCampaignsTableColumns(studioSession);
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const [profile, campaignsResponse] = await Promise.all([
        meRequest(),
        listCampaigns(),
      ]);
      setRole(profile.data.role);
      setCampaigns(campaignsResponse.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les campagnes.',
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const canWrite = role ? canManageCampaigns(role) : false;
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const draftCount = campaigns.filter((c) => c.status === 'DRAFT').length;

  return (
    <>
      <p className={`${ADMIN_CONTENT_PAD} -mt-2 text-sm text-muted-foreground`}>
        Gérez vos campagnes marketing, marques et landing pages associées.
      </p>

      {error ? (
        <p
          className={`${ADMIN_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
        >
          {error}
        </p>
      ) : null}

      <AutoHallMetricGrid>
        <AutoHallMetricCard
          label="Total campagnes"
          value={loading ? '…' : campaigns.length}
        />
        <AutoHallMetricCard label="Actives" value={loading ? '…' : activeCount} />
        <AutoHallMetricCard label="Brouillons" value={loading ? '…' : draftCount} />
      </AutoHallMetricGrid>

      {canWrite ? <CreateCampaignPanel onCreated={() => void loadData()} /> : null}

      <section className={ADMIN_CONTENT_PAD}>
        <AutoHallPanel
          title="Liste des campagnes"
          description="Tri, recherche et accès rapide aux landing pages de chaque campagne."
          action={
            <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
              Actualiser
            </Button>
          }
          contentClassName="min-w-0"
        >
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <DataTable
              variant="target"
              columns={columns}
              data={campaigns}
              searchColumnId="name"
              searchPlaceholder="Rechercher une campagne…"
              pageSize={8}
              emptyMessage="Aucune campagne. Créez-en une pour démarrer."
            />
          )}
        </AutoHallPanel>
      </section>
    </>
  );
}
