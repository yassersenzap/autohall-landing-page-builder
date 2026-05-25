import { apiRequest } from './api';

export type PageVersionListItem = {
  id: string;
  landingPageId: string;
  versionNumber: number;
  label: string | null;
  status: string;
  createdAt: string;
};

export type PageVersionsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PageVersionsListResponse = {
  success: true;
  data: PageVersionListItem[];
  pagination: PageVersionsPagination;
  message: string;
};

export type CreatePageVersionPayload = {
  label?: string;
};

function pageVersionsBase(landingPageId: string): string {
  return `/api/landing-pages/${landingPageId}/versions`;
}

export async function listPageVersions(
  landingPageId: string,
): Promise<PageVersionsListResponse> {
  const response = await apiRequest<PageVersionListItem[]>(
    pageVersionsBase(landingPageId),
  );
  return response as PageVersionsListResponse;
}

export async function createPageVersion(
  landingPageId: string,
  payload: CreatePageVersionPayload,
) {
  return apiRequest<PageVersionListItem>(pageVersionsBase(landingPageId), {
    method: 'POST',
    body: payload,
  });
}

export function canManagePageVersions(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}
