import { describe, expect, it } from 'vitest';
import { createCampaignHeroFormDocument } from '../templates/campaign-hero-form';
import { findHeroBlock } from '../lib/hero-block';
import { findHeroFormLayers, insertHeroFormBlock, DEFAULT_HERO_FORM_GEOMETRY } from '../lib/studio-compat.js';
import { FORM_LAYER_NAME, IMAGE_LAYER_NAME } from '../lib/hero-layers';
import type { FrameNodeProps, FormNodeProps } from '../types/nodes.types';
import { isDocumentEmpty } from '../lib/document-lifecycle';
import { engineCanDrag } from '../lib/engine-node-matrix';
import { insertHeroOverlayText } from '../lib/geometry/hero-overlay-text';

describe('createCampaignHeroFormDocument', () => {
  it('starts as empty page (Phase 0)', () => {
    const doc = createCampaignHeroFormDocument();
    expect(isDocumentEmpty(doc)).toBe(true);
    expect(findHeroBlock(doc.nodes, doc.rootId)).toBeUndefined();
  });

  it('insert builds HeroFormSection → ImageLayer + FormLayer (no content)', () => {
    const empty = createCampaignHeroFormDocument();
    const { document: doc } = insertHeroFormBlock(empty);
    const root = doc.nodes[doc.rootId];
    const heroBlock = findHeroBlock(doc.nodes, doc.rootId)!;
    const layers = findHeroFormLayers(doc, heroBlock.id)!;

    expect(root.kind).toBe('frame');
    expect((root.props as FrameNodeProps).heroFormGeometry).toMatchObject({
      mode: DEFAULT_HERO_FORM_GEOMETRY.mode,
      leftRatio: DEFAULT_HERO_FORM_GEOMETRY.leftRatio,
      rightRatio: DEFAULT_HERO_FORM_GEOMETRY.rightRatio,
      minHeight: DEFAULT_HERO_FORM_GEOMETRY.minHeight,
    });
    expect(heroBlock.name).toBe('HeroFormSection');
    expect(heroBlock.layout.columns).toBe('72fr 28fr');
    expect(layers.image.parentId).toBe(heroBlock.id);
    expect(layers.form.parentId).toBe(heroBlock.id);
    expect(heroBlock.children).toHaveLength(2);

    const formProps = layers.form.props as FormNodeProps;
    expect(formProps.variant).toBe('campaign');
    expect(formProps.steps?.length).toBe(3);
    expect(formProps.fields.length).toBeGreaterThan(0);

    expect(engineCanDrag(layers.image, doc.rootId)).toBe(false);
    expect(engineCanDrag(layers.form, doc.rootId, doc.nodes)).toBe(false);

    const overlay = insertHeroOverlayText(doc.nodes, layers.image.id, { text: 'Essai' }, doc.rootId);
    expect(overlay).not.toBeNull();

    expect(layers.image.name).toBe(IMAGE_LAYER_NAME);
    expect(layers.form.name).toBe(FORM_LAYER_NAME);
  });
});
