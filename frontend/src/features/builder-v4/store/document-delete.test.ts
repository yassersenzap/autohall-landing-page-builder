import { describe, expect, it } from 'vitest';
import { useBuilderV4Store } from '../store/document.store';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { findHeroBlock } from '../lib/hero-block';
import { isCanvasEmpty } from '../lib/canvas-composition';

describe('deleteNode HeroFormSection', () => {
  it('removes hero section and returns blank canvas', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });
    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    const heroBlock = findHeroBlock(
      useBuilderV4Store.getState().document.nodes,
      useBuilderV4Store.getState().document.rootId,
    )!;

    useBuilderV4Store.setState({
      selectedNodeId: heroBlock.id,
      selectedNodeIds: [heroBlock.id],
    });

    useBuilderV4Store.getState().deleteNode(heroBlock.id);

    const next = useBuilderV4Store.getState();
    expect(isCanvasEmpty(next.document)).toBe(true);
    expect(next.selectedNodeId).toBeNull();
    expect(findHeroBlock(next.document.nodes, next.document.rootId)).toBeUndefined();
  });
});
