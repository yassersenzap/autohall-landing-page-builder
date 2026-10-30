import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { findHeroBlock } from './hero-block';
import {
  isDocumentEmpty,
  isHeroBlockOnPage,
  normalizeDocument,
  resolveHeroBlockSelectionId,
} from './document-lifecycle';
import { useBuilderV4Store } from '../store/document.store';

describe('document-lifecycle', () => {
  it('blank document is empty', () => {
    const doc = createBlankCanvasDocument();
    expect(isDocumentEmpty(doc)).toBe(true);
    expect(isHeroBlockOnPage(doc)).toBe(false);
  });

  it('campaign with HeroBlock is not empty', () => {
    const doc = createPopulatedHeroFormDocument();
    expect(isDocumentEmpty(doc)).toBe(false);
    expect(isHeroBlockOnPage(doc)).toBe(true);
    expect(resolveHeroBlockSelectionId(doc)).toBe(findHeroBlock(doc.nodes, doc.rootId)?.id);
  });

  it('normalizeDocument syncs campaign templateId when hero is present', () => {
    const doc = createPopulatedHeroFormDocument();
    const normalized = normalizeDocument(doc);
    expect(normalized.meta.templateId).toBe('campaign-hero-form');
    expect(isDocumentEmpty(normalized)).toBe(false);
  });

  it('normalizeDocument exits blank mode when hero-form is inserted', () => {
    const blank = createBlankCanvasDocument();
    useBuilderV4Store.setState({
      document: blank,
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    const state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(false);
    expect(state.document.meta.templateId).toBe('campaign-hero-form');
  });

  it('normalizeDocument returns to blank when page has no blocks', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    useBuilderV4Store.getState().deleteNode(
      useBuilderV4Store.getState().document.nodes[useBuilderV4Store.getState().document.rootId].children[0],
    );
    const state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(true);
    expect(state.document.meta.templateId).toBe('blank');
  });

  it('full lifecycle: add → select → delete → empty → undo → redo', () => {
    useBuilderV4Store.setState({
      document: createBlankCanvasDocument(),
      selectedNodeId: null,
      selectedNodeIds: [],
      historyPast: [],
      historyFuture: [],
    });

    useBuilderV4Store.getState().insertCanvasBlock('hero-form');
    let state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(false);
    expect(state.document.meta.templateId).toBe('campaign-hero-form');
    expect(state.selectedNodeId).toBe(resolveHeroBlockSelectionId(state.document));

    const heroId = state.selectedNodeId!;
    useBuilderV4Store.getState().deleteNode(heroId);
    state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(true);
    expect(state.selectedNodeId).toBeNull();

    useBuilderV4Store.getState().undoDocument();
    state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(false);
    expect(resolveHeroBlockSelectionId(state.document)).toBe(heroId);

    useBuilderV4Store.getState().redoDocument();
    state = useBuilderV4Store.getState();
    expect(isDocumentEmpty(state.document)).toBe(true);
    expect(state.selectedNodeId).toBeNull();
  });
});
