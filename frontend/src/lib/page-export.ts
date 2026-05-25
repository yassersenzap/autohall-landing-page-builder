import { ApiError } from './api';
import { getAccessToken } from './auth-storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const match = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
  return match?.[1]?.trim() ?? null;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadPageVersionExport(
  pageVersionId: string,
  fallbackFilename?: string,
): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/page-versions/${pageVersionId}/export`,
    { method: 'GET', headers },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    const message =
      payload?.message ?? `Export failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  const blob = await response.blob();
  const filename =
    parseFilename(response.headers.get('Content-Disposition')) ??
    fallbackFilename ??
    'landing-export.zip';

  triggerDownload(blob, filename);
}
