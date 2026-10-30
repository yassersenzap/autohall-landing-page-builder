import type { BuilderNode } from '../types/nodes.types';
import {
  IMAGE_LAYER_NAME,
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from './hero-layers';
import { isHeroContentElement } from './studio-compat.js';
import { getNodeGeometryRole } from './geometry/geometry-roles';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text';

export function isHeroMediaHitTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('[data-v4-geometry-role="hero-overlay-text"]')) return false;
  if (target.closest('[data-v4-hero-media="true"]')) return true;
  if (target.closest('.v4-media-image__img, .v4-image-node__img, .v4-image-node__placeholder')) {
    return Boolean(
      target.closest(`[data-v4-name="${IMAGE_LAYER_NAME}"], [data-v4-name="HeroImage"]`),
    );
  }
  return false;
}

export function isHeroContentTextHit(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('[data-v4-geometry-role="hero-overlay-text"]')) return false;
  return Boolean(target.closest('[data-v4-editable="true"]'));
}

export function isCanvasNodeSelectableInTree(
  node: BuilderNode,
  rootId: string,
  nodes: Record<string, BuilderNode>,
): boolean {
  if (node.id === rootId) return false;
  if (node.visibility.hidden) return false;
  if (isContentLayerNode(node)) return true;
  if (isImageLayerNode(node)) return true;
  if (isFormLayerNode(node)) return true;
  if (isHeroContentElement(node)) return true;
  if (getNodeGeometryRole(node, nodes) === 'hero-content-layer') return true;
  if (node.kind === 'text' && node.name === 'HeroText') return true;
  if (isHeroOverlayTextNode(node, nodes)) return true;
  return true;
}

/** Canvas hit → V2 business layer (Image / Content / Form) or HeroBlock. */
export function resolveCanvasClickSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
  _target: EventTarget | null,
): string {
  if (!node) return '';
  if (node.parentId === null) return node.id;

  const rootId = Object.keys(nodes).find(key => nodes[key] && nodes[key].parentId === null) || 'root';
  let current: BuilderNode | undefined = node;

  while (current && current.parentId !== rootId && current.parentId !== null) {
    current = nodes[current.parentId];
  }

  if (current && current.parentId === rootId) {
    return current.id;
  }

  return node.id;
}

export function resolveSelectionFromDomTarget(
  target: EventTarget | null,
  nodes: Record<string, BuilderNode>,
): string | null {
  if (!(target instanceof HTMLElement)) return null;

  const heroBlockShell = target.closest('[data-v4-name="HeroBlock"]');
  if (heroBlockShell) {
    const heroBlockId = heroBlockShell.getAttribute('data-v4-node-id');
    if (heroBlockId && nodes[heroBlockId]) {
      const innerNode = target.closest('[data-v4-node-id]');
      if (innerNode instanceof HTMLElement && innerNode !== heroBlockShell) {
        const innerId = innerNode.getAttribute('data-v4-node-id');
        if (innerId && nodes[innerId]) {
          return resolveCanvasClickSelection(nodes[innerId], nodes, target);
        }
      }
    }
  }

  const selectable = target.closest('[data-v4-selectable="true"]');
  if (selectable instanceof HTMLElement) {
    const id = selectable.getAttribute('data-v4-node-id');
    if (id && nodes[id]) return resolveCanvasClickSelection(nodes[id], nodes, target);
  }

  const shell = target.closest('[data-v4-node-id]');
  if (shell instanceof HTMLElement) {
    const id = shell.getAttribute('data-v4-node-id');
    if (id && nodes[id]) return resolveCanvasClickSelection(nodes[id], nodes, target);
  }

  return null;
}
