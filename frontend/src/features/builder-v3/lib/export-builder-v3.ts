import { getAccessToken } from '@/lib/auth-storage';
import {
  assertNoBlobUrlsInDocument,
  BlobUrlValidationError,
} from '@/features/builder-engine/lib/blob-url-guard';
import {
  assertExportReady,
  ExportReadinessError,
} from '@/features/builder-engine/lib/export-readiness-guard';
import {
  forcePersistBuilderDocument,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import { stripStudioOnlyBlockProps } from '@/features/builder/block-variants/studio-block-metadata';
import { saveBuilderDocumentDesign } from './save-builder-v3';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

function exportUrl(pageVersionId: string): string {
  return `${API_BASE_URL}/api/page-versions/${pageVersionId}/studio-v3-export`;
}

function formatExportError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Export impossible.';
  const body = payload as { message?: string };
  return typeof body.message === 'string' && body.message.trim()
    ? body.message.trim()
    : 'Export impossible.';
}

/** Persiste le document V3 puis télécharge le ZIP généré côté serveur. */
export async function exportBuilderV3Zip(pageVersionId: string): Promise<void> {
  const state = useBuilderDocumentStore.getState();
  assertNoBlobUrlsInDocument({
    blocks: state.blocks,
    pageSettings: state.pageSettings,
  });
  assertExportReady({
    blocks: state.blocks,
    pageSettings: state.pageSettings,
  });

  forcePersistBuilderDocument();
  await saveBuilderDocumentDesign(pageVersionId);

  const freshState = useBuilderDocumentStore.getState();
  const token = getAccessToken();

  const response = await fetch(exportUrl(pageVersionId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      blocks: freshState.blocks.map((block) => ({
        ...block,
        propsJson: stripStudioOnlyBlockProps(block.propsJson),
      })),
      pageTheme: freshState.pageTheme,
      pageSettings: freshState.pageSettings,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatExportError(payload));
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `landing-v3-${pageVersionId}.zip`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export { BlobUrlValidationError, ExportReadinessError };
