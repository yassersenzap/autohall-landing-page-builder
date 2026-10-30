import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { isCanvasEmpty } from './canvas-composition';
import { insertHeroFormPreset } from './campaign-block-insert';
import { findHeroBlock } from './hero-block';

describe('canvas-composition', () => {
  it('starts empty on blank document', () => {
    expect(isCanvasEmpty(createBlankCanvasDocument())).toBe(true);
  });

  it('hero-form preset adds HeroBlock to page', () => {
    let doc = createBlankCanvasDocument();
    doc = insertHeroFormPreset(doc).document;
    expect(isCanvasEmpty(doc)).toBe(false);
    expect(findHeroBlock(doc.nodes, doc.rootId)).toBeDefined();
  });
});
