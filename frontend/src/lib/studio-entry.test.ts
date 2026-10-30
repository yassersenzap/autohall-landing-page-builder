import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchLatestStudioEntry } from './studio-entry';

vi.mock('./campaigns', () => ({
  listCampaigns: vi.fn(),
}));

vi.mock('./landing-pages', () => ({
  listLandingPages: vi.fn(),
}));

vi.mock('./page-versions', () => ({
  listPageVersions: vi.fn(),
}));

import { listCampaigns } from './campaigns';
import { listLandingPages } from './landing-pages';
import { listPageVersions } from './page-versions';

describe('fetchLatestStudioEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no campaigns exist', async () => {
    vi.mocked(listCampaigns).mockResolvedValue({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      message: 'ok',
    });

    await expect(fetchLatestStudioEntry()).resolves.toBeNull();
  });

  it('returns the latest page version from backend data', async () => {
    vi.mocked(listCampaigns).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'camp-1',
          name: 'Campagne démo',
          brand: 'Auto Hall',
          model: null,
          campaignType: 'PROMOTION',
          status: 'ACTIVE',
          startDate: null,
          endDate: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      message: 'ok',
    });

    vi.mocked(listLandingPages).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'lp-1',
          campaignId: 'camp-1',
          title: 'Landing démo',
          slug: 'demo-offre-printemps',
          status: 'DRAFT',
          lastExportedAt: null,
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      message: 'ok',
    });

    vi.mocked(listPageVersions).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'pv-1',
          landingPageId: 'lp-1',
          versionNumber: 1,
          label: 'Version initiale',
          status: 'DRAFT',
          createdAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      message: 'ok',
    });

    const entry = await fetchLatestStudioEntry();

    expect(entry).toMatchObject({
      pageVersionId: 'pv-1',
      campaignId: 'camp-1',
      campaignName: 'Campagne démo',
      landingPageId: 'lp-1',
      landingPageTitle: 'Landing démo',
      versionNumber: 1,
    });
    expect(entry?.label).toContain('v1');
  });
});
