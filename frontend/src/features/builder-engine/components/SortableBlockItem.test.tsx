import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuilderEditorProvider } from '../context/BuilderEditorContext';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { SortableBlockItem } from './SortableBlockItem';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { 'data-testid': 'dnd-handle-attrs' },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
    isOver: false,
  }),
}));

vi.mock('./CanvasBlockRenderer', () => ({
  CanvasBlockRenderer: () => <div data-testid="canvas-block-preview">Preview</div>,
}));

const mockBlock: BuilderDocumentBlock = {
  id: 'block-hero-1',
  type: 'hero',
  label: 'Bloc Hero',
  sortOrder: 0,
  propsJson: { title: 'Test' },
};

function renderBlockItem(canWrite = true) {
  return render(
    <BuilderEditorProvider canWrite={canWrite}>
      <ul>
        <SortableBlockItem blockId={mockBlock.id} />
      </ul>
    </BuilderEditorProvider>,
  );
}

describe('SortableBlockItem hover interaction', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
    useBuilderDocumentStore.getState().setInitialBlocks([mockBlock]);
    useBuilderDocumentStore.getState().selectBlock(null);
  });

  it('met à jour hoveredBlockId au survol et le réinitialise à la sortie', async () => {
    const user = userEvent.setup();
    renderBlockItem();

    expect(useBuilderDocumentStore.getState().hoveredBlockId).toBeNull();
    expect(screen.queryByTestId('block-hover-toolbar')).not.toBeInTheDocument();

    await user.hover(screen.getByTestId('sortable-block-item'));
    expect(useBuilderDocumentStore.getState().hoveredBlockId).toBe('block-hero-1');

    await user.unhover(screen.getByTestId('sortable-block-item'));
    expect(useBuilderDocumentStore.getState().hoveredBlockId).toBeNull();
    expect(screen.queryByTestId('block-hover-toolbar')).not.toBeInTheDocument();
  });

  it('affiche le libellé et la barre d’outils au survol', async () => {
    const user = userEvent.setup();
    renderBlockItem();

    expect(screen.queryByTestId('block-hover-toolbar')).not.toBeInTheDocument();

    await user.hover(screen.getByTestId('sortable-block-item'));

    expect(screen.getByText('Bloc Hero')).toBeInTheDocument();
    expect(screen.getByTestId('block-hover-toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dupliquer/i })).toBeInTheDocument();
  });

  it('duplique le bloc via la barre d’outils', async () => {
    renderBlockItem();

    fireEvent.mouseEnter(screen.getByTestId('sortable-block-item'));
    fireEvent.click(screen.getByRole('button', { name: /dupliquer/i }));

    const blocks = useBuilderDocumentStore.getState().blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[1]?.type).toBe('hero');
    expect(blocks[1]?.propsJson).toEqual(mockBlock.propsJson);
  });

  it('applique data-selected et le badge de sélection', () => {
    renderBlockItem();
    act(() => {
      useBuilderDocumentStore.getState().selectBlock('block-hero-1');
    });

    const item = screen.getByTestId('sortable-block-item');
    expect(item).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('block-selected-badge')).toHaveTextContent('Bloc Hero');
  });

  it('supprime le bloc via la barre d’outils sans conserver la sélection', () => {
    renderBlockItem();
    act(() => {
      useBuilderDocumentStore.getState().selectBlock('block-hero-1');
    });

    fireEvent.mouseEnter(screen.getByTestId('sortable-block-item'));
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(0);
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBeNull();
    expect(screen.queryByTestId('sortable-block-item')).not.toBeInTheDocument();
  });
});
