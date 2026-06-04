import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BuilderWorkspaceControls } from './BuilderWorkspaceControls';
import { WorkspaceUiProvider } from '../context/WorkspaceUiContext';

function renderControls() {
  return render(
    <WorkspaceUiProvider>
      <BuilderWorkspaceControls />
    </WorkspaceUiProvider>,
  );
}

describe('BuilderWorkspaceControls', () => {
  it('affiche les boutons panneaux et focus', () => {
    renderControls();
    expect(screen.getByTestId('builder-workspace-controls')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-right-panel')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-focus-mode')).toBeInTheDocument();
  });

  it('active le focus mode au clic', () => {
    renderControls();
    fireEvent.click(screen.getByTestId('toggle-focus-mode'));
    expect(screen.getByTestId('toggle-focus-mode')).toHaveAttribute('aria-pressed', 'true');
  });
});
