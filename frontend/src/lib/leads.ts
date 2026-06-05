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
  priority: string;
  assignedToUserId: string | null;
  assignedToName: string | null;
  nextFollowUpAt: string | null;
  isFollowUpOverdue: boolean;
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
  priority?: string;
  assignedToUserId?: string;
  overdueOnly?: boolean;
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

export const LEAD_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Basse',
  NORMAL: 'Normale',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

export type LeadAssignee = {
  id: string;
  fullName: string;
  email: string;
} | null;

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
  priority: string;
  assignedToUserId: string | null;
  assignedTo: LeadAssignee;
  nextFollowUpAt: string | null;
  lastContactAt: string | null;
  isFollowUpOverdue: boolean;
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

export type UpdateLeadFollowUpPayload = {
  assignedToUserId?: string | null;
  priority?: string;
  nextFollowUpAt?: string | null;
};

export type AssignableUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type LeadStatusHistoryItem = {
  id: string;
  leadEventId: string;
  eventType: string;
  previousStatus: string;
  newStatus: string;
  internalComment: string | null;
  activityNote: string | null;
  changedAt: string;
  changedByUserId: string | null;
  changedByName: string | null;
};

export type LeadStatusHistoryResponse = {
  success: true;
  data: LeadStatusHistoryItem[];
  message: string;
};

export type AssignableUsersResponse = {
  success: true;
  data: AssignableUser[];
  message: string;
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
  if (params.priority) {
    searchParams.set('priority', params.priority);
  }
  if (params.assignedToUserId) {
    searchParams.set('assignedToUserId', params.assignedToUserId);
  }
  if (params.overdueOnly) {
    searchParams.set('overdueOnly', 'true');
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function formatLeadDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('fr-FR');
}

export function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
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

export function canPurgeLeads(role: string): boolean {
  return role === 'ADMIN';
}

export type PurgeLeadsResponse = {
  success: true;
  data: { deletedCount: number };
  message: string;
};

export async function purgeAllLeads(): Promise<PurgeLeadsResponse> {
  const response = await apiRequest<{ deletedCount: number }>(
    '/api/lead-events/purge-all',
    { method: 'DELETE' },
  );
  return response as PurgeLeadsResponse;
}

export async function getAssignableUsers(): Promise<AssignableUsersResponse> {
  const response = await apiRequest<AssignableUser[]>(
    '/api/lead-events/assignable-users',
  );
  return response as AssignableUsersResponse;
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

export async function updateLeadFollowUp(
  id: string,
  payload: UpdateLeadFollowUpPayload,
): Promise<LeadDetailResponse> {
  const response = await apiRequest<LeadEventDetail>(
    `/api/lead-events/${id}/follow-up`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
  return response as LeadDetailResponse;
}

export async function getLeadEventHistory(
  id: string,
): Promise<LeadStatusHistoryResponse> {
  const response = await apiRequest<LeadStatusHistoryItem[]>(
    `/api/lead-events/${id}/history`,
  );
  return response as LeadStatusHistoryResponse;
}
