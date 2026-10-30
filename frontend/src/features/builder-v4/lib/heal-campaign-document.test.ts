import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { createHeroOverlayText } from './geometry/hero-overlay-text';
import { linkParentChild } from './node-factory';
import { deleteCampaignNode } from './heal-document-legacy-content';
import { healCampaignDocument, isCampaignBroken } from './heal-campaign-document';
import { findHeroBlock } from './hero-block';
import { findHeroFormLayers, isPageEmpty } from './studio-compat.js';

function findByName(doc: ReturnType<typeof createPopulatedHeroFormDocument>, name: string) {
  return Object.values(doc.nodes).find((node) => node.name === name);
}

describe('heal-campaign-document', () => {
  it('deleting any internal hero layer removes entire Hero + Form block', () => {
    let doc = createPopulatedHeroFormDocument();
    const formLayer = findByName(doc, 'FormLayer')!;
    doc = deleteCampaignNode(doc, formLayer.id);
    expect(isPageEmpty(doc)).toBe(true);
    expect(doc.meta.templateId).toBe('blank');
    expect(findHeroBlock(doc.nodes, doc.rootId)).toBeUndefined();
  });

  it('sanitizes orphan overlay text attached directly to frame', () => {
    let doc = createPopulatedHeroFormDocument();
    const frame = doc.nodes[doc.rootId];
    const orphanText = createHeroOverlayText({ text: 'Gamme Thermique' });
    let nodes = { ...doc.nodes, [orphanText.id]: orphanText };
    nodes = linkParentChild(nodes, frame.id, orphanText.id);
    doc = { ...doc, nodes };

    expect(isCampaignBroken(doc)).toBe(true);

    const healed = healCampaignDocument(doc);
    expect(healed.nodes[orphanText.id]).toBeUndefined();
    expect(findHeroBlock(healed.nodes, healed.rootId)).toBeDefined();
  });

  it('empty page after delete becomes blank template', () => {
    let doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    doc = deleteCampaignNode(doc, hero.id);
    expect(doc.meta.templateId).toBe('blank');
    expect(isPageEmpty(doc)).toBe(true);
  });

  it('hero block keeps three layers when intact', () => {
    const doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    expect(findHeroFormLayers(doc, hero.id)).not.toBeNull();
    expect(isCampaignBroken(doc)).toBe(false);
  });
});
