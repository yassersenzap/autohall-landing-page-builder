import { ApiError, apiRequest } from '@/lib/api';
import type { StudioV2DocumentRecord } from '../types';
import type { Data } from '@puckeditor/core';

const DEFAULT_LOAD_TIMEOUT_MS = 15_000;

function formatStudioV2LoadError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Session expirée. Reconnectez-vous puis réessayez.';
    }
    if (err.status === 404) {
      return 'Version de page introuvable ou endpoint Studio V2 indisponible.';
    }
    if (err.status >= 500) {
      return `${err.message} — vérifiez les logs backend (migration DB, table studio V2).`;
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Erreur réseau ou réponse invalide.';
}

export async function fetchStudioV2Document(
  pageVersionId: string,
  options?: { timeoutMs?: number },
): Promise<StudioV2DocumentRecord> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await apiRequest<StudioV2DocumentRecord>(
      `/api/page-versions/${pageVersionId}/studio-v2-document`,
      { signal: controller.signal },
    );
    return {
      ...response.data,
      documentJson: response.data.documentJson as Data,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `Délai dépassé (${timeoutMs / 1000}s). Vérifiez que le backend est démarré et accessible.`,
      );
    }
    throw new Error(formatStudioV2LoadError(err), { cause: err });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function saveStudioV2Document(
  pageVersionId: string,
  documentJson: Data,
  engine = 'puck',
): Promise<StudioV2DocumentRecord> {
  const response = await apiRequest<StudioV2DocumentRecord>(
    `/api/page-versions/${pageVersionId}/studio-v2-document`,
    {
      method: 'PUT',
      body: { documentJson, engine },
    },
  );
  return {
    ...response.data,
    documentJson: response.data.documentJson as Data,
  };
}
