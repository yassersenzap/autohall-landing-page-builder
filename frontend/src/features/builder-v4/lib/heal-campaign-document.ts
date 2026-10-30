import type { BuilderDocument } from '../types/nodes.types';
import {
  createEmptyPageDocument,
  findHeroFormBlock,
  findHeroFormLayers,
  isPageEmpty,
  isHeroFormBlock,
} from './studio-compat.js';
import { isCampaignTemplate } from './campaign-structure';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';

/** Document has invalid campaign structure (orphans, incomplete hero). */
export function isCampaignBroken(document: BuilderDocument): boolean {
  if (!isCampaignTemplate(document)) return false;
  const frame = document.nodes[document.rootId];
  if (!frame) return true;

  for (const childId of frame.children) {
    const child = document.nodes[childId];
    if (child && isHeroOverlayTextNode(child, document.nodes)) return true;
  }

  const hero = findHeroFormBlock(document);
  if (hero && !findHeroFormLayers(document, hero.id)) return true;
  return false;
}

/** Normalize after edits — empty page becomes blank template; drop broken frame refs. */
export function healCampaignDocument(document: BuilderDocument): BuilderDocument {
  if (isPageEmpty(document)) {
    const blank = createEmptyPageDocument();
    return { ...blank, meta: { ...blank.meta, title: document.meta.title || blank.meta.title } };
  }

  if (!isCampaignTemplate(document)) return document;

  const frame = document.nodes[document.rootId];
  if (!frame) return createEmptyPageDocument();

  const prunedNodes = { ...document.nodes };
  const nextChildren: string[] = [];

  for (const id of frame.children) {
    const node = document.nodes[id];
    if (!node) continue;
    if (isHeroOverlayTextNode(node, document.nodes)) {
      delete prunedNodes[id];
      continue;
    }
    if (isHeroFormBlock(node)) {
      // Multiple hero blocks are allowed, no deduplication.
    }
    nextChildren.push(id);
  }

  return {
    ...document,
    nodes: {
      ...prunedNodes,
      [frame.id]: { ...frame, children: nextChildren },
    },
  };
}
