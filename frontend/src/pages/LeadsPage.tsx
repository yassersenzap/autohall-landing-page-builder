import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { AutoHallEmptyState } from '@/components/admin/AutoHallEmptyState';
import { AutoHallPanel } from '@/components/admin/AutoHallPanel';
import { DASHBOARD01_CONTENT_PAD } from '@/components/admin/dashboard01-layout';
import LeadsFilters, {
  type LeadsFilterValues,
} from '../components/leads/LeadsFilters';
import LeadsTable from '../components/leads/LeadsTable';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import { listCampaigns, type CampaignListItem } from '../lib/campaigns';
import { listLandingPages, type LandingPageListItem } from '../lib/landing-pages';
import {
  canPurgeLeads,
  canViewLeads,
  getAssignableUsers,
  listLeadEvents,
  purgeAllLeads,
  type AssignableUser,
  type LeadEventListItem,
  type LeadsPagination,
} from '../lib/leads';
import { Button } from '@/ui-lab/ui/button';

function initialFilters(searchParams: URLSearchParams): LeadsFilterValues {
  return {
    search: '',
    status: '',
    campaignId: searchParams.get('campaignId') ?? '',
    landingPageId: '',
    priority: '',
    assignedToUserId: '',
    overdueOnly: searchParams.get('overdueOnly') === 'true',
  };
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startingFilters = useMemo(
    () => initialFilters(searchParams),
    [searchParams],
  );
  const [role, setRole] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadEventListItem[]>([]);
  const [pagination, setPagination] = useState<LeadsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageListItem[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [filters, setFilters] = useState<LeadsFilterValues>(startingFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LeadsFilterValues>(startingFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const loadLeads = useCallback(
    async (
      nextPage: number,
      nextFilters: LeadsFilterValues,
      currentRole: string | null,
    ) => {
      if (!currentRole || !canViewLeads(currentRole)) {
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const response = await listLeadEvents({
          page: nextPage,
          limit: 20,
          search: nextFilters.search || undefined,
          status: nextFilters.status || undefined,
          campaignId: nextFilters.campaignId || undefined,
          landingPageId: nextFilters.landingPageId || undefined,
          priority: nextFilters.priority || undefined,
          assignedToUserId: nextFilters.assignedToUserId || undefined,
          overdueOnly: nextFilters.overdueOnly || undefined,
        });
        setLeads(response.data);
        setPagination(response.pagination);
        setPage(response.pagination.page);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logoutClient();
          navigate('/login', { replace: true });
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setError('Vous n’avez pas accès à la consultation des leads.');
          return;
        }
        setLeads([]);
        setError(
          err instanceof ApiError
            ? err.message
            : 'Impossible de charger les leads.',
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const profile = await meRequest();
        if (cancelled) {
          return;
        }

        setRole(profile.data.role);

        if (!canViewLeads(profile.data.role)) {
          setLoading(false);
          return;
        }

        const [campaignsResponse, usersResponse] = await Promise.all([
          listCampaigns(),
          getAssignableUsers(),
        ]);
        if (!cancelled) {
          setCampaigns(campaignsResponse.data);
          setAssignableUsers(usersResponse.data);
        }

        await loadLeads(1, startingFilters, profile.data.role);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            logoutClient();
            navigate('/login', { replace: true });
            return;
          }
          setError('Impossible de charger la page leads.');
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadLeads, navigate, startingFilters]);

  useEffect(() => {
    if (!filters.campaignId) {
      setLandingPages([]);
      return;
    }

    let cancelled = false;

    async function loadLandingPages() {
      try {
        const response = await listLandingPages(filters.campaignId);
        if (!cancelled) {
          setLandingPages(response.data);
        }
      } catch {
        if (!cancelled) {
          setLandingPages([]);
        }
      }
    }

    void loadLandingPages();

    return () => {
      cancelled = true;
    };
  }, [filters.campaignId]);

  function handleApplyFilters() {
    setAppliedFilters(filters);
    void loadLeads(1, filters, role);
  }

  function handleRefresh() {
    void loadLeads(page, appliedFilters, role);
  }

  function handlePageChange(nextPage: number) {
    void loadLeads(nextPage, appliedFilters, role);
  }

  async function handlePurgeAllLeads() {
    const confirmed = window.confirm(
      'Supprimer TOUS les leads de test ? Cette action est irréversible.',
    );
    if (!confirmed) return;

    const confirmedAgain = window.confirm(
      'Dernière confirmation : toutes les soumissions leads seront définitivement effacées.',
    );
    if (!confirmedAgain) return;

    setPurging(true);
    setPurgeMessage(null);
    setError(null);

    try {
      const response = await purgeAllLeads();
      setPurgeMessage(
        `${response.data.deletedCount} lead(s) supprimé(s) avec succès.`,
      );
      await loadLeads(1, appliedFilters, role);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de purger les leads de test.',
      );
    } finally {
      setPurging(false);
    }
  }

  if (role && !canViewLeads(role)) {
    return (
      <section className={DASHBOARD01_CONTENT_PAD}>
        <AutoHallEmptyState
          title="Accès refusé"
          description="Votre rôle ne permet pas de consulter les leads."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Retour au tableau de bord</Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <>
      <p className={`${DASHBOARD01_CONTENT_PAD} -mt-2 text-sm text-muted-foreground`}>
        Soumissions issues des landing pages exportées et du formulaire public.
      </p>

      {error ? (
        <p
          className={`${DASHBOARD01_CONTENT_PAD} rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive`}
        >
          {error}
        </p>
      ) : null}

      {purgeMessage ? (
        <p
          className={`${DASHBOARD01_CONTENT_PAD} rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400`}
        >
          {purgeMessage}
        </p>
      ) : null}

      <section className={DASHBOARD01_CONTENT_PAD}>
        <AutoHallPanel title="Filtres" description="Affinez la liste des leads reçus.">
          <LeadsFilters
            values={filters}
            campaigns={campaigns}
            landingPages={landingPages}
            assignableUsers={assignableUsers}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onRefresh={handleRefresh}
            loading={loading}
          />
        </AutoHallPanel>
      </section>

      <section className={DASHBOARD01_CONTENT_PAD}>
        <AutoHallPanel
          title="Résultats"
          description="Liste paginée des soumissions correspondant aux filtres appliqués."
          contentClassName="min-w-0"
        >
          <LeadsTable
            leads={leads}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </AutoHallPanel>
      </section>

      {role && canPurgeLeads(role) ? (
        <section className={DASHBOARD01_CONTENT_PAD}>
          <AutoHallPanel
            title="Zone admin"
            description="Nettoyage avant livraison — supprime uniquement les leads, pas les campagnes ni les comptes."
            className="ah-admin-muted-zone"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={() => void handlePurgeAllLeads()}
              disabled={purging || loading}
            >
              {purging ? 'Purge en cours…' : 'Purger les leads de test'}
            </Button>
          </AutoHallPanel>
        </section>
      ) : null}
    </>
  );
}
