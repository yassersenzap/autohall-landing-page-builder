import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { StudioV2ExportService } from './studio-v2-export.service';
import { buildDefaultStudioV2Document } from '../studio-v2/default-document';

describe('StudioV2ExportService', () => {
  const pageVersionId = '11111111-1111-1111-1111-111111111111';

  const prisma = {
    pageVersion: { findUnique: jest.fn() },
  };
  const configService = { get: jest.fn() };
  const assetRenderService = {
    buildAssetMapForPuckDocument: jest.fn(),
  };
  const studioV2DocumentService = {
    getOrCreate: jest.fn(),
  };

  const service = new StudioV2ExportService(
    prisma as never,
    configService as never,
    assetRenderService as never,
    studioV2DocumentService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue('https://api.autohall.ma');
    prisma.pageVersion.findUnique.mockResolvedValue({
      id: pageVersionId,
      versionNumber: 1,
      landingPage: {
        id: 'lp-1',
        slug: 'ford-promo',
        title: 'Ford Promo',
        campaignId: 'camp-1',
        campaign: { name: 'Ford' },
      },
    });
    studioV2DocumentService.getOrCreate.mockResolvedValue({
      documentJson: buildDefaultStudioV2Document(),
    });
    assetRenderService.buildAssetMapForPuckDocument.mockResolvedValue({});
  });

  it('blocks export when document has no form', async () => {
    studioV2DocumentService.getOrCreate.mockResolvedValue({
      documentJson: { root: { props: {} }, content: [] },
    });

    await expect(service.exportZip(pageVersionId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('builds zip with lead-form.js for valid document', async () => {
    const result = await service.exportZip(pageVersionId);

    expect(result.filename).toContain('-v2.zip');
    expect(result.mimeType).toBe('application/zip');
    expect(result.buffer.length).toBeGreaterThan(100);
  });
});
