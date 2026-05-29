import { apiRequest } from './api';

export type LeadEventListItem = {
  id: string;
  campaignId: string;
  landingPageId: string;
  fullName: string;
  phone: string;
  email: string | null;
  brand: string | null;
  model: string | null;
  requestType: string;
  status: string;
  sourceUrl: string;
  createdAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

export type LeadsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LeadsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  campaignId?: string;
  landingPageId?: string;
};

export type LeadsListResponse = {
  success: true;
  data: LeadEventListItem[];
  pagination: LeadsPagination;
  message: string;
};

export const LEAD_STATUSES = [
  'RECEIVED',
  'CONTACTED',
  'QUALIFIED',
  'REJECTED',
  'ARCHIVED',
] as const;

export type LeadEventDetail = {
  id: string;
  campaignId: string;
  landingPageId: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  brand: string | null;
  model: string | null;
  requestType: string;
  message: string | null;
  internalComment: string | null;
  status: string;
  sourceUrl: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  campaignName: string;
  landingPageTitle: string;
  landingPageSlug: string;
};

export type LeadDetailResponse = {
  success: true;
  data: LeadEventDetail;
  message: string;
};

export type UpdateLeadStatusPayload = {
  status: string;
  internalComment?: string;
};

function buildQueryString(params: LeadsListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.campaignId) {
    searchParams.set('campaignId', params.campaignId);
  }
  if (params.landingPageId) {
    searchParams.set('landingPageId', params.landingPageId);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function listLeadEvents(
  params: LeadsListParams = {},
): Promise<LeadsListResponse> {
  const response = await apiRequest<LeadEventListItem[]>(
    `/api/lead-events${buildQueryString(params)}`,
  );
  return response as LeadsListResponse;
}

export function canViewLeads(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}

export async function getLeadEvent(id: string): Promise<LeadDetailResponse> {
  const response = await apiRequest<LeadEventDetail>(`/api/lead-events/${id}`);
  return response as LeadDetailResponse;
}

export async function updateLeadEventStatus(
  id: string,
  payload: UpdateLeadStatusPayload,
): Promise<LeadDetailResponse> {
  const response = await apiRequest<LeadEventDetail>(
    `/api/lead-events/${id}/status`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
  return response as LeadDetailResponse;
}
