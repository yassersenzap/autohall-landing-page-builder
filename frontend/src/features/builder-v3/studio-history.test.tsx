import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudioTopBar } from './layout/StudioTopBar';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';

function hero(id: string): BuilderDocumentBlock {
  return {
    id,
    type: 'hero_campaign',
    label: 'Hero',
    sortOrder: 0,
    propsJson: { title: 'Hero' },
  };
}

describe('StudioTopBar history controls', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('disables undo/redo when history is empty', () => {
    render(
      <MemoryRouter>
        <StudioTopBar
          deviceMode="desktop"
          saveStatus="saved"
          onDeviceModeChange={() => {}}
          onSave={() => {}}
          onPreview={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('studio-undo')).toBeDisabled();
    expect(screen.getByTestId('studio-redo')).toBeDisabled();
  });

  it('enables undo after a mutation and triggers undo from UI', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([hero('hero-1')]);
    useBuilderDocumentStore.getState().updateBlockProps('hero-1', { title: 'Changed' });

    render(
      <MemoryRouter>
        <StudioTopBar
          deviceMode="desktop"
          saveStatus="dirty"
          onDeviceModeChange={() => {}}
          onSave={() => {}}
          onPreview={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('studio-undo')).not.toBeDisabled();
    fireEvent.click(screen.getByTestId('studio-undo'));
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.title).toBe('Hero');
  });
});
