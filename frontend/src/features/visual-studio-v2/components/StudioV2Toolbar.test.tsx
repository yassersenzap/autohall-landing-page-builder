import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { StudioV2Toolbar } from './StudioV2Toolbar';

describe('StudioV2Toolbar', () => {
  it('uses official product labels without V1/V2 wording', () => {
    render(
      <MemoryRouter>
        <StudioV2Toolbar
          backTo="/landing-pages/lp-1/versions"
          backLabel="Versions"
          pageTitle="Offre printemps"
          versionLabel="v1"
          saveStatus="saved"
          canWrite
          viewport="desktop"
          zoom="fit"
          onViewportChange={vi.fn()}
          onZoomChange={vi.fn()}
          onSave={vi.fn()}
          onPreview={vi.fn()}
          onExport={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Auto Hall Landing Studio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aperçu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export ZIP/i })).toBeInTheDocument();
    expect(screen.queryByText(/V2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Builder V1/i)).not.toBeInTheDocument();
  });
});
