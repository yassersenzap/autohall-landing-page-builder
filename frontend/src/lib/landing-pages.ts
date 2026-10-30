import { apiRequest } from './api';

export type LandingPageListItem = {
  id: string;
  campaignId: string;
  title: string;
  slug: string;
  status: string;
  lastExportedAt: string | null;
  createdAt: string;
};

export type LandingPagesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LandingPagesListResponse = {
  success: true;
  data: LandingPageListItem[];
  pagination: LandingPagesPagination;
  message: string;
};

export type CreateLandingPagePayload = {
  title: string;
  slug: string;
  publicBaseUrl?: string;
};

function landingPagesBase(campaignId: string): string {
  return `/api/campaigns/${campaignId}/landing-pages`;
}

export async function listLandingPages(
  campaignId: string,
): Promise<LandingPagesListResponse> {
  const response = await apiRequest<LandingPageListItem[]>(
    landingPagesBase(campaignId),
  );
  return response as LandingPagesListResponse;
}

export async function createLandingPage(
  campaignId: string,
  payload: CreateLandingPagePayload,
) {
  return apiRequest<LandingPageListItem>(landingPagesBase(campaignId), {
    method: 'POST',
    body: payload,
  });
}

export function canManageLandingPages(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}
