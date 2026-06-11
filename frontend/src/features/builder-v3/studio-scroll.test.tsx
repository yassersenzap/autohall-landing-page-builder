import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { STUDIO_PANEL_BODY_SLOT_CLASS } from './layout/studio-panel-scroll';
import { StudioLayout } from './layout/StudioLayout';
import { BlocksCatalogPanel } from './panels/BlocksCatalogPanel';
import { BlockInspectorPanel } from './panels/BlockInspectorPanel';
import { LeftSidebar } from './panels/LeftSidebar';

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

function campaignBlock(): BuilderDocumentBlock {
  return {
    id: 'clh-1',
    type: 'campaign_lead_hero',
    label: 'Hero campagne',
    sortOrder: 0,
    propsJson: {
      brandId: 'chery',
      campaignTitle: 'Test',
      formTitle: 'Contact',
      formCtaLabel: 'Continuer',
      layoutVariant: 'media_left_form_right',
      design: { formTheme: 'light', tone: 'light', showOfferBadge: true, showProgressBar: true },
    },
  };
}

function heroOfferBlock(): BuilderDocumentBlock {
  return {
    id: 'hvo-1',
    type: 'hero_vehicle_offer',
    label: 'Hero offre',
    sortOrder: 0,
    propsJson: {
      brandId: 'ford',
      modelName: 'Ranger',
      headline: 'Test',
      primaryCtaLabel: 'Essai',
      design: { tone: 'brand', density: 'comfortable', ctaStyle: 'primary', showOfferBadge: true, alignContent: 'left' },
    },
  };
}

describe('Studio panel scrolling layout', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('Studio shell uses viewport-height flex layout without page scroll', () => {
    renderWithDnd(<StudioLayout documentHydrated />);
    const shell = document.querySelector('[data-studio-shell]');
    expect(shell).toHaveClass('h-screen', 'overflow-hidden');
  });

  it('left sidebar exposes a scrollable panel body slot', () => {
    renderWithDnd(<LeftSidebar />);
    const body = screen.getByTestId('studio-left-panel-body');
    expect(body).toHaveClass(...STUDIO_PANEL_BODY_SLOT_CLASS.split(' '));
    expect(screen.getByTestId('studio-blocks-panel')).toHaveAttribute('data-studio-panel-scroll');
    expect(screen.getByTestId('studio-blocks-panel')).toHaveClass('overflow-y-auto', 'h-full', 'min-h-0');
  });

  it('blocks catalog panel is a vertical scroll container', () => {
    render(<BlocksCatalogPanel />);
    const panel = screen.getByTestId('studio-blocks-panel');
    expect(panel).toHaveClass('overflow-y-auto');
    expect(panel.querySelector('.pb-6')).toBeTruthy();
  });

  it('inspector tab content uses a dedicated scroll container', () => {
    render(
      <div className="flex h-[480px] min-h-0 flex-col overflow-hidden">
        <BlockInspectorPanel
          block={campaignBlock()}
          updateBlockProps={vi.fn()}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
          onDelete={() => {}}
          canMoveUp={false}
          canMoveDown={false}
        />
      </div>,
    );

    expect(screen.getByTestId('block-inspector-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('block-inspector-scroll')).toHaveAttribute('data-studio-panel-scroll');
    expect(screen.getByTestId('block-inspector-scroll')).toHaveClass('overflow-y-auto');
  });

  it('switching sidebar modes preserves selected block', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroOfferBlock()]);
    useBuilderDocumentStore.getState().selectBlock('hvo-1');

    renderWithDnd(<LeftSidebar />);
    fireEvent.click(screen.getByTestId('studio-sidebar-mode-layers'));
    fireEvent.click(screen.getByTestId('studio-sidebar-mode-blocks'));

    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('hvo-1');
  });

  it('campaign_lead_hero inspector renders across tabs', () => {
    render(
      <BlockInspectorPanel
        block={campaignBlock()}
        updateBlockProps={vi.fn()}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    expect(screen.getByLabelText('Titre campagne')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Media' }));
    expect(screen.getByText('Image principale')).toBeInTheDocument();
  });

  it('hero_vehicle_offer inspector renders design tab controls', () => {
    render(
      <BlockInspectorPanel
        block={heroOfferBlock()}
        updateBlockProps={vi.fn()}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDelete={() => {}}
        canMoveUp={false}
        canMoveDown={false}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Design' }));
    expect(screen.getByLabelText('Ambiance')).toBeInTheDocument();
    expect(screen.getByLabelText('Densité')).toBeInTheDocument();
  });
});
