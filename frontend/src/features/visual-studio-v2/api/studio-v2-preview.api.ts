import { apiRequest } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import type { ReadinessIssue } from '../lib/readiness';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export function studioV2PreviewUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v2-preview`;
}

export function studioV2ExportUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v2-export`;
}

export function studioV2ReadinessUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v2-readiness`;
}

export async function fetchStudioV2PreviewHtml(pageVersionId: string): Promise<string> {
  const token = getAccessToken();
  const response = await fetch(studioV2PreviewUrl(pageVersionId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Preview failed with status ${response.status}`);
  }

  return response.text();
}

export type StudioV2ReadinessResult = {
  issues: ReadinessIssue[];
  canExport: boolean;
};

export async function fetchStudioV2Readiness(
  pageVersionId: string,
): Promise<StudioV2ReadinessResult> {
  const response = await apiRequest<StudioV2ReadinessResult>(
    `/api/page-versions/${pageVersionId}/studio-v2-readiness`,
  );
  return response.data;
}

function formatStudioV2ExportError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Export impossible.';
  }

  const body = payload as {
    message?: string;
    issues?: Array<{ level?: string; message?: string }>;
  };

  const base =
    typeof body.message === 'string' && body.message.trim()
      ? body.message.trim()
      : 'Export impossible.';

  const critical = Array.isArray(body.issues)
    ? body.issues.find((issue) => issue.level === 'critical')
    : undefined;

  if (critical?.message) {
    return `${base} ${critical.message}`;
  }

  return base;
}

export async function downloadStudioV2Export(pageVersionId: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(studioV2ExportUrl(pageVersionId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatStudioV2ExportError(payload));
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `landing-v2-${pageVersionId}.zip`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
