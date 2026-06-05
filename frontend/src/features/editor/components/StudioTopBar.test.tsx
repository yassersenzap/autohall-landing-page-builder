import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StudioTopBar } from './StudioTopBar';

vi.mock('./EditorThemeToggle', () => ({
  EditorThemeToggle: () => null,
}));

function renderTopBar(props: ComponentProps<typeof StudioTopBar>) {
  return render(
    <MemoryRouter>
      <StudioTopBar {...props} />
    </MemoryRouter>,
  );
}

describe('StudioTopBar save status', () => {
  const baseProps = {
    versionLabel: 'v1',
    status: 'DRAFT',
    canWrite: true,
    publishing: false,
    exporting: false,
    deviceMode: 'desktop' as const,
    onPreview: vi.fn(),
    backTo: '/campaigns',
    backLabel: 'Campagnes',
    onDeviceModeChange: vi.fn(),
    onRefresh: vi.fn(),
    onPublish: vi.fn(),
    onExport: vi.fn(),
    onSave: vi.fn(),
  };

  it('shows compact dirty status', () => {
    renderTopBar({ ...baseProps, saveStatus: 'dirty' });
    const status = screen.getByTestId('builder-save-status');
    expect(status).toHaveAttribute('data-save-status', 'dirty');
    expect(status).toHaveTextContent(/Modifications non enregistrées/i);
  });

  it('shows saved status when clean', () => {
    renderTopBar({ ...baseProps, saveStatus: 'saved' });
    expect(screen.getByTestId('builder-save-status')).toHaveAttribute(
      'data-save-status',
      'saved',
    );
  });

  it('shows save and preview action when dirty', () => {
    renderTopBar({
      ...baseProps,
      saveStatus: 'dirty',
      onSaveAndPreview: vi.fn(),
    });
    expect(screen.getByRole('button', { name: /Enregistrer & aperçu/i })).toBeInTheDocument();
  });
});
