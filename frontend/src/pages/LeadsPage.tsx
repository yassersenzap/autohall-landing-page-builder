import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LeadsFilters, {
  type LeadsFilterValues,
} from '../components/leads/LeadsFilters';
import LeadsTable from '../components/leads/LeadsTable';
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

const EMPTY_FILTERS: LeadsFilterValues = {
  search: '',
  status: '',
  campaignId: '',
  landingPageId: '',
  priority: '',
  assignedToUserId: '',
  overdueOnly: false,
};

export default function LeadsPage() {
  const navigate = useNavigate();
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
  const [filters, setFilters] = useState<LeadsFilterValues>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<LeadsFilterValues>(EMPTY_FILTERS);
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

        await loadLeads(1, EMPTY_FILTERS, profile.data.role);
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
      <main className="dashboard">
        <p className="dashboard__error">
          Accès refusé : votre rôle ne permet pas de consulter les leads.
        </p>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </main>
    );
  }

  return (
    <main className="dashboard leads-page">
      <header className="dashboard__header">
        <div>
          <h1>Leads reçus</h1>
          <p className="dashboard__subtitle">
            Consultation des soumissions issues des landing pages exportées
            (staging).
          </p>
        </div>
        <Link to="/dashboard" className="dashboard__link">
          Tableau de bord
        </Link>
      </header>

      {error ? <p className="dashboard__error">{error}</p> : null}

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

      <LeadsTable
        leads={leads}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
