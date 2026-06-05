import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeadsTable from './LeadsTable';
import type { LeadEventListItem } from '@/lib/leads';

const longUrl =
  'https://campaigns.autohall.local/landing-pages/promo-ford-ranger-summer-edition-2026?utm_source=facebook&utm_medium=cpc';

const lead: LeadEventListItem = {
  id: 'lead-1',
  campaignId: 'camp-1',
  landingPageId: 'lp-1',
  createdAt: '2026-06-02T10:00:00.000Z',
  fullName: 'Jean Dupont',
  phone: '+212600000000',
  email: 'jean@example.com',
  requestType: 'QUOTE',
  campaignName: 'Ford Promo',
  brand: 'Ford',
  model: 'Ranger',
  landingPageTitle: 'Promo été',
  landingPageSlug: 'promo-ete',
  priority: 'NORMAL',
  assignedToUserId: null,
  assignedToName: null,
  nextFollowUpAt: null,
  isFollowUpOverdue: false,
  status: 'NEW',
  sourceUrl: longUrl,
};

describe('LeadsTable', () => {
  it('truncates long source URLs in the table cell', () => {
    render(
      <MemoryRouter>
        <LeadsTable
          leads={[lead]}
          pagination={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
          loading={false}
          onPageChange={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText(longUrl)).not.toBeInTheDocument();
    const cell = screen.getByTitle(longUrl);
    expect(cell.textContent?.endsWith('…')).toBe(true);
    expect((cell.textContent?.length ?? 0)).toBeLessThanOrEqual(42);
  });
});
