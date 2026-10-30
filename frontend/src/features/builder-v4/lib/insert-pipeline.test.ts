import { describe, expect, it } from 'vitest';
import { BLOCK_REGISTRY } from '@/packages/blocks/registry';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import { insertCanvasBlock } from './campaign-block-insert';
import { normalizeDocument } from './document-lifecycle';
import { getPageBlocks } from './studio-compat.js';

describe('insert pipeline — Hero+Form only catalog', () => {
  it('catalog exposes hero blocks from packages registry', () => {
    expect(BLOCK_REGISTRY.map((b) => b.type)).toContain('hero_universal');
  });

  it('inserts hero-form on blank page with image + multi-step form', () => {
    const blank = createBlankCanvasDocument();
    const result = insertCanvasBlock(blank, 'hero-form-unified');
    const document = normalizeDocument(result.document);

    expect(getPageBlocks(document)).toHaveLength(1);
    expect(document.meta.templateId).toBe('campaign-hero-form');

    const hero = getPageBlocks(document)[0];
    expect(hero.kind).toBe('section');
    expect(hero.props.blockType).toBe('hero-showroom');
    expect(hero.children || []).toHaveLength(0);
  });
});
