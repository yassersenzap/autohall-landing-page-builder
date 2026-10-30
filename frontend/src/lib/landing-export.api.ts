import { getAccessToken } from './auth-storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

function studioExportUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v2-export`;
}

function formatExportError(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') {
    return status === 401
      ? 'Session expirée. Reconnectez-vous pour exporter.'
      : 'Export impossible.';
  }

  const body = payload as {
    message?: string | string[];
    issues?: Array<{ level?: string; message?: string }>;
  };

  if (Array.isArray(body.message) && body.message.length > 0) {
    return body.message.join(' ');
  }

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

function triggerZipDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Télécharge le ZIP landing généré par le backend. */
export async function downloadLandingExport(pageVersionId: string): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(studioExportUrl(pageVersionId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatExportError(payload, response.status));
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error('Le serveur a renvoyé un fichier ZIP vide.');
  }
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `landing-${pageVersionId}.zip`;
  triggerZipDownload(blob, filename);
}
