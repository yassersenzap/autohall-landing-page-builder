import type { BuilderNode, NodeLayout } from '../types/nodes.types';
import { isCanvasDraggable } from './canvas-node-capabilities';
import { translateLayoutForNode } from './canvas-layout-commit';

export type CanvasGuide = {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
};

export const CANVAS_SNAP_THRESHOLD = 8;

export {
  isCanvasDraggable,
  isCanvasMoveable,
  isCanvasResizable,
  isCanvasSelectable,
  getCanvasNodeCapabilities,
  isGridFlowChild,
} from './canvas-node-capabilities';

export { layoutFromElementBox } from './canvas-layout-commit';

export function parseLayoutPx(value: number | string | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function readElementBox(element: HTMLElement, parentElement: HTMLElement | null) {
  const rect = element.getBoundingClientRect();
  const parentRect = parentElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return {
    left: rect.left - parentRect.left,
    top: rect.top - parentRect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** @deprecated Use layoutFromElementBox with node context */
export function layoutFromAbsoluteBox(box: {
  left: number;
  top: number;
  width: number;
  height: number;
}): Partial<NodeLayout> {
  return {
    position: 'absolute',
    left: Math.round(box.left),
    top: Math.round(box.top),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

export function translateLayout(
  node: BuilderNode,
  dx: number,
  dy: number,
  element: HTMLElement,
  parentElement: HTMLElement | null,
  rootId: string,
): Partial<NodeLayout> {
  if (!isCanvasDraggable(node, rootId)) return {};
  const container = element.closest('.v4-canvas-layer') as HTMLElement | null;
  return translateLayoutForNode(node, dx, dy, element, parentElement, rootId, container);
}

export function getSnapElements(
  container: HTMLElement,
  selectedIds: Set<string>,
): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-v4-moveable="true"]'),
  ).filter((element) => {
    const id = element.getAttribute('data-v4-node-id');
    return Boolean(id && !selectedIds.has(id));
  });
}

export function getFrameSnapGuides(frameElement: HTMLElement | null): {
  vertical: number[];
  horizontal: number[];
} {
  if (!frameElement) return { vertical: [], horizontal: [] };
  const rect = frameElement.getBoundingClientRect();
  const container = frameElement.closest('.v4-canvas-layer') as HTMLElement | null;
  const containerRect = container?.getBoundingClientRect() ?? { left: 0, top: 0 };

  const left = rect.left - containerRect.left;
  const top = rect.top - containerRect.top;
  const width = rect.width;
  const height = rect.height;

  return {
    vertical: [left, left + width / 2, left + width],
    horizontal: [top, top + height / 2, top + height],
  };
}

export function nodeSelector(nodeId: string): string {
  return `[data-v4-node-id="${nodeId}"]`;
}
