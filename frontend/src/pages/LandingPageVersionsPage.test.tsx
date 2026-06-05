import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LandingPageVersionsPage from './LandingPageVersionsPage';

const listPageVersions = vi.fn();
const meRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {
    status = 500;
  },
  logoutClient: vi.fn(),
  meRequest: (...args: unknown[]) => meRequest(...args),
}));

vi.mock('@/lib/page-versions', () => ({
  canManagePageVersions: () => true,
  createPageVersion: vi.fn(),
  listPageVersions: (...args: unknown[]) => listPageVersions(...args),
  publishPageVersion: vi.fn(),
}));

vi.mock('@/features/visual-studio-v2/api/studio-v2-preview.api', () => ({
  downloadStudioV2Export: vi.fn(),
}));

const landingPageId = '33333333-3333-3333-3333-333333333333';
const versionId = '44444444-4444-4444-4444-444444444444';

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: `/landing-pages/${landingPageId}/versions`,
          state: { landingPageTitle: 'Promo Ford', campaignId: 'c1', campaignName: 'Ford' },
        },
      ]}
    >
      <Routes>
        <Route path="/landing-pages/:landingPageId/versions" element={<LandingPageVersionsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LandingPageVersionsPage', () => {
  beforeEach(() => {
    meRequest.mockResolvedValue({ data: { role: 'MARKETER' } });
    listPageVersions.mockResolvedValue({
      data: [
        {
          id: versionId,
          landingPageId,
          versionNumber: 1,
          label: 'Initiale',
          status: 'DRAFT',
          createdAt: '2026-06-02T10:00:00.000Z',
        },
      ],
    });
  });

  it('shows Ouvrir le Studio as the primary production action', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /Ouvrir le Studio/i }).length).toBeGreaterThan(0);
    });

    const links = screen.getAllByRole('link', { name: /Ouvrir le Studio/i });
    expect(links[0]).toHaveAttribute('href', `/page-versions/${versionId}/studio`);
  });
});
