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

export async function listCampaigns(): Promise<CampaignsListResponse> {
  const response = await apiRequest<CampaignListItem[]>('/api/campaigns');
  return response as CampaignsListResponse;
}

export async function createCampaign(payload: CreateCampaignPayload) {
  return apiRequest<CampaignListItem>('/api/campaigns', {
    method: 'POST',
    body: payload,
  });
}

export function canManageCampaigns(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}
