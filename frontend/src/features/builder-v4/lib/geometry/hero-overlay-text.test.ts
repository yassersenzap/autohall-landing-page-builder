import { describe, expect, it } from 'vitest';
import { createHeroOverlayText, insertHeroOverlayText, isHeroOverlayTextNode } from './hero-overlay-text';
import { createPopulatedHeroFormDocument } from '../../templates/campaign-hero-form';
import { IMAGE_LAYER_NAME } from '../hero-layers';

describe('hero-overlay-text V2', () => {
  it('creates absolute positioned text layer', () => {
    const node = createHeroOverlayText({ left: 80, top: 160, text: 'Promo' });
    expect(node.layout.position).toBe('absolute');
    expect(node.layout.left).toBe(80);
    expect(node.layout.top).toBe(160);
    expect(node.name).toBe('HeroText');
  });

  it('inserts overlay text as child of ImageLayer', () => {
    const doc = createPopulatedHeroFormDocument();
    const imageLayer = Object.values(doc.nodes).find((node) => node.name === IMAGE_LAYER_NAME)!;
    const result = insertHeroOverlayText(doc.nodes, imageLayer.id, undefined, doc.rootId);
    expect(result).not.toBeNull();
    const textNode = result!.nodes[result!.textId];
    expect(isHeroOverlayTextNode(textNode, result!.nodes)).toBe(true);
    expect(imageLayer.id).toBeTruthy();
    expect(result!.nodes[imageLayer.id].children).toContain(result!.textId);
  });
});
