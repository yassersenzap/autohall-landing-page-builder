import { beforeEach, describe, expect, it } from 'vitest';
import type { FrameNodeProps } from '../types/nodes.types';
import { useBuilderV4Store } from './document.store';

describe('document store history', () => {
  beforeEach(() => {
    useBuilderV4Store.setState({
      document: useBuilderV4Store.getState().document,
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });
    useBuilderV4Store.getState().loadTemplate('blank');
    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    useBuilderV4Store.setState({ historyPast: [], historyFuture: [] });
  });

  it('records undo for updateNodeProps hero geometry', () => {
    const store = useBuilderV4Store.getState();
    const frameId = store.document.rootId;
    const frameProps = store.document.nodes[frameId].props as FrameNodeProps;
    const before = frameProps.heroFormGeometry;

    store.applyHeroGeometry({ leftRatio: 55, rightRatio: 45 });

    expect(useBuilderV4Store.getState().historyPast.length).toBe(1);
    store.undoDocument();
    expect(
      (useBuilderV4Store.getState().document.nodes[frameId].props as FrameNodeProps).heroFormGeometry,
    ).toEqual(before);
  });

  it('records undo for updateNodeLayout on section', () => {
    const store = useBuilderV4Store.getState();
    const section = Object.values(store.document.nodes).find((node) => node.kind === 'section')!;
    const beforePadding = section.layout?.padding;

    store.updateNodeLayout(section.id, { padding: 40 });
    expect(useBuilderV4Store.getState().historyPast.length).toBe(1);

    store.undoDocument();
    expect(useBuilderV4Store.getState().document.nodes[section.id].layout?.padding).toBe(beforePadding);
  });

  it('records redo after undo', () => {
    const store = useBuilderV4Store.getState();
    const section = Object.values(store.document.nodes).find((node) => node.kind === 'section')!;

    store.updateNodeLayout(section.id, { padding: 50 });
    store.undoDocument();
    store.redoDocument();
    expect(useBuilderV4Store.getState().document.nodes[section.id].layout?.padding).toBe(50);
  });
});
