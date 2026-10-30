import { apiRequest } from './api';

export type CampaignListItem = {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  campaignType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type CampaignsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CampaignsListResponse = {
  success: true;
  data: CampaignListItem[];
  pagination: CampaignsPagination;
  message: string;
};

export type CreateCampaignPayload = {
  name: string;
  brand: string;
  campaignType: string;
  model?: string;
  description?: string;
};

export async function listCampaigns(options?: {
  archived?: boolean;
}): Promise<CampaignsListResponse> {
  const params = new URLSearchParams();
  if (options?.archived) params.set('archived', 'true');
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  const response = await apiRequest<CampaignListItem[]>(`/api/campaigns${qs}`);
  return response as CampaignsListResponse;
}

export async function createCampaign(payload: CreateCampaignPayload) {
  return apiRequest<CampaignListItem>('/api/campaigns', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteCampaignRequest(id: string) {
  return apiRequest<{ id: string; deletedAt: string | null }>(`/api/campaigns/${id}`, {
    method: 'DELETE',
  });
}

export function canManageCampaigns(permissions: string[]): boolean {
  return permissions.includes('MANAGE_CAMPAIGNS');
}

export function canDeleteCampaign(permissions: string[]): boolean {
  return permissions.includes('DELETE_CAMPAIGN');
}
