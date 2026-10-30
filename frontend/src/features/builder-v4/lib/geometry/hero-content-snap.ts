import type { BuilderNode, NodeLayout } from '../../types/nodes.types';
import type { HeroContentAnchor, HeroSafeInset } from '../../types/geometry.types';
import { getDefaultSafeInset } from './hero-safe-area';
import {
  HERO_CONTENT_GROUP_NAMES,
  isHeroContentGroupName,
  isHeroContentGroupNode,
} from './hero-safe-area';

export { HERO_CONTENT_GROUP_NAMES, isHeroContentGroupName };

/** @deprecated P5.8 — use hero-safe-area flex layout instead */
export function layoutForContentAnchor(
  anchor: HeroContentAnchor,
  zone: { width: number; height: number },
  content: { width: number; height: number },
  inset: HeroSafeInset = getDefaultSafeInset(),
): Pick<NodeLayout, 'position' | 'left' | 'top'> {
  const safeH = zone.height - inset.top - inset.bottom;
  const blockH = Math.min(content.height, safeH);

  let top = inset.top;
  const left = inset.left;

  switch (anchor) {
    case 'center-left':
      top = inset.top + Math.max(0, (safeH - blockH) / 2);
      break;
    case 'bottom-left':
      top = inset.top + Math.max(0, safeH - blockH);
      break;
    case 'top-left':
    default:
      top = inset.top;
      break;
  }

  return {
    position: 'absolute',
    left: Math.round(left),
    top: Math.round(top),
  };
}

export function isHeroContentChild(node: BuilderNode, nodes: Record<string, BuilderNode>): boolean {
  if (!node.parentId) return false;
  const parent = nodes[node.parentId];
  return parent ? isHeroContentGroupNode(parent, nodes) : false;
}

export function resolveHeroContentGroupSelection(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): string {
  if (isHeroContentGroupNode(node, nodes)) return node.id;
  if (isHeroContentChild(node, nodes)) return node.parentId!;
  if (node.name === 'HeroSafeArea') {
    const groupChild = node.children
      .map((id) => nodes[id])
      .find((child) => child && isHeroContentGroupNode(child, nodes));
    return groupChild?.id ?? node.id;
  }
  return node.id;
}
