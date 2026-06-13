import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { CanvasDocument } from './canvas/CanvasDocument';
import { LayersPanel } from './panels/LayersPanel';
import { StudioLayout } from './layout/StudioLayout';

vi.mock('@/features/builder-engine/hooks/use-page-assets', () => ({
  usePageAssets: () => ({
    assets: [],
    loading: false,
    uploading: false,
    error: null,
    reload: vi.fn(),
    upload: vi.fn(),
    setAssets: vi.fn(),
  }),
}));

vi.mock('./canvas/IframeCanvas', () => ({
  IframeCanvas: () => <div data-testid="iframe-canvas-mock" />,
}));

function renderWithDnd(ui: ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

function heroBlock(id: string, sortOrder = 0): BuilderDocumentBlock {
  return {
    id,
    type: 'hero_campaign',
    label: 'Hero campagne',
    sortOrder,
    propsJson: { title: 'Offre', buttonText: 'Essai' },
  };
}

function faqBlock(id: string, sortOrder = 1): BuilderDocumentBlock {
  return {
    id,
    type: 'faq',
    label: 'FAQ',
    sortOrder,
    propsJson: {
      heading: 'Questions',
      items: [{ question: 'Q?', answer: 'A.' }],
    },
  };
}

describe('Canvas editing layer V1', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('selects block from canvas and updates selectedBlockId', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);

    renderWithDnd(<CanvasDocument />);

    const shells = document.querySelectorAll('[data-canvas-block-id]');
    expect(shells.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(shells[1]!);
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('faq-1');
    expect(shells[1]?.getAttribute('data-canvas-block-selected')).toBe('true');
  });

  it('highlights canvas block when selecting from layers panel', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);

    render(<LayersPanel />);
    renderWithDnd(<CanvasDocument />);

    fireEvent.click(screen.getByTestId('studio-layer-select-faq-1'));

    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('faq-1');
    const selected = document.querySelector(
      '[data-studio-canvas-root] [data-canvas-block-id="faq-1"]',
    );
    expect(selected?.getAttribute('data-canvas-block-selected')).toBe('true');
  });

  it('move up/down changes block order', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);
    useBuilderDocumentStore.getState().selectBlock('faq-1');

    renderWithDnd(<CanvasDocument />);

    fireEvent.click(screen.getByTestId('canvas-toolbar-move-up'));

    const ids = useBuilderDocumentStore.getState().blocks.map((b) => b.id);
    expect(ids[0]).toBe('faq-1');
    expect(ids[1]).toBe('hero-1');
  });

  it('duplicate creates a new block with a new id', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    renderWithDnd(<CanvasDocument />);
    fireEvent.click(screen.getByTestId('canvas-toolbar-duplicate'));

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(2);
    expect(state.blocks[1]?.id).not.toBe('hero-1');
    expect(state.selectedBlockId).toBe(state.blocks[1]?.id);
  });

  it('delete removes selected block safely', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    renderWithDnd(<CanvasDocument />);
    fireEvent.click(screen.getByTestId('canvas-toolbar-delete'));

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(1);
    expect(state.blocks[0]?.id).toBe('faq-1');
    expect(state.selectedBlockId).toBeNull();
  });

  it('insert below adds block at correct index via toolbar menu', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    renderWithDnd(<CanvasDocument />);

    fireEvent.click(screen.getByTestId('canvas-toolbar-insert-below'));
    fireEvent.click(screen.getByTestId('canvas-insert-faq'));

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(2);
    expect(state.blocks[0]?.id).toBe('hero-1');
    expect(state.blocks[1]?.type).toBe('faq');
  });

  it('insert slot adds block at requested index', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);

    renderWithDnd(<CanvasDocument />);

    fireEvent.click(screen.getByTestId('canvas-insert-slot-trigger-1'));
    fireEvent.click(screen.getByTestId('canvas-insert-slot-core_campaign_form_landing-1'));

    const state = useBuilderDocumentStore.getState();
    expect(state.blocks).toHaveLength(3);
    expect(state.blocks[1]?.type).toBe('core_campaign_form_landing');
  });

  it('toolbar is studio-only and not part of block preview content', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    renderWithDnd(<CanvasDocument />);

    const toolbar = screen.getByTestId('canvas-block-toolbar');
    expect(toolbar).toHaveAttribute('data-studio-only', 'true');
    expect(document.querySelector('[data-studio-canvas-root]')).toBeTruthy();
  });

  it('marks themeDirty after structure changes', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    useBuilderDocumentStore.getState().duplicateBlock('hero-1');
    expect(useBuilderDocumentStore.getState().themeDirty).toBe(true);
  });

  it('layers panel exposes sortable list', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1'), faqBlock('faq-1')]);

    render(<LayersPanel />);

    expect(screen.getByTestId('studio-layers-sortable')).toBeInTheDocument();
    expect(screen.getByTestId('studio-layer-drag-hero-1')).toBeInTheDocument();
  });

  it('clears selection on escape and duplicates with ctrl+d', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().selectBlock('hero-1');

    renderWithDnd(<StudioLayout documentHydrated />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBeNull();

    useBuilderDocumentStore.getState().selectBlock('hero-1');
    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(2);
  });

  it('studio route shell still loads', () => {
    renderWithDnd(<StudioLayout documentHydrated />);
    expect(document.querySelector('[data-studio-shell]')).toBeInTheDocument();
    expect(screen.getByTestId('iframe-canvas-mock')).toBeInTheDocument();
  });
});
