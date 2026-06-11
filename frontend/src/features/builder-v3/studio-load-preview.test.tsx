import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import {
  hydrateBuilderDocumentStore,
  setBuilderPersistPageVersionId,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { StudioLayout } from './layout/StudioLayout';
import { StudioTopBar } from './layout/StudioTopBar';
import { LeftSidebar } from './panels/LeftSidebar';
import { buildPreviewNavigationState, readPreviewRevision } from './lib/preview-navigation-state';
import { saveBuilderDocumentDesign } from './lib/save-builder-v3';

const loadBuilderDocumentFromApi = vi.fn();

vi.mock('@/features/builder-engine/lib/load-builder-document', () => ({
  loadBuilderDocumentFromApi: (...args: unknown[]) => loadBuilderDocumentFromApi(...args),
}));

vi.mock('./lib/save-builder-v3', () => ({
  saveBuilderDocumentDesign: vi.fn().mockResolvedValue(undefined),
  BuilderSaveError: class BuilderSaveError extends Error {},
}));

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

function heroBlock(id: string): BuilderDocumentBlock {
  return {
    id,
    type: 'hero_vehicle_offer',
    label: 'Hero offre',
    sortOrder: 0,
    propsJson: { brandId: 'ford', headline: 'Test' },
  };
}

describe('Studio load and preview sync', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
    loadBuilderDocumentFromApi.mockReset();
    vi.mocked(saveBuilderDocumentDesign).mockClear();
  });

  it('shows canvas placeholder while document is not hydrated', () => {
    render(
      <DndContext>
        <StudioLayout documentHydrated={false} />
      </DndContext>,
    );

    expect(screen.getByTestId('studio-canvas-placeholder')).toBeInTheDocument();
    expect(screen.getByText('Chargement du document…')).toBeInTheDocument();
  });

  it('shows loading badge in topbar while document loads', () => {
    render(
      <MemoryRouter>
        <StudioTopBar
          deviceMode="desktop"
          saveStatus="loading"
          documentLoading
          onDeviceModeChange={() => {}}
          onSave={() => {}}
          onPreview={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Chargement du document…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aperçu' })).toBeDisabled();
  });

  it('prefers in-memory document on preview when revision matches', async () => {
    const pageVersionId = 'pv-preview-1';
    setBuilderPersistPageVersionId(pageVersionId);
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().markDocumentSaved();
    const revision = useBuilderDocumentStore.getState().documentRevision;

    const result = await hydrateBuilderDocumentStore(pageVersionId, {
      preferMemoryRevision: revision,
    });

    expect(result).toBe('memory');
    expect(loadBuilderDocumentFromApi).not.toHaveBeenCalled();
    expect(useBuilderDocumentStore.getState().blocks).toHaveLength(1);
  });

  it('re-fetches document when preview revision is older than memory', async () => {
    const pageVersionId = 'pv-preview-2';
    setBuilderPersistPageVersionId(pageVersionId);
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    useBuilderDocumentStore.getState().markDocumentSaved();
    const staleRevision = useBuilderDocumentStore.getState().documentRevision - 1;

    loadBuilderDocumentFromApi.mockResolvedValue({
      blocks: [heroBlock('hero-server')],
      pageTheme: useBuilderDocumentStore.getState().pageTheme,
      pageSettings: useBuilderDocumentStore.getState().pageSettings,
      landingPageId: null,
      source: 'server',
    });

    const result = await hydrateBuilderDocumentStore(pageVersionId, {
      cacheBust: true,
      preferMemoryRevision: staleRevision,
    });

    expect(result).toBe('server');
    expect(loadBuilderDocumentFromApi).toHaveBeenCalledWith(pageVersionId, { cacheBust: true });
    expect(useBuilderDocumentStore.getState().blocks[0]?.id).toBe('hero-server');
  });

  it('bumps document revision after save for preview navigation', async () => {
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock('hero-1')]);
    const before = useBuilderDocumentStore.getState().documentRevision;

    useBuilderDocumentStore.getState().markDocumentSaved();

    expect(useBuilderDocumentStore.getState().documentRevision).toBe(before + 1);
    expect(useBuilderDocumentStore.getState().lastSavedAt).toBeGreaterThan(0);
  });

  it('builds preview navigation state from document revision', () => {
    const state = buildPreviewNavigationState(3);
    expect(readPreviewRevision(state)).toBe(3);
  });

  it('keeps selected block when switching sidebar modes', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      heroBlock('hero-a'),
      { ...heroBlock('hero-b'), sortOrder: 1 },
    ]);
    useBuilderDocumentStore.getState().selectBlock('hero-b');

    render(
      <DndContext>
        <LeftSidebar />
      </DndContext>,
    );

    fireEvent.click(screen.getByTestId('studio-sidebar-mode-layers'));
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('hero-b');

    fireEvent.click(screen.getByTestId('studio-sidebar-mode-blocks'));
    expect(useBuilderDocumentStore.getState().selectedBlockId).toBe('hero-b');
  });
});
