import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import { createCampaignsTableColumns } from '@/components/campaigns/campaigns-table-columns';
import { useStudioSession } from '@/hooks/useStudioSession';
import { CreateCampaignPanel } from '@/components/campaigns/CreateCampaignPanel';
import { StudioPageHeader } from '@/components/studio/StudioPageHeader';
import { DataTable } from '@/components/ui/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
  ShadButton,
} from '@/components/ui/primitives';
import { ApiError, logoutClient, meRequest } from '@/lib/api';
import {
  canManageCampaigns,
  listCampaigns,
  type CampaignListItem,
} from '@/lib/campaigns';

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
    <div className="space-y-8 font-sans">
      <StudioPageHeader
        title="Campagnes"
        description="Gérez vos campagnes marketing, marques et landing pages associées."
        backTo="/dashboard"
        backLabel="Tableau de bord"
        actions={
          <ShadButton variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
            Actualiser
          </ShadButton>
        }
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Total campagnes"
          value={loading ? '…' : campaigns.length}
          hint="Tous statuts"
        />
        <MetricCard
          label="Actives"
          value={loading ? '…' : activeCount}
          trend="positive"
        />
        <MetricCard
          label="Brouillons"
          value={loading ? '…' : draftCount}
          trend={draftCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {canWrite ? <CreateCampaignPanel onCreated={() => void loadData()} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            Liste des campagnes
          </CardTitle>
          <CardDescription>
            Tri, recherche et accès rapide aux landing pages de chaque campagne.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <DataTable
              columns={columns}
              data={campaigns}
              searchColumnId="name"
              searchPlaceholder="Rechercher une campagne…"
              pageSize={8}
              emptyMessage="Aucune campagne. Créez-en une pour démarrer."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
