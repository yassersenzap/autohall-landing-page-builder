import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { STUDIO_SESSION_STORAGE_KEY } from '@/lib/studio-session';

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {},
  meRequest: vi.fn().mockResolvedValue({
    data: { id: 'u1', email: 'a@b.c', fullName: 'Test User', role: 'MARKETER' },
  }),
}));

vi.mock('@/lib/lead-dashboard', () => ({
  getLeadDashboardKpis: vi.fn(),
}));

vi.mock('@/components/dashboard/DashboardLeadPerformance', () => ({
  DashboardLeadPerformance: () => <div data-testid="lead-metrics" />,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows primary CTA Ouvrir le Studio when a session exists', async () => {
    const pageVersionId = '22222222-2222-2222-2222-222222222222';
    localStorage.setItem(
      STUDIO_SESSION_STORAGE_KEY,
      JSON.stringify({
        pageVersionId,
        versionNumber: 2,
        label: 'v2 — Promo',
        updatedAt: new Date().toISOString(),
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Production en cours/i)).toBeInTheDocument();
    });

    const studioLink = screen.getByRole('link', { name: /^Studio$/i });
    expect(studioLink).toHaveAttribute('href', `/page-versions/${pageVersionId}/studio`);
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
