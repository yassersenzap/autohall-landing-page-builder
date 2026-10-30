import { describe, expect, it } from 'vitest';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { findHeroBlock } from './hero-block';
import {
  resolveHeroFormEditorState,
  resolveHeroFormProductState,
} from './studio-compat.js';
import { insertCanvasBlock } from './campaign-block-insert';

describe('hero-form product state', () => {
  it('starts empty when no background image is assigned', () => {
    const blank = createBlankCanvasDocument();
    let { document: doc } = insertCanvasBlock(blank, 'hero-form-unified');
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    
    // Set vehicleImage and legacy properties to empty
    doc.nodes[hero.id].props.backgroundImage = '';
    doc.nodes[hero.id].props.bgImage = '';
    doc.nodes[hero.id].props.vehicleImage = '';

    expect(resolveHeroFormEditorState(doc, () => undefined)).toBe('empty');
    expect(resolveHeroFormProductState(doc, () => undefined, false)).toBe('empty');
  });

  it('becomes ready when image and multi-step form are configured', () => {
    const blank = createBlankCanvasDocument();
    const { document: doc } = insertCanvasBlock(blank, 'hero-form-unified');

    expect(resolveHeroFormEditorState(doc, () => undefined)).toBe('ready');
  });

  it('becomes building when a step has no fields', () => {
    const blank = createBlankCanvasDocument();
    let { document: doc } = insertCanvasBlock(blank, 'hero-form-unified');
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;

    const props = doc.nodes[hero.id].props;
    doc.nodes[hero.id].props = {
      ...props,
      steps: [
        { fieldIds: ['f1'], kind: 'input' },
        { fieldIds: [], kind: 'input' }
      ]
    };

    expect(resolveHeroFormEditorState(doc, () => undefined)).toBe('building');
  });

  it('maps preview mode to preview product state', () => {
    const blank = createBlankCanvasDocument();
    const { document: doc } = insertCanvasBlock(blank, 'hero-form-unified');
    expect(resolveHeroFormProductState(doc, () => undefined, true)).toBe('preview');
  });
});
