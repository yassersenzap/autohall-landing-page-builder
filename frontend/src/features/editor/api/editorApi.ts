import { apiRequest } from '../../../lib/api';
import type {
  EditorCreateBlockPayload,
  EditorPageBlock,
  EditorUpdateBlockPayload,
} from '../types/editor.types';

function pageBlocksBase(pageVersionId: string): string {
  return `/api/page-versions/${pageVersionId}/blocks`;
}

type FetchEditorBlocksOptions = {
  cacheBust?: boolean;
};

export async function fetchEditorBlocks(
  pageVersionId: string,
  options: FetchEditorBlocksOptions = {},
) {
  const suffix = options.cacheBust ? `?_=${Date.now()}` : '';
  return apiRequest<EditorPageBlock[]>(`${pageBlocksBase(pageVersionId)}${suffix}`, {
    cache: 'no-store',
  });
}

export async function createEditorBlock(
  pageVersionId: string,
  payload: EditorCreateBlockPayload,
) {
  return apiRequest<EditorPageBlock>(pageBlocksBase(pageVersionId), {
    method: 'POST',
    body: payload,
  });
}

export async function updateEditorBlock(
  pageVersionId: string,
  blockId: string,
  payload: EditorUpdateBlockPayload,
) {
  return apiRequest<EditorPageBlock>(`${pageBlocksBase(pageVersionId)}/${blockId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEditorBlock(pageVersionId: string, blockId: string) {
  return apiRequest<{ id: string; deleted: boolean }>(
    `${pageBlocksBase(pageVersionId)}/${blockId}`,
    {
      method: 'DELETE',
    },
  );
}
