import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { insertHeroOverlayText } from './geometry/hero-overlay-text';
import { resolveCampaignDeleteTarget } from './campaign-delete';
import { deleteCampaignNode } from './heal-document-legacy-content';
import {
  findCampaignLayoutNodes,
  resolveCampaignComposition,
} from './geometry/hero-layout-engine';

function findByName(doc: ReturnType<typeof createPopulatedHeroFormDocument>, name: string) {
  return Object.values(doc.nodes).find((node) => node.name === name);
}

describe('campaign-delete', () => {
  it('deleting Form selection removes entire Hero + Form block', () => {
    const doc = createPopulatedHeroFormDocument();
    const formCard = findByName(doc, 'FormLayer')!;
    const heroBlock = findByName(doc, 'HeroFormSection')!;
    const target = resolveCampaignDeleteTarget(doc, formCard.id);

    expect(target).toBe(heroBlock.id);

    const next = deleteCampaignNode(doc, target!);
    expect(findByName(next, 'HeroFormSection')).toBeUndefined();
    expect(findByName(next, 'FormLayer')).toBeUndefined();
    expect(findByName(next, 'ImageLayer')).toBeUndefined();
    expect(next.meta.templateId).toBe('blank');
  });

  it('deleting overlay text removes only the text node', () => {
    const doc = createPopulatedHeroFormDocument();
    const heroImage = findByName(doc, 'ImageLayer')!;
    const inserted = insertHeroOverlayText(doc.nodes, heroImage.id, { text: 'Promo' }, doc.rootId)!;
    const next = deleteCampaignNode(
      { ...doc, nodes: inserted.nodes },
      inserted.textId,
    );
    expect(next.nodes[inserted.textId]).toBeUndefined();
    expect(findByName(next, 'ImageLayer')).toBeDefined();
    expect(findByName(next, 'FormLayer')).toBeDefined();
  });

  it('deleting hero image resolves to Hero + Form block removal', () => {
    let doc = createPopulatedHeroFormDocument();
    const heroImage = findByName(doc, 'ImageLayer')!;
    doc = deleteCampaignNode(doc, heroImage.id);
    expect(doc.meta.templateId).toBe('blank');
  });
});
