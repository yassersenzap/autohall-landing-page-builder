import type { BuilderNode } from '../types/nodes.types';
import {
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from './hero-layers';
import { isHeroFormBlock, HERO_FORM_BLOCK_NAME } from './studio-compat.js';

/** @deprecated use HERO_FORM_BLOCK_NAME */
export const HERO_BLOCK_NAME = HERO_FORM_BLOCK_NAME;

/** Canvas / Layers → business layer selection (V2). */
export function resolveHeroLayerSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
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

/** Unified business selection for Layers, Breadcrumb, selectNode. */
export function resolveBusinessLayerSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): string {
  return resolveHeroLayerSelection(node, nodes);
}

export function resolveVirtualLayerSelection(
  virtualId: string,
  nodes: Record<string, BuilderNode>,
): string {
  if (virtualId.endsWith('__hero-layout') || virtualId.endsWith('__content-placeholder')) {
    const heroBlockId = virtualId.replace(/__(hero-layout|content-placeholder)$/, '');
    return nodes[heroBlockId] ? heroBlockId : virtualId;
  }
  return virtualId;
}

export function isHeroBusinessLayer(node: BuilderNode): boolean {
  return (
    isHeroFormBlock(node)
    || isImageLayerNode(node)
    || isContentLayerNode(node)
    || isFormLayerNode(node)
  );
}

export { IMAGE_LAYER_NAME, CONTENT_LAYER_NAME, FORM_LAYER_NAME };
