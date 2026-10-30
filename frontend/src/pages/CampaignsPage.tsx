import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, RefreshCw } from 'lucide-react';

import { AutoHallMetricCard, AutoHallMetricGrid } from '@/components/admin/AutoHallMetricCard';
import { AutoHallPanel } from '@/components/admin/AutoHallPanel';
import { ADMIN_CONTENT_PAD } from '@/components/admin/admin-layout';
import { createCampaignsTableColumns } from '@/components/campaigns/campaigns-table-columns';
import { useStudioEntry } from '@/hooks/useStudioEntry';
import { CreateCampaignPanel } from '@/components/campaigns/CreateCampaignPanel';
import { DataTable } from '@/components/ui/data-table';
import { ApiError, logoutClient, meRequest } from '@/lib/api';
import {
  canDeleteCampaign,
  canManageCampaigns,
  deleteCampaignRequest,
  listCampaigns,
  type CampaignListItem,
} from '@/lib/campaigns';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { session: studioSession } = useStudioEntry();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<CampaignListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = useCallback(async (archived = false) => {
    setError(null);
    setLoading(true);

    try {
      const [profile, campaignsResponse] = await Promise.all([
        meRequest(),
        listCampaigns({ archived }),
      ]);
      setPermissions(profile.data.permissions ?? []);
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
    void loadData(showArchived);
  }, [loadData, showArchived]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCampaignRequest(pendingDelete.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'Impossible de supprimer la campagne.',
      );
    } finally {
      setDeleting(false);
    }
  }

  const canWrite = canManageCampaigns(permissions);
  const canDelete = canDeleteCampaign(permissions);

  const columns = useMemo(
    () =>
      createCampaignsTableColumns(studioSession, {
        canDelete,
        onDelete: (campaign) => {
          setDeleteError(null);
          setPendingDelete(campaign);
        },
      }),
    [studioSession, canDelete],
  );

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

      {!showArchived ? (
        <AutoHallMetricGrid>
          <AutoHallMetricCard
            label="Total campagnes"
            value={loading ? '…' : campaigns.length}
          />
          <AutoHallMetricCard label="Actives" value={loading ? '…' : activeCount} />
          <AutoHallMetricCard label="Brouillons" value={loading ? '…' : draftCount} />
        </AutoHallMetricGrid>
      ) : null}

      {canWrite && !showArchived ? (
        <CreateCampaignPanel onCreated={() => void loadData(false)} />
      ) : null}

      <section className={ADMIN_CONTENT_PAD}>
        <AutoHallPanel
          title={showArchived ? 'Campagnes supprimées' : 'Liste des campagnes'}
          description={
            showArchived
              ? 'Campagnes archivées — leurs landing pages et données sont conservées.'
              : 'Tri, recherche et accès rapide aux landing pages de chaque campagne.'
          }
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived((v) => !v)}
              >
                <Archive className="size-4" />
                {showArchived ? 'Actives' : 'Supprimées'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadData(showArchived)}
                disabled={loading}
              >
                <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
                Actualiser
              </Button>
            </div>
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
              searchPlaceholder={
                showArchived
                  ? 'Rechercher une campagne supprimée…'
                  : 'Rechercher une campagne…'
              }
              pageSize={8}
              emptyMessage={
                showArchived
                  ? 'Aucune campagne supprimée.'
                  : 'Aucune campagne. Créez-en une pour démarrer.'
              }
            />
          )}
        </AutoHallPanel>
      </section>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette campagne ?</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Cette action est irréversible.
            </p>
            <p>
              Les landing pages, versions et exports associés seront archivés et ne seront plus accessibles depuis le Studio.
            </p>
            {pendingDelete ? (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-foreground">
                <span className="font-medium">{pendingDelete.name}</span>
                <span className="ml-2 text-muted-foreground">
                  — {pendingDelete.brand}
                  {pendingDelete.model ? ` · ${pendingDelete.model}` : ''}
                </span>
              </div>
            ) : null}
          </div>

          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingDelete(null);
                setDeleteError(null);
              }}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
