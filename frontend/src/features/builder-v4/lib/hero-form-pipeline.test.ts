import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { useBuilderV4Store } from '../store/document.store';
import { isDocumentEmpty } from './document-lifecycle';
import { findHeroBlock } from './hero-block';
import { resolveHeroFormEditorState } from './studio-compat.js';

describe('Hero+Form production pipeline', () => {
  function resetStore() {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });
  }

  it('insert → campaign block with image + multi-step form', () => {
    resetStore();
    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const { document } = useBuilderV4Store.getState();
    const hero = findHeroBlock(document.nodes, document.rootId)!;

    expect(hero.kind).toBe('section');
    expect(hero.props.blockType).toBe('hero-showroom');
    expect(hero.props.vehicleImage).toBeDefined();
    expect(hero.props.modelsList.length).toBeGreaterThan(0);
    expect(resolveHeroFormEditorState(document, () => undefined)).toBe('ready');
    expect(document.meta.templateId).toBe('campaign-hero-form');
  });

  it('delete hero → blank page', () => {
    resetStore();
    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const hero = findHeroBlock(useBuilderV4Store.getState().document.nodes, useBuilderV4Store.getState().document.rootId)!;
    useBuilderV4Store.getState().deleteNode(hero.id);

    const state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(true);
    expect(state.document.meta.templateId).toBe('blank');
    expect(findHeroBlock(state.document.nodes, state.document.rootId)).toBeUndefined();
  });

  it('undo delete restores hero', () => {
    resetStore();
    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const heroId = findHeroBlock(useBuilderV4Store.getState().document.nodes, useBuilderV4Store.getState().document.rootId)!.id;
    useBuilderV4Store.getState().deleteNode(heroId);
    expect(isDocumentEmpty(useBuilderV4Store.getState().document)).toBe(true);
    useBuilderV4Store.getState().undoDocument();
    expect(isDocumentEmpty(useBuilderV4Store.getState().document)).toBe(false);
    expect(findHeroBlock(useBuilderV4Store.getState().document.nodes, useBuilderV4Store.getState().document.rootId)?.id).toBe(heroId);
  });

  it('allows duplicate hero insert on same page', () => {
    resetStore();
    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const first = findHeroBlock(useBuilderV4Store.getState().document.nodes, useBuilderV4Store.getState().document.rootId)!;
    useBuilderV4Store.getState().insertCanvasBlock('hero-form-unified');
    const frame = useBuilderV4Store.getState().document.nodes[useBuilderV4Store.getState().document.rootId];
    expect(frame.children.length).toBe(2);
    expect(frame.children[0]).toBe(first.id);
  });
});
