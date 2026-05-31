import type { CSSProperties } from 'react';
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

export type PreviewRenderBlock = {
  id: string;
  html: string;
};

export type PagePreviewRender = {
  themeMode: 'light' | 'dark';
  themeStyle: string;
  headerHtml: string;
  blocksHtml: PreviewRenderBlock[];
  footerHtml: string;
  mainHtml: string;
};

export type PagePreviewData = {
  pageVersion: PreviewPageVersion;
  landingPage: PreviewLandingPage;
  campaign: PreviewCampaign;
  blocks: PreviewBlock[];
  render: PagePreviewRender;
};

/** Converts inline CSS variables from the API into a React style object. */
export function landingThemeStyleToReact(cssVariables: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const chunk of cssVariables.split(';')) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (key) style[key] = value;
  }
  return style;
}

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
