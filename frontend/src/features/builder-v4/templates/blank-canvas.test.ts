import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument, isBlankCanvasDocument } from '../templates/blank-canvas';
import { getLayerDisplayName } from '../lib/layer-display';

describe('blank canvas', () => {
  it('creates an empty page document', () => {
    const doc = createBlankCanvasDocument();
    expect(isBlankCanvasDocument(doc)).toBe(true);
    expect(doc.meta.templateId).toBe('blank');
    const frame = doc.nodes[doc.rootId];
    expect(frame.children).toHaveLength(0);
  });

  it('labels root frame as Page in layers', () => {
    const doc = createBlankCanvasDocument();
    const frame = doc.nodes[doc.rootId];
    expect(getLayerDisplayName(frame, doc.nodes)).toBe('Page');
  });
});
