import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { findHeroBlock } from './hero-block';
import { useBuilderV4Store } from '../store/document.store';
import { isDocumentEmpty } from './document-lifecycle';

describe('hero-block-atomic P0', () => {
  it('Test 1 — blank → add Hero+Form creates flat section block', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const doc = useBuilderV4Store.getState().document;

    expect(isDocumentEmpty(doc)).toBe(false);
    
    const hero = findHeroBlock(doc.nodes, doc.rootId);
    expect(hero).toBeDefined();
    expect(hero!.kind).toBe('section');
    expect(hero!.props.blockType).toBe('hero-showroom');
    expect(hero!.props.vehicleImage).toBeDefined();
    expect(hero!.props.modelsList).toBeDefined();
  });

  it('Test 2 — update flat hero props', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    let doc = useBuilderV4Store.getState().document;
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;

    useBuilderV4Store.getState().updateNodeProps(hero.id, {
      vehicleImage: 'data:image/png;base64,abc',
      title: 'Chery Tiggo 7 Pro PHEV',
    });

    doc = useBuilderV4Store.getState().document;
    const updatedHero = doc.nodes[hero.id];
    expect(updatedHero.props.vehicleImage).toBe('data:image/png;base64,abc');
    expect(updatedHero.props.title).toBe('Chery Tiggo 7 Pro PHEV');
  });

  it('Test 3-5 — delete / undo / redo flat Hero block lifecycle', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const doc = useBuilderV4Store.getState().document;
    const heroId = findHeroBlock(doc.nodes, doc.rootId)!.id;

    useBuilderV4Store.getState().deleteNode(heroId);
    expect(isDocumentEmpty(useBuilderV4Store.getState().document)).toBe(true);

    useBuilderV4Store.getState().undoDocument();
    expect(isDocumentEmpty(useBuilderV4Store.getState().document)).toBe(false);
    expect(findHeroBlock(useBuilderV4Store.getState().document.nodes, useBuilderV4Store.getState().document.rootId)).toBeDefined();

    useBuilderV4Store.getState().redoDocument();
    expect(isDocumentEmpty(useBuilderV4Store.getState().document)).toBe(true);
  });
});
