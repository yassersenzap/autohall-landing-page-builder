import type { BuilderNode, NodeLayout } from '../types/nodes.types';
import { getCanvasNodeCapabilities } from './canvas-node-capabilities';
import { parseLayoutPx } from './canvas-geometry';
import {
  applyConstraintsToDragBox,
  applyConstraintsToResizeBox,
  enforceLayoutConstraints,
} from './geometry/constraints-engine';
import { layoutSizeFromBox } from './layout-flow';
export type ElementBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Drag commit → absolute x/y in store, clamped to geometry zone. */
export function layoutFromDragBox(
  node: BuilderNode,
  box: ElementBox,
  rootId: string,
  container?: HTMLElement | null,
  nodes?: Record<string, BuilderNode>,
): Partial<NodeLayout> {
  const caps = getCanvasNodeCapabilities(node, rootId, nodes);
  if (!caps.canDrag) return {};

  const clamped =
    container != null ? applyConstraintsToDragBox(node, box, container) : box;

  return {
    position: 'absolute',
    left: Math.round(clamped.left),
    top: Math.round(clamped.top),
  };
}

/** Resize commit → width/height in store, clamped to min/max constraints. */
export function layoutFromResizeBox(
  node: BuilderNode,
  box: ElementBox,
  rootId: string,
  container?: HTMLElement | null,
  nodes?: Record<string, BuilderNode>,
): Partial<NodeLayout> {
  const caps = getCanvasNodeCapabilities(node, rootId, nodes);
  if (!caps.canResize) return {};

  const clamped =
    container != null ? applyConstraintsToResizeBox(node, box, container) : box;
  const sized = layoutSizeFromBox(clamped);
  return enforceLayoutConstraints(node, sized);
}
export function layoutFromElementBox(
  node: BuilderNode,
  box: ElementBox,
  rootId: string,
): Partial<NodeLayout> {
  return {
    ...layoutFromDragBox(node, box, rootId),
    ...layoutFromResizeBox(node, box, rootId),
  };
}

export function translateLayoutForNode(
  node: BuilderNode,
  dx: number,
  dy: number,
  element: HTMLElement,
  parentElement: HTMLElement | null,
  rootId: string,
  container?: HTMLElement | null,
): Partial<NodeLayout> {
  const caps = getCanvasNodeCapabilities(node, rootId);
  if (!caps.canDrag) return {};

  const box = readElementBox(element, parentElement);
  const left = parseLayoutPx(node.layout.left, box.left) + dx;
  const top = parseLayoutPx(node.layout.top, box.top) + dy;
  const rawBox = { ...box, left, top };
  const clamped =
    container != null ? applyConstraintsToDragBox(node, rawBox, container) : rawBox;
  return { position: 'absolute', left: Math.round(clamped.left), top: Math.round(clamped.top) };
}
function readElementBox(element: HTMLElement, parentElement: HTMLElement | null) {
  const rect = element.getBoundingClientRect();
  const parentRect = parentElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return {
    left: rect.left - parentRect.left,
    top: rect.top - parentRect.top,
    width: rect.width,
    height: rect.height,
  };
}
