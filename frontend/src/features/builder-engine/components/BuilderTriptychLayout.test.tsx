import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuilderEditorProvider } from '../context/BuilderEditorContext';
import { WorkspaceUiProvider } from '../context/WorkspaceUiContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { BuilderTriptychLayout } from './BuilderTriptychLayout';

vi.mock('./CanvasArea', () => ({
  CanvasArea: () => <main data-testid="canvas-area-mock">Canvas</main>,
}));

vi.mock('./left-panel/BuilderLeftPanel', () => ({
  BuilderLeftPanel: () => <aside data-testid="left-panel-mock">Left</aside>,
}));

vi.mock('./RightInspector', () => ({
  RightInspector: () => <aside data-testid="right-panel-mock">Right</aside>,
}));

function renderLayout() {
  return render(
    <BuilderEditorProvider canWrite pageVersionId="pv-1">
      <WorkspaceUiProvider>
        <BuilderTriptychLayout />
      </WorkspaceUiProvider>
    </BuilderEditorProvider>,
  );
}

describe('BuilderTriptychLayout panels', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('affiche les trois colonnes par défaut', () => {
    renderLayout();
    expect(screen.getByTestId('left-panel-mock')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-area-mock')).toBeInTheDocument();
    expect(screen.getByTestId('right-panel-mock')).toBeInTheDocument();
  });
});
