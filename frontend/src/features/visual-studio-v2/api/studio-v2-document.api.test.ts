import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDefaultStudioV2Document } from '../default-document';
import { fetchStudioV2Document, saveStudioV2Document } from './studio-v2-document.api';

const apiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

describe('studio-v2-document.api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('loads studio v2 document from API', async () => {
    const documentJson = buildDefaultStudioV2Document();
    apiRequest.mockResolvedValue({
      data: {
        id: 'doc-1',
        pageVersionId: 'pv-1',
        engine: 'puck',
        documentJson,
        createdAt: '2026-06-02T10:00:00.000Z',
        updatedAt: '2026-06-02T10:00:00.000Z',
      },
    });

    const record = await fetchStudioV2Document('pv-1');

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/page-versions/pv-1/studio-v2-document',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(record.documentJson.content?.[0]?.type).toBe('Section');
  });

  it('saves studio v2 document via PUT', async () => {
    const documentJson = buildDefaultStudioV2Document();
    apiRequest.mockResolvedValue({
      data: {
        id: 'doc-1',
        pageVersionId: 'pv-1',
        engine: 'puck',
        documentJson,
        createdAt: '2026-06-02T10:00:00.000Z',
        updatedAt: '2026-06-02T11:00:00.000Z',
      },
    });

    const saved = await saveStudioV2Document('pv-1', documentJson);

    expect(apiRequest).toHaveBeenCalledWith('/api/page-versions/pv-1/studio-v2-document', {
      method: 'PUT',
      body: { documentJson, engine: 'puck' },
    });
    expect(saved.engine).toBe('puck');
  });
});
