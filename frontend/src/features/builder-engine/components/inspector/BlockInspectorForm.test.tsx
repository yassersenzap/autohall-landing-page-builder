import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBuilderDocumentStore } from '../../store/builder-document.store';
import { BlockInspectorForm } from './BlockInspectorForm';

vi.mock('./inspector/HeroInspectorFields', () => ({
  HeroInspectorFields: () => <div data-testid="hero-inspector">Hero inspector</div>,
}));

describe('BlockInspectorForm', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('does not crash when the block was removed from the store', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([
      {
        id: 'hero-1',
        type: 'hero',
        label: 'Hero',
        sortOrder: 0,
        propsJson: { title: 'Test' },
      },
    ]);

    const staleBlock = {
      id: 'hero-1',
      type: 'hero',
      label: 'Hero',
      sortOrder: 0,
      propsJson: { title: 'Test' },
    };

    useBuilderDocumentStore.getState().removeBlock('hero-1');

    render(<BlockInspectorForm block={staleBlock} />);

    expect(screen.getByText(/Cette section n’existe plus/i)).toBeInTheDocument();
    expect(screen.queryByTestId('hero-inspector')).not.toBeInTheDocument();
  });
});
