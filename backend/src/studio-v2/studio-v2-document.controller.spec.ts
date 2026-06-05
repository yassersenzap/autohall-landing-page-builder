import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { StudioV2DocumentController } from './studio-v2-document.controller';
import { buildDefaultStudioV2Document } from './default-document';

describe('StudioV2DocumentController', () => {
  const pageVersionId = '11111111-1111-1111-1111-111111111111';

  const service = {
    getOrCreate: jest.fn(),
    upsert: jest.fn(),
  };

  const controller = new StudioV2DocumentController(service as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns wrapped studio v2 document', async () => {
    const documentJson = buildDefaultStudioV2Document();
    service.getOrCreate.mockResolvedValue({
      id: 'doc-1',
      pageVersionId,
      engine: 'puck',
      documentJson,
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    });

    const response = await controller.getDocument(pageVersionId);

    expect(service.getOrCreate).toHaveBeenCalledWith(pageVersionId);
    expect(response.success).toBe(true);
    expect(response.data.documentJson).toEqual(documentJson);
  });
});
