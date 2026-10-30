import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createCampaignsTableColumns } from './campaigns-table-columns';
import type { CampaignListItem } from '@/lib/campaigns';
import type { StudioSession } from '@/lib/studio-session';

const campaign: CampaignListItem = {
  id: 'camp-1',
  name: 'Ford Promo',
  campaignType: 'PROMO',
  brand: 'Ford',
  model: 'Ranger',
  status: 'ACTIVE',
  startDate: null,
  endDate: null,
  createdAt: '2026-06-01T10:00:00.000Z',
};

const session: StudioSession = {
  pageVersionId: '55555555-5555-5555-5555-555555555555',
  campaignId: 'camp-1',
  campaignName: 'Ford Promo',
  versionNumber: 1,
  label: 'v1',
  updatedAt: '2026-06-02T10:00:00.000Z',
};

function renderActionsCell(studioSession: StudioSession | null) {
  const columns = createCampaignsTableColumns(studioSession);
  const actionsCol = columns.find((c) => c.id === 'actions');
  const Cell = actionsCol?.cell;
  if (!Cell || typeof Cell !== 'function') throw new Error('actions column missing');

  return render(
    <MemoryRouter>
      {Cell({
        row: { original: campaign },
      } as never)}
    </MemoryRouter>,
  );
}

describe('campaigns-table-columns', () => {
  it('shows Studio quick action when session matches campaign', () => {
    renderActionsCell(session);
    expect(screen.getByRole('link', { name: /Studio/i })).toHaveAttribute(
      'href',
      `/page-versions/${session.pageVersionId}/studio`,
    );
  });

  it('hides Studio quick action without matching session', () => {
    renderActionsCell(null);
    expect(screen.queryByRole('link', { name: /^Studio$/i })).not.toBeInTheDocument();
  });
});
