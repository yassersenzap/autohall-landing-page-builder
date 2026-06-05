import { getAccessToken } from './auth-storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

function studioExportUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v2-export`;
}

function formatExportError(payload: unknown): string {
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

/** Télécharge le ZIP landing généré par le backend. */
export async function downloadLandingExport(pageVersionId: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(studioExportUrl(pageVersionId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatExportError(payload));
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `landing-${pageVersionId}.zip`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
