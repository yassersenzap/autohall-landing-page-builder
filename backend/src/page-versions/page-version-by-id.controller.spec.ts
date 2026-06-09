import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { PageVersionByIdController } from './page-version-by-id.controller';

describe('PageVersionByIdController', () => {
  const pageVersionId = '11111111-1111-1111-1111-111111111111';

  const service = {
    findOneById: jest.fn(),
    updateById: jest.fn(),
  };

  const controller = new PageVersionByIdController(service as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns page version detail including themeJson', async () => {
    service.findOneById.mockResolvedValue({
      id: pageVersionId,
      landingPageId: 'lp-1',
      versionNumber: 1,
      label: null,
      status: 'DRAFT',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
      themeJson: { page: { theme: { primaryColor: '#b91c1c' } } },
      createdBy: { id: 'user-1', fullName: 'Test User' },
    });

    const response = await controller.findOne(pageVersionId);

    expect(service.findOneById).toHaveBeenCalledWith(pageVersionId);
    expect(response.success).toBe(true);
    expect(response.data.themeJson).toEqual({
      page: { theme: { primaryColor: '#b91c1c' } },
    });
  });

  it('PATCH updates themeJson by pageVersionId', async () => {
    const themeJson = { page: { seo: { title: 'Campagne' } } };
    service.updateById.mockResolvedValue({
      id: pageVersionId,
      landingPageId: 'lp-1',
      versionNumber: 1,
      label: null,
      status: 'DRAFT',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
      themeJson,
      createdBy: { id: 'user-1', fullName: 'Test User' },
    });

    const response = await controller.update(pageVersionId, { themeJson });

    expect(service.updateById).toHaveBeenCalledWith(pageVersionId, {
      themeJson,
    });
    expect(response.data.themeJson).toEqual(themeJson);
  });
});
