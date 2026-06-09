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

export type PublishPageVersionResult = {
  pageVersion: PageVersionListItem;
  landingPage: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  campaign: {
    id: string;
    name: string;
    brand: string;
  };
};

export async function publishPageVersion(pageVersionId: string) {
  return apiRequest<PublishPageVersionResult>(
    `/api/page-versions/${pageVersionId}/publish`,
    { method: 'POST' },
  );
}

export function canManagePageVersions(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}

export type PageVersionDetail = PageVersionListItem & {
  themeJson: unknown;
  updatedAt: string;
};

export async function fetchPageVersion(
  landingPageId: string,
  pageVersionId: string,
) {
  return apiRequest<PageVersionDetail>(
    `${pageVersionsBase(landingPageId)}/${pageVersionId}`,
  );
}

export async function updatePageVersion(
  landingPageId: string,
  pageVersionId: string,
  payload: { themeJson?: Record<string, unknown>; label?: string },
) {
  return apiRequest<PageVersionDetail>(
    `${pageVersionsBase(landingPageId)}/${pageVersionId}`,
    { method: 'PATCH', body: payload },
  );
}

/** Builder V3 — fetch version metadata + theme without preview/render pipeline. */
export async function fetchPageVersionById(pageVersionId: string) {
  return apiRequest<PageVersionDetail>(`/api/page-versions/${pageVersionId}`);
}

/** Builder V3 — persist theme/pageSettings via pageVersionId only. */
export async function updatePageVersionById(
  pageVersionId: string,
  payload: { themeJson?: Record<string, unknown>; label?: string },
) {
  return apiRequest<PageVersionDetail>(`/api/page-versions/${pageVersionId}`, {
    method: 'PATCH',
    body: payload,
  });
}
