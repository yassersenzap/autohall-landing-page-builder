import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { insertCanvasBlock } from './campaign-block-insert';
import { normalizeDocument } from './document-lifecycle';
import { healCampaignDocument } from './heal-campaign-document';
import { findHeroBlock } from './hero-block';

describe('healCampaignDocument', () => {
  it('preserves multiple hero sections', () => {
    let doc = createBlankCanvasDocument();
    doc = insertCanvasBlock(doc, 'hero-form-unified').document;
    const first = findHeroBlock(doc.nodes, doc.rootId)!;
    // Simulate double insert by manually adding clone id
    const frame = doc.nodes[doc.rootId];
    const fakeId = 'fake-hero-id';
    doc = {
      ...doc,
      nodes: {
        ...doc.nodes,
        [fakeId]: { ...first, id: fakeId, parentId: doc.rootId },
        [doc.rootId]: { ...frame, children: [...frame.children, fakeId] },
      },
    };
    const healed = healCampaignDocument(doc);
    expect(healed.nodes[healed.rootId].children.length).toBe(2);
  });

  it('normalizeDocument heals on load', () => {
    const blank = createBlankCanvasDocument();
    const inserted = normalizeDocument(insertCanvasBlock(blank, 'hero-form-unified').document);
    expect(findHeroBlock(inserted.nodes, inserted.rootId)?.name).toBe('Hero Showroom');
  });
});
