import { apiRequest, ApiError, type ApiSuccessResponse } from './api';
import { getAccessToken } from './auth-storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export type PageAsset = {
  id: string;
  landingPageId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicPath: string;
  url: string;
  createdAt: string;
};

export function assetFileApiPath(assetId: string): string {
  return `/api/assets/${assetId}/file`;
}

export function assetFileAbsoluteUrl(assetId: string): string {
  return `${API_BASE_URL}${assetFileApiPath(assetId)}`;
}

export async function listPageVersionAssets(
  pageVersionId: string,
): Promise<PageAsset[]> {
  const response = await apiRequest<PageAsset[]>(
    `/api/page-versions/${pageVersionId}/assets`,
  );
  return response.data;
}

export async function uploadPageVersionAsset(
  pageVersionId: string,
  file: File,
): Promise<PageAsset> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/page-versions/${pageVersionId}/assets`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<PageAsset>
    | { message?: string }
    | null;

  if (!response.ok) {
    const message =
      (payload && 'message' in payload && payload.message) ||
      `Upload failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload as { message?: string });
  }

  return (payload as ApiSuccessResponse<PageAsset>).data;
}

export async function deletePageAsset(assetId: string): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok && response.status !== 204) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      response.status,
      payload?.message ?? `Delete failed with status ${response.status}`,
      payload,
    );
  }
}
