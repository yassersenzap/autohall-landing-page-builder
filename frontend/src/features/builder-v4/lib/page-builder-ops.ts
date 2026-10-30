import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { normalizeDocument } from './document-lifecycle.js';
import {
  getPageBlocks,
  isPageEmpty,
  isHeroFormBlock,
  isSectionBlock,
  getSectionBlockLabel,
  createEmptyPageDocument,
  isHeroContentElement,
} from './studio-compat.js';
import {
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from './hero-layers.js';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';
import { findHeroBlockAncestor } from './hero-block-lifecycle';
import { deleteNodeFromDocument } from './node-tree-ops';
import { getLayerDisplayName } from './layer-display';
import { healCampaignDocument } from './heal-campaign-document';

/** Top-level blocks on the page (direct children of Frame). */
export function isPageBlock(document: BuilderDocument, node: BuilderNode): boolean {
  const frame = document.nodes[document.rootId];
  return Boolean(frame?.children.includes(node.id));
}

export function findPageBlockForNode(
  document: BuilderDocument,
  nodeId: string,
): BuilderNode | undefined {
  const node = document.nodes[nodeId];
  if (!node) return undefined;
  if (isPageBlock(document, node)) return node;

  const hero = findHeroBlockAncestor(node, document.nodes);
  if (hero) return hero;

  let current: BuilderNode | undefined = node;
  while (current?.parentId) {
    const parent: BuilderNode | undefined = document.nodes[current.parentId];
    if (parent && isPageBlock(document, parent)) return parent;
    current = parent;
  }
  return undefined;
}

/**
 * Maps selection → the actual node to delete.
 *
 * Rules (in priority order):
 * 1. Root → reset to blank canvas.
 * 2. Hero overlay text / hero content element → delete individually.
 * 3. Node is a direct root child (page block / section) → delete the section as a unit.
 * 4. Node is inside a HeroFormSection → escalate to the hero form block.
 * 5. Node is inside a regular section → delete just the node itself (granular control).
 */
export function resolvePageDeleteTarget(document: BuilderDocument, nodeId: string): string | null {
  const node = document.nodes[nodeId];
  if (!node) return null;
  if (node.id === document.rootId) return nodeId;

  if (isHeroOverlayTextNode(node, document.nodes) || node.name === 'HeroText') {
    return nodeId;
  }
  if (isHeroContentElement(node)) return nodeId;

  // Node is a direct root child → delete as a page block (whole section)
  if (isPageBlock(document, node)) return nodeId;

  // Node is inside a HeroFormSection → escalate to the hero form
  const heroAncestor = findHeroBlockAncestor(node, document.nodes);
  if (heroAncestor) return heroAncestor.id;

  // Node is inside a regular section → delete just this node
  return nodeId;
}

export function canDeletePageNode(document: BuilderDocument, nodeId: string): boolean {
  const node = document.nodes[nodeId];
  if (!node) return false;

  // Root always deletable (resets canvas)
  if (node.id === document.rootId) return true;

  // Hero overlay text
  if (isHeroOverlayTextNode(node, document.nodes) || node.name === 'HeroText') return true;

  // Hero content elements (badge, title, subtitle, cta inside hero form)
  if (isHeroContentElement(node)) return true;

  // Direct root children (sections, page blocks)
  if (isPageBlock(document, node)) return true;

  // Inside a hero form → check if hero form itself is deletable
  const heroAncestor = findHeroBlockAncestor(node, document.nodes);
  if (heroAncestor) return isHeroFormBlock(heroAncestor);

  // Inside a regular section: any content node is deletable individually
  const DELETABLE_KINDS: Set<string> = new Set(['text', 'image', 'button', 'form', 'card', 'stack', 'section']);
  if (DELETABLE_KINDS.has(node.kind)) return true;

  return false;
}

const KIND_LABELS: Partial<Record<string, string>> = {
  text: 'le texte',
  image: "l'image",
  button: 'le bouton',
  form: 'le formulaire',
  card: 'la carte',
  stack: 'le groupe',
  section: 'la section',
};

export function pageDeleteLabel(document: BuilderDocument, nodeId: string): string {
  const targetId = resolvePageDeleteTarget(document, nodeId);
  const target = targetId ? document.nodes[targetId] : undefined;
  if (!target) return 'ce bloc';

  if (isHeroFormBlock(target)) return 'Hero + Form';
  if (isSectionBlock(target)) return getSectionBlockLabel(target);
  if (isHeroOverlayTextNode(target, document.nodes) || target.name === 'HeroText') return 'le texte';
  if (isHeroContentElement(target)) return getLayerDisplayName(target, document.nodes).toLowerCase();

  return KIND_LABELS[target.kind] ?? getLayerDisplayName(target, document.nodes).toLowerCase();
}

export function canDuplicatePageNode(document: BuilderDocument, nodeId: string): boolean {
  const node = document.nodes[nodeId];
  if (!node || node.id === document.rootId) return false;

  if (isHeroOverlayTextNode(node, document.nodes) || node.name === 'HeroText') {
    return true;
  }

  // Hero layer nodes (ImageLayer, ContentLayer, FormLayer) cannot be duplicated
  if (isHeroLayerNode(node) && !isPageBlock(document, node)) {
    return false;
  }

  // Direct root children (sections) are always duplicatable
  if (isPageBlock(document, node)) return true;

  // Inside a hero form → not duplicatable (too complex)
  const heroAncestor = findHeroBlockAncestor(node, document.nodes);
  if (heroAncestor) return false;

  // Inside a regular section: allow duplicating content nodes
  const DUPLICABLE_KINDS: Set<string> = new Set(['text', 'image', 'button', 'card', 'stack', 'form']);
  return DUPLICABLE_KINDS.has(node.kind);
}

export function listPageBlocks(document: BuilderDocument): BuilderNode[] {
  return getPageBlocks(document);
}

export function isHeroLayerNode(node: BuilderNode): boolean {
  return isImageLayerNode(node) || isContentLayerNode(node) || isFormLayerNode(node);
}

/**
 * Delete pipeline — resolves page block, removes subtree, resets blank page when empty.
 */
export function deletePageBlock(document: BuilderDocument, nodeId: string): BuilderDocument {
  const node = document.nodes[nodeId];
  if (!node) return document;

  if (nodeId === document.rootId) {
    return createEmptyPageDocument();
  }

  if (!canDeletePageNode(document, nodeId)) return document;

  const targetId = resolvePageDeleteTarget(document, nodeId) ?? nodeId;

  if (targetId === document.rootId) {
    return createEmptyPageDocument();
  }

  if (
    targetId === nodeId
    && (isHeroOverlayTextNode(node, document.nodes) || node.name === 'HeroText' || isHeroContentElement(node))
  ) {
    const next = deleteNodeFromDocument(document, nodeId);
    return next === document ? document : healCampaignDocument(next);
  }

  const next = deleteNodeFromDocument(document, targetId);
  if (next === document) return document;

  if (isPageEmpty(next)) {
    return createEmptyPageDocument();
  }

  return normalizeDocument(next);
}
