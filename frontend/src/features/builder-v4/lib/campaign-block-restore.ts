import type { BuilderDocument } from '../types/nodes.types';
import { findHeroFormBlock, insertHeroFormBlock } from './studio-compat.js';
import { isCampaignTemplate } from './campaign-structure.js';
import { findImageLayer, findFormLayer } from './hero-layers.js';

export function restoreCampaignHeroImage(document: BuilderDocument): BuilderDocument {
  if (!isCampaignTemplate(document)) return document;
  const hero = findHeroFormBlock(document);
  if (hero && findImageLayer(document.nodes, document.rootId)) return document;
  return insertHeroFormBlock(document).document;
}

export function restoreCampaignForm(document: BuilderDocument): BuilderDocument {
  if (!isCampaignTemplate(document)) return document;
  const hero = findHeroFormBlock(document);
  if (hero && findFormLayer(document.nodes, document.rootId)) return document;
  return insertHeroFormBlock(document).document;
}

export function restoreFullCampaignTemplate(document: BuilderDocument): BuilderDocument {
  const hero = findHeroFormBlock(document);
  if (hero) {
    return {
      ...document,
      meta: { ...document.meta, templateId: 'campaign-hero-form' },
    };
  }
  const result = insertHeroFormBlock(document);
  return {
    ...result.document,
    meta: { ...result.document.meta, templateId: 'campaign-hero-form' },
  };
}

export function campaignBlockStatus(document: BuilderDocument): {
  hasHeroImage: boolean;
  hasForm: boolean;
} {
  const hero = findHeroFormBlock(document);
  if (!hero) {
    return { hasHeroImage: false, hasForm: false };
  }
  return {
    hasHeroImage: Boolean(findImageLayer(document.nodes, document.rootId)),
    hasForm: Boolean(findFormLayer(document.nodes, document.rootId)),
  };
}
