import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { findHeroBlock } from './hero-block';
import {
  findHeroBlockAncestor,
  resolveHeroBusinessSelection,
  resolveCanvasInspectorTab,
} from './hero-block-lifecycle';
import { resolveCanvasClickSelection } from './canvas-selection';
import { deleteCampaignNode } from './heal-document-legacy-content';
import { canDuplicateCampaignNode } from './campaign-duplicate';
import { FORM_LAYER_NAME, IMAGE_LAYER_NAME } from './hero-layers';

describe('hero-block-lifecycle V2', () => {
  const doc = createPopulatedHeroFormDocument();
  const heroBlock = findHeroBlock(doc.nodes, doc.rootId)!;
  const imageLayer = Object.values(doc.nodes).find((n) => n.name === IMAGE_LAYER_NAME)!;
  const formLayer = Object.values(doc.nodes).find((n) => n.name === FORM_LAYER_NAME)!;

  it('maps layer nodes to their own selection id', () => {
    expect(resolveHeroBusinessSelection(imageLayer, doc.nodes)).toBe(imageLayer.id);
    expect(resolveHeroBusinessSelection(formLayer, doc.nodes)).toBe(formLayer.id);
    expect(findHeroBlockAncestor(imageLayer, doc.nodes)?.id).toBe(heroBlock.id);
  });

  it('canvas click on hero image selects HeroBlock section', () => {
    const id = resolveCanvasClickSelection(imageLayer, doc.nodes, null);
    expect(id).toBe(heroBlock.id);
  });

  it('resolves inspector tab from form hit', () => {
    const el = document.createElement('div');
    el.className = 'v4-form-node';
    expect(resolveCanvasInspectorTab(el)).toBe('form');
  });

  it('deleting HeroBlock yields blank canvas', () => {
    const next = deleteCampaignNode(doc, heroBlock.id);
    expect(next.meta.templateId).toBe('blank');
    expect(findHeroBlock(next.nodes, next.rootId)).toBeUndefined();
  });

  it('allows duplicate of HeroFormSection but rejects child layers', () => {
    expect(canDuplicateCampaignNode(doc, heroBlock.id)).toBe(true);
    expect(canDuplicateCampaignNode(doc, imageLayer.id)).toBe(false);
  });
});

describe('confirmHeroBlockDelete', () => {
  it('always allows delete (confirm removed for embedded preview compatibility)', async () => {
    const { confirmHeroBlockDelete } = await import('./hero-block-lifecycle');
    expect(confirmHeroBlockDelete()).toBe(true);
  });
});
