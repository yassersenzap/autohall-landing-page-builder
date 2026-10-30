import type { BuilderNode } from '../types/nodes.types';
import type { BusinessInspectorTab } from './business-inspector-context';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';
import {
  IMAGE_LAYER_NAME,
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from './hero-layers';
import {
  HERO_FORM_BLOCK_NAME,
  HERO_FORM_SECTION_ALIASES,
  isHeroFormBlock,
} from './studio-compat.js';
import { isHeroBlockOnPage } from './document-lifecycle';
import { isHeroMediaHitTarget } from './canvas-selection';

export function findHeroBlockAncestor(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): BuilderNode | undefined {
  let current: BuilderNode | undefined = node;
  while (current) {
    if (isHeroFormBlock(current)) return current;
    current = current.parentId ? nodes[current.parentId] : undefined;
  }
  return undefined;
}

export function isHeroBlockNode(node: BuilderNode | undefined): boolean {
  return Boolean(node && isHeroFormBlock(node));
}

export function resolveHeroBusinessSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): string {
  if (isImageLayerNode(node) || isContentLayerNode(node) || isFormLayerNode(node)) {
    return node.id;
  }
  const heroBlock = findHeroBlockAncestor(node, nodes);
  if (heroBlock) return heroBlock.id;
  return node.id;
}

export function resolveCanvasInspectorTab(
  target: EventTarget | null,
): BusinessInspectorTab | null {
  if (!(target instanceof HTMLElement)) return null;

  if (target.closest('.v4-autohall-form, .v4-form-node, .v4-form-layer, [data-v4-editable="true"]')) {
    return 'form';
  }
  if (
    isHeroMediaHitTarget(target)
    || target.closest(`[data-v4-name="${IMAGE_LAYER_NAME}"], [data-v4-name="HeroImage"]`)
  ) {
    return 'image';
  }
  if (target.closest(`[data-v4-name="${HERO_FORM_BLOCK_NAME}"], [data-v4-name="HeroBlock"], [data-v4-name="HeroFormSection"]`)) return 'hero';
  return null;
}

export function confirmHeroBlockDelete(): boolean {
  return true;
}

export function shouldConfirmDelete(document: import('../types/nodes.types').BuilderDocument, nodeId: string): boolean {
  const node = document.nodes[nodeId];
  if (!node) return false;
  if (node.name === HERO_FORM_BLOCK_NAME || (HERO_FORM_SECTION_ALIASES as readonly string[]).includes(node.name)) return true;
  const heroBlock = findHeroBlockAncestor(node, document.nodes);
  return Boolean(heroBlock && nodeId === heroBlock.id);
}

export function pageHasHeroBlock(document: import('../types/nodes.types').BuilderDocument): boolean {
  return isHeroBlockOnPage(document);
}

export function isInsideHeroBlock(
  nodeId: string,
  nodes: Record<string, BuilderNode>,
): boolean {
  const node = nodes[nodeId];
  if (!node) return false;
  return Boolean(findHeroBlockAncestor(node, nodes));
}

export function isOverlayTextInHero(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): boolean {
  return isHeroOverlayTextNode(node, nodes) && Boolean(findHeroBlockAncestor(node, nodes));
}
