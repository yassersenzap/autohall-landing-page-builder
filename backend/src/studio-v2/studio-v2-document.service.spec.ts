import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { StudioV2DocumentService } from './studio-v2-document.service';
import { buildDefaultStudioV2Document } from './default-document';

describe('StudioV2DocumentService', () => {
  const pageVersionId = '11111111-1111-1111-1111-111111111111';

  const prisma = {
    pageVersion: {
      findUnique: jest.fn(),
    },
    pageVersionStudioDocument: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const service = new StudioV2DocumentService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.pageVersion.findUnique.mockResolvedValue({ id: pageVersionId });
  });

  it('creates default document when none exists', async () => {
    prisma.pageVersionStudioDocument.findUnique.mockResolvedValue(null);
    prisma.pageVersionStudioDocument.create.mockResolvedValue({
      id: 'doc-1',
      pageVersionId,
      engine: 'puck',
      documentJson: buildDefaultStudioV2Document(),
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
      updatedAt: new Date('2026-06-02T10:00:00.000Z'),
    });

    const result = await service.getOrCreate(pageVersionId);

    expect(result.pageVersionId).toBe(pageVersionId);
    expect(result.engine).toBe('puck');
    expect(prisma.pageVersionStudioDocument.create).toHaveBeenCalled();
  });

  it('returns existing document', async () => {
    prisma.pageVersionStudioDocument.findUnique.mockResolvedValue({
      id: 'doc-2',
      pageVersionId,
      engine: 'puck',
      documentJson: { root: { props: {} }, content: [] },
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
      updatedAt: new Date('2026-06-02T10:00:00.000Z'),
    });

    const result = await service.getOrCreate(pageVersionId);

    expect(result.id).toBe('doc-2');
    expect(prisma.pageVersionStudioDocument.create).not.toHaveBeenCalled();
  });

  it('throws when page version is missing', async () => {
    prisma.pageVersion.findUnique.mockResolvedValue(null);

    await expect(service.getOrCreate(pageVersionId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects invalid documentJson on upsert', async () => {
    await expect(
      service.upsert(pageVersionId, { documentJson: { invalid: true } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upserts valid puck document', async () => {
    const documentJson = buildDefaultStudioV2Document();
    prisma.pageVersionStudioDocument.upsert.mockResolvedValue({
      id: 'doc-3',
      pageVersionId,
      engine: 'puck',
      documentJson,
      createdAt: new Date('2026-06-02T10:00:00.000Z'),
      updatedAt: new Date('2026-06-02T11:00:00.000Z'),
    });

    const result = await service.upsert(pageVersionId, { documentJson });

    expect(result.id).toBe('doc-3');
    expect(prisma.pageVersionStudioDocument.upsert).toHaveBeenCalled();
  });
});
