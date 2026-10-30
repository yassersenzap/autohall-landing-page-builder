import { describe, expect, it } from 'vitest';
import { createPopulatedHeroFormDocument } from '../templates/campaign-hero-form';
import { createBlankCanvasDocument } from '../templates/blank-canvas';
import {
  hasCampaignStructureNodes,
  isCleanBlankCanvasDocument,
  sanitizeBlankCanvasDocument,
} from './heal-blank-canvas';

describe('heal-blank-canvas', () => {
  it('detects clean blank canvas', () => {
    const doc = createBlankCanvasDocument();
    expect(isCleanBlankCanvasDocument(doc)).toBe(true);
    expect(hasCampaignStructureNodes(doc)).toBe(false);
  });

  it('sanitizes blank template polluted with campaign nodes', () => {
    const campaign = createPopulatedHeroFormDocument();
    const polluted = {
      ...createBlankCanvasDocument(),
      nodes: campaign.nodes,
      rootId: campaign.rootId,
    };

    expect(hasCampaignStructureNodes(polluted)).toBe(true);
    const healed = sanitizeBlankCanvasDocument(polluted);
    expect(isCleanBlankCanvasDocument(healed)).toBe(true);
    expect(healed.meta.templateId).toBe('blank');
  });
});
