import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { isPageBlock, isHeroLayerNode } from './page-builder-ops';
import { isHeroFormBlock, isSectionBlock } from './studio-compat.js';
import { IMAGE_LAYER_NAME } from './hero-layers';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';

export function isCampaignTemplate(_document: BuilderDocument): boolean {
  return true;
}

export function isCampaignStructureNode(node: BuilderNode): boolean {
  return isHeroLayerNode(node);
}

export function isCampaignLayoutNode(node: BuilderNode): boolean {
  return isHeroFormBlock(node) || isHeroLayerNode(node);
}

/** Page-level blocks can reorder in Layers; hero internal layers are locked. */
export function isLayerDragEnabled(document: BuilderDocument, node: BuilderNode): boolean {
  if (node.id === document.rootId) return false;
  if (isPageBlock(document, node)) return true;
  if (isHeroOverlayTextNode(node, document.nodes) || node.name === 'HeroText') return true;
  return false;
}

export function canReparentCampaignNode(
  document: BuilderDocument,
  nodeId: string,
  newParentId: string,
): boolean {
  const node = document.nodes[nodeId];
  const newParent = document.nodes[newParentId];
  if (!node || !newParent) return false;

  if (nodeId === document.rootId) return false;

  if (isPageBlock(document, node) && newParent.id === document.rootId) {
    return true;
  }

  if (isHeroOverlayTextNode(node, document.nodes)) {
    return newParent.name === IMAGE_LAYER_NAME || newParent.name === 'ContentLayer';
  }

  if (isHeroLayerNode(node) || isHeroFormBlock(node)) {
    return node.parentId === newParentId;
  }

  if (isSectionBlock(node)) {
    return newParent.id === document.rootId;
  }

  return false;
}
