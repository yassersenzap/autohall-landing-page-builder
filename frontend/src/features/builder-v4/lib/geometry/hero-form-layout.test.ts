import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../../templates/campaign-hero-form';
import { findHeroBlock } from '../../lib/hero-block.js';
import {
  applyHeroFormLayout,
  findHeroFormLayers,
  getHeroFormGeometry,
  DEFAULT_HERO_FORM_GEOMETRY,
} from '../studio-compat.js';
import type { FrameNodeProps } from '../../types/nodes.types';
import { FORM_LAYER_NAME, IMAGE_LAYER_NAME } from '../hero-layers';

describe('hero-form layout (studio)', () => {
  it('split mode uses 72/28 safe-zone columns on HeroFormSection', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroBlock = findHeroBlock(doc.nodes, doc.rootId);
    const frame = doc.nodes[doc.rootId];
    const geo = (frame.props as FrameNodeProps & { heroFormGeometry?: typeof DEFAULT_HERO_FORM_GEOMETRY }).heroFormGeometry;

    expect(geo?.mode).toBe('split');
    expect(geo?.leftRatio).toBe(72);
    expect(geo?.rightRatio).toBe(28);
    expect(heroBlock?.layout.columns).toBe('72fr 28fr');
    expect(heroBlock?.layout.minHeight).toBe(720);
    expect(frame.layout.display).toBe('flex');
    expect(frame.layout.columns).toBeUndefined();
  });

  it('applyHeroFormLayout syncs ImageLayer and FormLayer grid placement', () => {
    const doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    const layers = findHeroFormLayers(doc, hero.id)!;
    expect(layers.image.name).toBe(IMAGE_LAYER_NAME);
    expect(layers.form.name).toBe(FORM_LAYER_NAME);
    expect(layers.image.layout.gridColumn).toBe('1 / 2');
    expect(layers.form.layout.gridColumn).toBe('2 / 3');
    expect(layers.image.layout.position).not.toBe('absolute');
    expect(layers.form.layout.position).not.toBe('absolute');
  });

  it('floating-card keeps safe-zone columns — no content overlay', () => {
    let doc = createPopulatedHeroFormDocument();
    const hero = findHeroBlock(doc.nodes, doc.rootId)!;
    const geo = { ...getHeroFormGeometry(doc), mode: 'floating-card' as const };
    doc = applyHeroFormLayout(doc, hero.id, geo);

    const layers = findHeroFormLayers(doc, hero.id)!;
    const heroBlock = doc.nodes[hero.id];
    expect(heroBlock.layout.columns).toBe('72fr 28fr');
    expect(layers.image.layout.gridColumn).toBe('1 / 2');
    expect(layers.form.layout.gridColumn).toBe('2 / 3');
    expect(layers.form.layout.position).toBe('relative');
  });
});
