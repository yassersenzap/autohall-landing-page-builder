import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { findHeroBlock } from './hero-block';
import {
  getLayerBreadcrumbTrail,
  getLayerDisplayName,
  isLayerHidden,
  resolveLayerChildren,
  resolveLayerTreeEntries,
} from './layer-display';
import { insertHeroOverlayText } from './geometry/hero-overlay-text';
import { engineCanDrag } from './engine-node-matrix';
import { FORM_LAYER_NAME, IMAGE_LAYER_NAME } from './hero-layers';

describe('layer-display V2', () => {
  const doc = createPopulatedHeroFormDocument();
  const root = doc.nodes[doc.rootId];
  const heroBlock = findHeroBlock(doc.nodes, doc.rootId)!;
  const imageLayer = Object.values(doc.nodes).find((node) => node.name === IMAGE_LAYER_NAME)!;
  const formLayer = Object.values(doc.nodes).find((node) => node.name === FORM_LAYER_NAME)!;

  it('hides overlay text from layer tree', () => {
    const inserted = insertHeroOverlayText(doc.nodes, imageLayer.id, { text: 'Hidden' }, doc.rootId);
    expect(inserted).not.toBeNull();
    const textNode = inserted!.nodes[inserted!.textId];
    expect(isLayerHidden(textNode, inserted!.nodes)).toBe(true);
  });

  it('maps business display names', () => {
    expect(getLayerDisplayName(root)).toBe('Page');
    expect(getLayerDisplayName(heroBlock)).toBe('Hero + Form');
    expect(getLayerDisplayName(imageLayer)).toBe('Image');
    expect(getLayerDisplayName(formLayer)).toBe('Formulaire');
  });

  it('shows HeroFormSection under Page', () => {
    const children = resolveLayerChildren(root, doc.nodes, doc.rootId);
    expect(children.map((node) => node.name)).toEqual(['HeroFormSection']);
  });

  it('does not show children under sections in layers tree (flat sections list)', () => {
    const entries = resolveLayerTreeEntries(heroBlock, doc.nodes, doc.rootId);
    expect(entries).toEqual([]);
  });

  it('allows dragging overlay text on image layer', () => {
    const inserted = insertHeroOverlayText(doc.nodes, imageLayer.id, { text: 'Promo été' }, doc.rootId);
    expect(inserted).not.toBeNull();
    const textNode = inserted!.nodes[inserted!.textId];
    expect(engineCanDrag(textNode, doc.rootId, inserted!.nodes)).toBe(true);
  });

  it('does not expose nested children under ImageLayer in layers tree', () => {
    const children = resolveLayerChildren(imageLayer, doc.nodes, doc.rootId);
    expect(children).toEqual([]);
  });

  it('breadcrumbs stop at HeroFormSection for overlay text', () => {
    const inserted = insertHeroOverlayText(doc.nodes, imageLayer.id, undefined, doc.rootId)!;
    const trail = getLayerBreadcrumbTrail(inserted.textId, inserted.nodes);
    expect(trail.map((node) => node.name)).toEqual(['Page', 'HeroFormSection', IMAGE_LAYER_NAME]);
  });
});
