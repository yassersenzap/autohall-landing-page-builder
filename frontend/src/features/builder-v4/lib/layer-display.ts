import type { BuilderNode } from '../types/nodes.types';
import {
  isHeroFormBlock,
  isSectionBlock,
  getSectionBlockLabel,
  isHeroContentElement,
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  HERO_FORM_BLOCK_NAME,
  HERO_CONTENT_NODE_NAMES,
} from './studio-compat.js';
import { isHeroOverlayTextNode } from './geometry/hero-overlay-text.js';

const HIDDEN_LAYER_NAMES = new Set(['Placeholder', 'HeroText', 'HeroContentGroup']);

export type LayerTreeEntry =
  | { type: 'node'; node: BuilderNode }
  | { type: 'content-tab'; heroBlockId: string };

export function isLayerHidden(
  node: BuilderNode | undefined,
  nodes?: Record<string, BuilderNode>,
): boolean {
  if (!node) return true;
  if (HIDDEN_LAYER_NAMES.has(node.name)) return true;
  if (nodes && isHeroOverlayTextNode(node, nodes)) return true;
  return false;
}

export function getLayerDisplayName(
  node: BuilderNode,
  nodes?: Record<string, BuilderNode>,
): string {
  if (node.kind === 'frame' && node.parentId === null) return 'Page';
  const blockType = (node.props as any)?.blockType;
  if (blockType === 'brand-navbar' || node.name === 'BrandNavbar' || node.name === 'brand-navbar') return 'Brand Navbar';
  if (blockType === 'multi-step-test-drive' || node.name === 'MultiStepTestDrive' || node.name === 'multi-step-test-drive') return 'Multi-Step Test Drive (Gamme HEV)';
  if (blockType === 'footer-block' || node.name === 'Footer' || node.name === 'footer-block') return 'Footer / Mentions Légales';
  if (isHeroFormBlock(node)) {
    return (node.props as { label?: string }).label?.trim() || 'Hero + Form';
  }
  if (isSectionBlock(node)) return getSectionBlockLabel(node);
  if (node.name === IMAGE_LAYER_NAME) return 'Image';
  if (node.name === CONTENT_LAYER_NAME) return 'Contenu';
  if (node.name === FORM_LAYER_NAME) return 'Formulaire';
  if (node.name === HERO_CONTENT_NODE_NAMES.badge) return 'Badge';
  if (node.name === HERO_CONTENT_NODE_NAMES.title) return 'Title';
  if (node.name === HERO_CONTENT_NODE_NAMES.subtitle) return 'Subtitle';
  if (node.name === HERO_CONTENT_NODE_NAMES.cta) return 'CTA';
  if (node.name === 'HeroDescription') return 'Description';
  if (node.name === 'HeroList') return 'Liste';
  if (isHeroContentElement(node)) return node.name;
  if (nodes && isHeroOverlayTextNode(node, nodes)) return 'Content';
  return node.name;
}

export function resolveLayerChildren(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
  _rootId?: string,
): BuilderNode[] {
  if (node.kind === 'frame' && node.parentId === null) {
    return node.children
      .map((id) => nodes[id])
      .filter((child): child is BuilderNode => Boolean(child));
  }
  if (node.kind === 'section') return [];
  return node.children
    .map((id) => nodes[id])
    .filter((child): child is BuilderNode => Boolean(child && !isLayerHidden(child, nodes)));
}

export function resolveLayerTreeEntries(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
  _rootId?: string,
): LayerTreeEntry[] {
  if (node.kind === 'frame' && node.parentId === null) {
    return node.children
      .map((id) => nodes[id])
      .filter((child): child is BuilderNode => Boolean(child))
      .map((child) => ({ type: 'node' as const, node: child }));
  }
  if (node.kind === 'stack' || node.kind === 'card' || node.kind === 'image') {
    return node.children
      .map((id) => nodes[id])
      .filter((child): child is BuilderNode => Boolean(child && !isLayerHidden(child, nodes)))
      .map((child) => ({ type: 'node' as const, node: child }));
  }
  return [];
}

export function resolveLayerEntryId(entry: LayerTreeEntry): string {
  if (entry.type === 'content-tab') return `content-tab:${entry.heroBlockId}`;
  return entry.node.id;
}

export function resolveLayerEntrySelectionId(entry: LayerTreeEntry): string {
  if (entry.type === 'content-tab') return entry.heroBlockId;
  return entry.node.id;
}

export function getLayerBreadcrumbTrail(
  id: string,
  nodes: Record<string, BuilderNode>,
): BuilderNode[] {
  const trail: BuilderNode[] = [];
  let current: BuilderNode | undefined = nodes[id];
  const frame = Object.values(nodes).find((n) => n.kind === 'frame' && !n.parentId);

  while (current) {
    if (!isLayerHidden(current, nodes)) trail.unshift(current);
    if (current.kind === 'frame') break;
    if (isHeroFormBlock(current)) break;
    current = current.parentId ? nodes[current.parentId] : undefined;
  }

  if (frame && !trail.some((n) => n.id === frame.id)) trail.unshift(frame);
  return trail;
}

export { HERO_FORM_BLOCK_NAME as HERO_BLOCK_NAME };
