import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {},
  meRequest: vi.fn().mockResolvedValue({
    data: { id: 'u1', email: 'a@b.c', fullName: 'Test User', role: 'MARKETER' },
  }),
}));

vi.mock('@/lib/lead-dashboard', () => ({
  getLeadDashboardKpis: vi.fn().mockResolvedValue({
    data: {
      totalLeads: 0,
      contactedRatePercent: 0,
      overdueFollowUps: 0,
      byStatus: [],
      recentLeads: [],
    },
  }),
}));

vi.mock('@/components/dashboard/DashboardLeadPerformance', () => ({
  DashboardLeadPerformance: () => <div data-testid="lead-metrics" />,
}));

const useStudioEntryMock = vi.fn();

vi.mock('@/hooks/useStudioEntry', () => ({
  useStudioEntry: () => useStudioEntryMock(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    useStudioEntryMock.mockReturnValue({
      session: null,
      loading: false,
      source: null,
    });
  });

  it('shows primary CTA Ouvrir le Studio when a session exists', async () => {
    const pageVersionId = '22222222-2222-2222-2222-222222222222';
    useStudioEntryMock.mockReturnValue({
      session: {
        pageVersionId,
        versionNumber: 2,
        label: 'v2 — Promo',
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      source: 'local',
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const studioLink = await screen.findByRole('link', { name: /Ouvrir le Studio/i });
    expect(studioLink).toHaveAttribute('href', `/page-versions/${pageVersionId}/studio`);
  });

  it('resolves Studio entry from backend when local session is absent', async () => {
    const pageVersionId = '33333333-3333-3333-3333-333333333333';
    useStudioEntryMock.mockReturnValue({
      session: {
        pageVersionId,
        versionNumber: 1,
        label: 'v1 — Version initiale',
        campaignName: 'Campagne démo',
        landingPageTitle: 'Landing démo',
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      source: 'api',
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Ouvrir le Studio/i })).toHaveAttribute(
        'href',
        `/page-versions/${pageVersionId}/studio`,
      );
    });
  });

  it('does not expose legacy product labels in the UI', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Pilotez les campagnes/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/\bV1\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bV2\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Puck/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/blocks/i)).not.toBeInTheDocument();
  });
});
