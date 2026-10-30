import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { insertHeroOverlayText } from './geometry/hero-overlay-text';
import {
  cloneSubtreeWithNewIds,
  deleteNodeFromDocument,
  extractSubtree,
  insertSubtree,
  moveNodeInDocument,
  reorderSibling,
} from './node-tree-ops';
import { IMAGE_LAYER_NAME } from './hero-layers';

function findNodeByName(doc: ReturnType<typeof createPopulatedHeroFormDocument>, name: string) {
  return Object.values(doc.nodes).find((node) => node.name === name);
}

function docWithOverlayTexts() {
  const doc = createPopulatedHeroFormDocument();
  const heroImage = findNodeByName(doc, IMAGE_LAYER_NAME)!;
  const first = insertHeroOverlayText(doc.nodes, heroImage.id, { text: 'Badge A' }, doc.rootId)!;
  const second = insertHeroOverlayText(first.nodes, heroImage.id, { text: 'Title B' }, doc.rootId)!;
  const imageLayer = findNodeByName({ ...doc, nodes: second.nodes }, IMAGE_LAYER_NAME)!;
  return {
    doc: { ...doc, nodes: second.nodes },
    heroImage,
    imageLayer,
    texts: second,
  };
}

describe('node-tree-ops V2', () => {
  const doc = createPopulatedHeroFormDocument();

  it('reorders overlay text inside ImageLayer', () => {
    const { doc: seeded, imageLayer, texts } = docWithOverlayTexts();
    const firstId = texts.nodes[imageLayer.children[0]].id;
    const secondId = texts.nodes[imageLayer.children[1]].id;
    const next = moveNodeInDocument(seeded, secondId, imageLayer.id, 0);
    expect(next.nodes[imageLayer.id].children[0]).toBe(secondId);
    expect(next.nodes[secondId].parentId).toBe(imageLayer.id);
    expect(firstId).not.toBe(secondId);
  });

  it('reorderSibling swaps sibling positions', () => {
    const { doc: seeded, imageLayer } = docWithOverlayTexts();
    const [firstId, secondId] = imageLayer.children;
    const before = seeded.nodes[imageLayer.id].children.indexOf(firstId);
    const next = reorderSibling(seeded, firstId, secondId);
    const after = next.nodes[imageLayer.id].children.indexOf(firstId);
    expect(after).toBeGreaterThan(before);
  });

  it('duplicates subtree with new ids', () => {
    const { texts } = docWithOverlayTexts();
    const textNode = texts.nodes[texts.textId];
    const payload = extractSubtree(texts.nodes, textNode.id);
    expect(payload).not.toBeNull();
    const cloned = cloneSubtreeWithNewIds(payload!);
    expect(cloned.rootId).not.toBe(textNode.id);
    expect(cloned.nodes[cloned.rootId].name).toContain('copy');
  });

  it('deletes overlay text node', () => {
    const { texts } = docWithOverlayTexts();
    const next = deleteNodeFromDocument({ ...createPopulatedHeroFormDocument(), nodes: texts.nodes }, texts.textId);
    expect(next.nodes[texts.textId]).toBeUndefined();
    expect(findNodeByName(next, IMAGE_LAYER_NAME)).toBeDefined();
  });

  it('insertSubtree pastes under ImageLayer', () => {
    const { texts } = docWithOverlayTexts();
    const imageLayer = findNodeByName(doc, IMAGE_LAYER_NAME)!;
    const payload = cloneSubtreeWithNewIds(extractSubtree(texts.nodes, texts.textId)!);
    const next = insertSubtree(doc, payload, imageLayer.id, 0);
    expect(next.nodes[imageLayer.id].children).toContain(payload.rootId);
  });

  it('cannot move root node', () => {
    const next = moveNodeInDocument(doc, doc.rootId, doc.rootId, 0);
    expect(next).toBe(doc);
  });
});
