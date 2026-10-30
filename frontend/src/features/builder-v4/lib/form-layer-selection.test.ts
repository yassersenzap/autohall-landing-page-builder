import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { resolveFormLayerSelection, isFormInternalNode } from './form-layer-selection';
import { FORM_LAYER_NAME } from './hero-layers';

describe('form-layer-selection V2', () => {
  const doc = createPopulatedHeroFormDocument();
  const nodes = doc.nodes;
  const formLayer = Object.values(nodes).find((node) => node.name === FORM_LAYER_NAME)!;

  it('keeps FormLayer selection', () => {
    expect(resolveFormLayerSelection(formLayer, nodes)).toBe(formLayer.id);
  });

  it('FormLayer is not internal', () => {
    expect(isFormInternalNode(formLayer)).toBe(false);
  });
});
