import type { BuilderNode, NodeLayout } from '../types/nodes.types';

const FLOW_POSITION_KEYS = ['position', 'left', 'top', 'right', 'bottom'] as const;

/** P5.5-R1: off by default — enable with VITE_SANITIZE_FLOW_LAYOUT=true */
export function isFlowLayoutSanitizeEnabled(): boolean {
  return import.meta.env.VITE_SANITIZE_FLOW_LAYOUT === 'true';
}

/** Node lives inside grid/flex/stack — no absolute coordinates. */
export function isFlowLayoutChild(node: BuilderNode, parentNode?: BuilderNode | null): boolean {
  if (!parentNode) return false;
  if (parentNode.layout.display === 'grid') return true;
  if (parentNode.layout.display === 'flex') return true;
  if (parentNode.kind === 'stack') return true;
  if (node.layout.gridColumn) return true;
  return false;
}

/** Strip absolute positioning from flow children — opt-in only. Never strip dragged nodes. */
export function sanitizeFlowLayout(
  layout: NodeLayout,
  node: BuilderNode,
  parentNode?: BuilderNode | null,
): NodeLayout {
  if (!isFlowLayoutSanitizeEnabled()) return layout;
  if (layout.position === 'absolute') return layout;
  if (!isFlowLayoutChild(node, parentNode)) return layout;

  const next = { ...layout };
  for (const key of FLOW_POSITION_KEYS) {
    delete next[key];
  }
  return next;
}

export function layoutSizeFromBox(box: { width: number; height: number }): Partial<NodeLayout> {
  return {
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}
