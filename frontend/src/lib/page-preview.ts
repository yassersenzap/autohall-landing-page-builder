import { apiRequest } from './api';

export type PreviewCampaign = {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  campaignType: string;
  status: string;
};

export type PreviewLandingPage = {
  id: string;
  campaignId: string;
  title: string;
  slug: string;
  status: string;
  publicBaseUrl: string | null;
};

export type PreviewPageVersion = {
  id: string;
  landingPageId: string;
  versionNumber: number;
  label: string | null;
  status: string;
  themeJson: unknown;
  createdAt: string;
  updatedAt: string;
};

export type PreviewBlock = {
  id: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
};

export type PagePreviewData = {
  pageVersion: PreviewPageVersion;
  landingPage: PreviewLandingPage;
  campaign: PreviewCampaign;
  blocks: PreviewBlock[];
};

export async function fetchPagePreview(pageVersionId: string) {
  return apiRequest<PagePreviewData>(
    `/api/page-versions/${pageVersionId}/preview`,
  );
}

export function propsAsRecord(propsJson: unknown): Record<string, unknown> {
  if (propsJson && typeof propsJson === 'object' && !Array.isArray(propsJson)) {
    return propsJson as Record<string, unknown>;
  }
  return {};
}

export function propString(
  props: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}
