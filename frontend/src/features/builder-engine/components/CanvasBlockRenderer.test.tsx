import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';
import { CanvasBlockRenderer } from './CanvasBlockRenderer';

const heroBlock: BuilderDocumentBlock = {
  id: 'hero-live-1',
  type: 'hero',
  label: 'Bloc Hero',
  sortOrder: 0,
  propsJson: {
    title: 'Titre initial',
    subtitle: 'Sous-titre',
    eyebrow: 'Offre',
  },
};

describe('CanvasBlockRenderer live props', () => {
  beforeEach(() => {
    useBuilderDocumentStore.getState().resetDocument();
    useBuilderDocumentStore.getState().setInitialBlocks([heroBlock]);
  });

  it('met à jour le titre hero immédiatement après updateBlockProps', () => {
    render(<CanvasBlockRenderer blockId="hero-live-1" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Titre initial');

    act(() => {
      useBuilderDocumentStore.getState().updateBlockProps('hero-live-1', {
        title: 'Nouveau titre canvas',
      });
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nouveau titre canvas');
  });
});
