import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VisualStudioV2Page from './VisualStudioV2Page';
import { buildDefaultStudioV2Document } from '@/features/visual-studio-v2/default-document';

const fetchStudioV2Document = vi.fn();
const fetchStudioV2Readiness = vi.fn();

vi.mock('@/features/visual-studio-v2/api/studio-v2-document.api', () => ({
  fetchStudioV2Document: (...args: unknown[]) => fetchStudioV2Document(...args),
  saveStudioV2Document: vi.fn(),
}));

vi.mock('@/features/visual-studio-v2/api/studio-v2-preview.api', () => ({
  fetchStudioV2Readiness: (...args: unknown[]) => fetchStudioV2Readiness(...args),
  downloadStudioV2Export: vi.fn(),
}));

vi.mock('@/features/visual-studio-v2/hooks/useStudioV2Permissions', () => ({
  useStudioV2Permissions: () => ({ canWrite: true, loading: false, role: 'MARKETER' }),
}));

vi.mock('@/features/visual-studio-v2/VisualStudioV2Editor', () => ({
  VisualStudioV2Editor: () => <div data-testid="studio-v2-editor">Editor</div>,
}));

const pageVersionId = '11111111-1111-1111-1111-111111111111';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/page-versions/${pageVersionId}/studio-v2`]}>
      <Routes>
        <Route path="/page-versions/:pageVersionId/studio-v2" element={<VisualStudioV2Page />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VisualStudioV2Page', () => {
  beforeEach(() => {
    fetchStudioV2Document.mockReset();
    fetchStudioV2Readiness.mockReset();
    fetchStudioV2Readiness.mockResolvedValue({ issues: [], canExport: true });
  });

  it('shows loading then editor after successful document fetch', async () => {
    fetchStudioV2Document.mockResolvedValue({
      id: 'doc-1',
      pageVersionId,
      engine: 'puck',
      documentJson: buildDefaultStudioV2Document(),
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    });

    renderPage();

    expect(screen.getByText(/Chargement du document V2/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('studio-v2-editor')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Chargement du document V2/i)).not.toBeInTheDocument();
  });

  it('shows error screen when API fails', async () => {
    fetchStudioV2Document.mockRejectedValue(new Error('Backend indisponible'));

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/Impossible de charger le document Studio V2/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Backend indisponible')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réessayer/i })).toBeInTheDocument();
    expect(screen.queryByText(/Chargement du document V2/i)).not.toBeInTheDocument();
  });
});
