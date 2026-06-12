import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { LeftSidebar } from './panels/LeftSidebar';
import { LayersPanel } from './panels/LayersPanel';
import { BlockInspectorPanel } from './panels/BlockInspectorPanel';
import { STUDIO_SIDEBAR_MODES } from './layout/studio-sidebar-modes';

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

function campaignBlock(id: string, sortOrder = 0): BuilderDocumentBlock {
  return {
    id,
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Test',
      formTitle: 'Contact',
      formCtaLabel: 'Continuer',
    },
  };
}

function heroOfferBlock(id: string, sortOrder = 1): BuilderDocumentBlock {
  return {
    id,
    type: 'hero_vehicle_offer',
    label: 'Hero offre',
    sortOrder,
    propsJson: {
      brandId: 'ford',
      modelName: 'Ranger',
      headline: 'Test',
      primaryCtaLabel: 'Essai',
    },
  };
}

function renderWithDnd(ui: ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe('Studio shell foundation', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('renders all sidebar modes', () => {
    renderWithDnd(<LeftSidebar />);

    expect(screen.getByTestId('studio-sidebar-modes')).toBeInTheDocument();
    for (const mode of STUDIO_SIDEBAR_MODES) {
      expect(screen.getByTestId(`studio-sidebar-mode-${mode.id}`)).toBeInTheDocument();
    }
  });

  it('lists blocks in layers panel', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      campaignBlock('clh-1'),
      heroOfferBlock('hvo-1'),
    ]);

    render(<LayersPanel />);

    expect(screen.getByTestId('studio-layers-panel')).toBeInTheDocument();
    expect(screen.getByTestId('studio-layer-item-clh-1')).toBeInTheDocument();
    expect(screen.getByTestId('studio-layer-item-hvo-1')).toBeInTheDocument();
  });

  it('selects block when clicking a layer', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      campaignBlock('clh-1'),
      heroOfferBlock('hvo-1'),
    ]);

    render(<LayersPanel />);
    fireEvent.click(screen.getByTestId('studio-layer-select-hvo-1'));

    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('hvo-1');
  });

  it('renders inspector tabs including layout and media', () => {
    const block = campaignBlock('clh-1');
    useBuilderDocumentStore.getState().setInitialBlocks([block]);
    useBuilderDocumentStore.getState().selectBlock('clh-1');

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onDelete={vi.fn()}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    expect(screen.getByTestId('block-inspector-tabs')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Contenu' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Layout' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Media' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Avancé' })).toBeInTheDocument();
    expect(screen.getByTestId('studio-scrollable-tabs')).toBeInTheDocument();
  });

  it('shows campaign_lead_hero inspector fields on content tab', () => {
    const block = campaignBlock('clh-1');

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onDelete={vi.fn()}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    expect(screen.getByLabelText('Titre campagne')).toBeInTheDocument();
    expect(screen.getByLabelText('Marque')).toBeInTheDocument();
  });

  it('shows hero_vehicle_offer inspector fields on content tab', () => {
    const block = heroOfferBlock('hvo-1');

    render(
      <BlockInspectorPanel
        block={block}
        updateBlockProps={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onDelete={vi.fn()}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    expect(screen.getByLabelText('Marque')).toBeInTheDocument();
    expect(screen.getByLabelText('Titre principal')).toBeInTheDocument();
  });
});
