import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getInspectorControlsForBlock } from '@/features/builder/block-registry/inspector-controls-registry';
import { sanitizePropsPatch } from '@/features/builder-engine/lib/sanitize-props-patch';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { InspectorControlRenderer } from './InspectorControlRenderer';

function bentoBlock(cards = [{ title: 'Carte 1', description: 'Desc', icon: 'star' }]): BuilderDocumentBlock {
  return {
    id: 'block-bento',
    type: 'premium_bento_features',
    label: 'Bento',
    sortOrder: 0,
    propsJson: { title: 'Avantages', cards },
  };
}

function repeaterControl(blockType: string, propKey: string) {
  return getInspectorControlsForBlock(blockType).find(
    (c) => c.type === 'repeater' && c.propKey === propKey,
  )!;
}

describe('RepeaterControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBuilderDocumentStore.getState().resetDocument();
  });

  it('renders item list for premium bento cards', () => {
    const block = bentoBlock();
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={() => {}}
      />,
    );

    expect(screen.getByTestId(`repeater-${block.id}-cards`)).toBeInTheDocument();
    expect(screen.getByText('Carte 1')).toBeInTheDocument();
  });

  it('add item updates props via patch', () => {
    const onPatch = vi.fn();
    const block = bentoBlock();
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />,
    );

    fireEvent.click(screen.getByTestId(`repeater-add-${control.key}`));
    expect(onPatch).toHaveBeenCalled();
    const patch = onPatch.mock.calls[0]![0] as { cards: unknown[] };
    expect(patch.cards).toHaveLength(2);
  });

  it('duplicate item updates props', () => {
    const onPatch = vi.fn();
    const block = bentoBlock();
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />,
    );

    fireEvent.click(screen.getByTestId(`repeater-duplicate-${control.key}-0`));
    const patch = onPatch.mock.calls[0]![0] as { cards: { title: string }[] };
    expect(patch.cards).toHaveLength(2);
    expect(patch.cards[1]?.title).toBe('Carte 1');
  });

  it('delete item updates props when above minItems', () => {
    const onPatch = vi.fn();
    const block = bentoBlock([
      { title: 'A', description: 'a', icon: 'star' },
      { title: 'B', description: 'b', icon: 'star' },
    ]);
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />,
    );

    fireEvent.click(screen.getByTestId(`repeater-delete-${control.key}-0`));
    const patch = onPatch.mock.calls[0]![0] as { cards: { title: string }[] };
    expect(patch.cards).toHaveLength(1);
    expect(patch.cards[0]?.title).toBe('B');
  });

  it('reorder item updates props', () => {
    const onPatch = vi.fn();
    const block = bentoBlock([
      { title: 'Premier', description: 'a', icon: 'star' },
      { title: 'Second', description: 'b', icon: 'star' },
    ]);
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={onPatch}
      />,
    );

    fireEvent.click(screen.getByTestId(`repeater-down-${control.key}-0`));
    const patch = onPatch.mock.calls[0]![0] as { cards: { title: string }[] };
    expect(patch.cards[0]?.title).toBe('Second');
    expect(patch.cards[1]?.title).toBe('Premier');
  });

  it('collapsed item expands on header click', () => {
    const block = bentoBlock();
    const control = repeaterControl('premium_bento_features', 'cards');

    render(
      <InspectorControlRenderer
        controls={[control]}
        blockType="premium_bento_features"
        propsJson={block.propsJson}
        blockId={block.id}
        onPatch={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Titre de la carte')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Carte 1'));
    expect(screen.queryByPlaceholderText('Titre de la carte')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Carte 1'));
    expect(screen.getByPlaceholderText('Titre de la carte')).toBeInTheDocument();
  });

  it('sanitizes invalid repeater patches', () => {
    const patch = sanitizePropsPatch(
      {
        metrics: [
          { value: '10', label: 'X', _studioMeta: 'drop' },
          { value: '', label: '', helper: '' },
        ],
      },
      'animated_stats_strip',
    );

    expect(patch.metrics).toHaveLength(1);
    expect(patch.metrics?.[0]).toMatchObject({ value: '10', label: 'X' });
    expect(patch.metrics?.[0]).not.toHaveProperty('_studioMeta');
  });

  it('undo/redo works after repeater array change via store', () => {
    useBuilderDocumentStore.getState().setInitialBlocks([bentoBlock()]);
    const before = useBuilderDocumentStore.getState().blocks[0]?.propsJson.cards;

    useBuilderDocumentStore.getState().updateBlockProps('block-bento', {
      cards: [
        { title: 'Nouveau', description: 'Texte', icon: 'drive' },
        { title: 'Autre', description: 'Suite', icon: 'shield' },
      ],
    });

    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.cards).toHaveLength(2);
    useBuilderDocumentStore.getState().undo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.cards).toEqual(before);
    useBuilderDocumentStore.getState().redo();
    expect(useBuilderDocumentStore.getState().blocks[0]?.propsJson.cards).toHaveLength(2);
  });

  it('exposes repeater controls for stats, timeline and vehicle showcase', () => {
    expect(repeaterControl('animated_stats_strip', 'metrics').type).toBe('repeater');
    expect(repeaterControl('campaign_timeline_steps', 'steps').type).toBe('repeater');
    expect(repeaterControl('vehicle_showcase_split', 'specs').type).toBe('repeater');
    expect(repeaterControl('vehicle_showcase_split', 'ctas').type).toBe('repeater');
  });
});
