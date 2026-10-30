import type { BuilderDocument } from '../types/nodes.types';
import { isPageEmpty, getPageBlocks } from './studio-compat.js';
import { healCampaignDocument } from './heal-campaign-document';
import { isHeroBlockNode } from './hero-block-lifecycle';

const BLANK_TEMPLATE_ID = 'blank';
const PAGE_TEMPLATE_ID = 'page';
const CAMPAIGN_TEMPLATE_ID = 'campaign-hero-form';

/**
 * Keeps meta.templateId aligned with page content.
 * Blank templateId hides the frame in the canvas renderer — blocks must exit blank mode on insert.
 */
export function syncPageDocumentMeta(document: BuilderDocument): BuilderDocument {
  const empty = isPageEmpty(document);

  if (empty) {
    if (document.meta.templateId === BLANK_TEMPLATE_ID) return document;
    return {
      ...document,
      meta: {
        ...document.meta,
        title: 'Page vide',
        templateId: BLANK_TEMPLATE_ID,
      },
    };
  }

  if (document.meta.templateId !== BLANK_TEMPLATE_ID) return document;

  const hasHero = getPageBlocks(document).some(isHeroBlockNode);
  return {
    ...document,
    meta: {
      ...document.meta,
      title: hasHero ? 'Campagne Hero + Form' : 'Page',
      templateId: hasHero ? CAMPAIGN_TEMPLATE_ID : PAGE_TEMPLATE_ID,
    },
  };
}

/** Page has zero blocks. */
export function isDocumentEmpty(document: BuilderDocument): boolean {
  return isPageEmpty(document);
}

export function isCanvasEmpty(document: BuilderDocument): boolean {
  return isPageEmpty(document);
}

export function pageHasHeroBlock(document: BuilderDocument): boolean {
  return getPageBlocks(document).some(isHeroBlockNode);
}

export function isHeroBlockOnPage(document: BuilderDocument): boolean {
  return pageHasHeroBlock(document);
}

export function resolveHeroBlockSelectionId(document: BuilderDocument, nodeId?: string): string {
  if (nodeId) {
    const node = document.nodes[nodeId];
    if (node && isHeroBlockNode(node)) return node.id;
  }
  const hero = getPageBlocks(document).find(isHeroBlockNode);
  return hero?.id ?? nodeId ?? document.rootId;
}

export function normalizeDocument(document: BuilderDocument): BuilderDocument {
  return syncPageDocumentMeta(healCampaignDocument(document));
}
