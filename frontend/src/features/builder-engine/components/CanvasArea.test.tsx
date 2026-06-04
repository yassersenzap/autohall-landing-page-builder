import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { WorkspaceUiProvider } from '../context/WorkspaceUiContext';
import { CanvasArea } from './CanvasArea';

vi.mock('./SortableBlockItem', () => ({
  SortableBlockItem: ({ blockId }: { blockId: string }) => (
    <li data-testid={`sortable-${blockId}`}>
      <div data-testid="block-render-slot">{blockId}</div>
    </li>
  ),
}));

vi.mock('./LandingPreviewScope', () => ({
  LandingPreviewScope: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="landing-preview-scope">{children}</div>
  ),
}));

const heroBlock: BuilderDocumentBlock = {
  id: 'hero-1',
  type: 'hero',
  label: 'Bloc Hero',
  sortOrder: 0,
  propsJson: { title: 'Auto Hall' },
};

function renderCanvasArea() {
  return render(
    <WorkspaceUiProvider>
      <DndContext>
        <CanvasArea />
      </DndContext>
    </WorkspaceUiProvider>,
  );
}

describe('CanvasArea document chrome', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
    useBuilderDocumentStore.getState().setDeviceMode('desktop');
  });

  it('applique le chrome shadow canvas centré sur le document', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock]);
    renderCanvasArea();

    const document = screen.getByTestId('canvas-document');
    expect(document).toHaveClass('shadow-2xl');
    expect(document).toHaveClass('rounded-2xl');
    expect(document).toHaveClass('bg-canvas-paper');
    expect(document).toHaveClass('builder-canvas-device-document');
    expect(screen.getByTestId('canvas-zoom-controls')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-zoom-fit')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-zoom-1')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-zoom-label')).toBeInTheDocument();

    const stage = screen.getByTestId('canvas-document-stage');
    expect(stage).toHaveClass('mx-auto');
    expect(stage).toHaveClass('justify-center');
  });

  it('utilise un fond de workspace sombre profond', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([]);
    renderCanvasArea();

    expect(screen.getByTestId('canvas-scroll-surface')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: /canvas de la landing/i })).toHaveClass('bg-canvas');
  });

  it('ne montre plus la barre chrome "Document · 1152px"', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock]);
    renderCanvasArea();

    expect(screen.queryByText(/Document · 1152px/i)).not.toBeInTheDocument();
  });
});

describe('CanvasBlockRenderer pass-through', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('utilise un wrapper transparent sans max-width ni padding forcés', async () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      {
        id: 'hero-1',
        type: 'hero',
        label: 'Bloc Hero',
        sortOrder: 0,
        propsJson: { title: 'Test' },
      },
    ]);

    const { CanvasBlockRenderer } = await import('./CanvasBlockRenderer');
    render(<CanvasBlockRenderer blockId="hero-1" />);

    const wrapper = document.querySelector('.builder-canvas-block');
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveAttribute('data-block-type', 'hero');
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('min-w-full');
    expect(wrapper).not.toHaveClass('max-w-5xl');
    expect(wrapper).not.toHaveClass('px-6');
    expect(screen.queryByTestId('block-full-bleed')).not.toBeInTheDocument();
  });
});
