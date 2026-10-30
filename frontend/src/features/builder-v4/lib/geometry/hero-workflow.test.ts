import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../../templates/campaign-hero-form';
import { isLayerDragEnabled, canReparentCampaignNode } from '../campaign-structure';
import { engineCanDrag, engineCanResize } from '../engine-node-matrix';
import { applyHeroFormLayout, findHeroFormLayers, getHeroFormGeometry } from '../studio-compat.js';
import { findHeroBlock } from '../hero-block.js';
import { FORM_LAYER_NAME } from '../hero-layers';

describe('hero-layout-context integration V2', () => {
  it('blocks FormLayer drag in split mode', () => {
    const doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    const formLayer = findHeroFormLayers(doc, hero.id)!.form;
    expect(engineCanDrag(formLayer, doc.rootId, doc.nodes)).toBe(false);
    expect(engineCanResize(formLayer, doc.rootId, doc.nodes)).toBe(false);
  });

  it('allows FormLayer drag in floating mode', () => {
    let doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    const geo = { ...getHeroFormGeometry(doc), mode: 'floating-card' as const };
    doc = applyHeroFormLayout(doc, hero.id, geo);
    const formLayer = findHeroFormLayers(doc, hero.id)!.form;
    expect(engineCanDrag(formLayer, doc.rootId, doc.nodes)).toBe(true);
    expect(engineCanResize(formLayer, doc.rootId, doc.nodes)).toBe(true);
  });
});

describe('campaign-structure V2', () => {
  it('locks layer drag for structural campaign nodes', () => {
    const doc = createPopulatedHeroFormDocument();
    const formLayer = Object.values(doc.nodes).find((n) => n.name === FORM_LAYER_NAME)!;
    expect(isLayerDragEnabled(doc, formLayer)).toBe(false);
  });

  it('blocks reparenting FormLayer to Frame root', () => {
    const doc = createPopulatedHeroFormDocument();
    const formLayer = Object.values(doc.nodes).find((n) => n.name === FORM_LAYER_NAME)!;
    expect(formLayer.parentId).not.toBe(doc.rootId);
    expect(canReparentCampaignNode(doc, formLayer.id, doc.rootId)).toBe(false);
  });
});
