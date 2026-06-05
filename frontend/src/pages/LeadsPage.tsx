import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LeadsFilters, {
  type LeadsFilterValues,
} from '../components/leads/LeadsFilters';
import LeadsTable from '../components/leads/LeadsTable';
import { StudioPageHeader } from '@/components/studio/StudioPageHeader';
import { Card } from '../components/ui/Card';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import { listCampaigns, type CampaignListItem } from '../lib/campaigns';
import { listLandingPages, type LandingPageListItem } from '../lib/landing-pages';
import {
  canViewLeads,
  getAssignableUsers,
  listLeadEvents,
  type AssignableUser,
  type LeadEventListItem,
  type LeadsPagination,
} from '../lib/leads';

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
  }, [loadLeads, navigate]);

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

  if (role && !canViewLeads(role)) {
    return (
      <div className="ds-page-stack">
        <p className="ui-alert ui-alert--error">
          Accès refusé : votre rôle ne permet pas de consulter les leads.
        </p>
        <Link to="/dashboard" className="ui-link">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="ds-page-stack leads-page" data-page="leads">
      <StudioPageHeader
        title="Leads reçus"
        description="Soumissions issues des landing pages exportées et du formulaire public."
        backTo="/dashboard"
        backLabel="Tableau de bord"
      />

      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}

      <Card title="Filtres" padding="none" className="leads-filter-card">
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
      </Card>

      <Card padding="none" className="leads-results-card">
        <LeadsTable
          leads={leads}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
}
