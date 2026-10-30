import type { BuilderNode } from '../../types/nodes.types';
import type { NodeConstraints } from '../../types/geometry.types';
import type { ElementBox } from '../canvas-layout-commit';
import { getNodeConstraints } from './geometry-roles';

export type BoundsRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ZoneRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function parsePx(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function readZoneRect(element: HTMLElement, relativeTo: HTMLElement): ZoneRect {
  const rect = element.getBoundingClientRect();
  const parentRect = relativeTo.getBoundingClientRect();
  return {
    left: rect.left - parentRect.left,
    top: rect.top - parentRect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** Moveable `bounds` prop — coordinates relative to target offset parent. */
export function computeMoveableBounds(
  container: HTMLElement,
  target: HTMLElement,
  boundsParentName: string,
): BoundsRect | null {
  const boundsEl = container.querySelector<HTMLElement>(`[data-v4-name="${boundsParentName}"]`);
  if (!boundsEl) return null;

  const offsetParent = (target.offsetParent as HTMLElement | null) ?? container;
  const zone = readZoneRect(boundsEl, offsetParent);
  const targetRect = target.getBoundingClientRect();
  const targetWidth = targetRect.width;
  const targetHeight = targetRect.height;

  return {
    left: zone.left,
    top: zone.top,
    right: zone.left + zone.width - targetWidth,
    bottom: zone.top + zone.height - targetHeight,
  };
}

export function clampSize(
  width: number,
  height: number,
  constraints: NodeConstraints,
): { width: number; height: number } {
  let w = width;
  let h = height;
  if (constraints.minWidth !== undefined) w = Math.max(w, constraints.minWidth);
  if (constraints.maxWidth !== undefined) w = Math.min(w, constraints.maxWidth);
  if (constraints.minHeight !== undefined) h = Math.max(h, constraints.minHeight);
  if (constraints.maxHeight !== undefined) h = Math.min(h, constraints.maxHeight);
  return { width: Math.round(w), height: Math.round(h) };
}

export function clampBoxToZone(
  box: ElementBox,
  zone: ZoneRect,
  constraints: NodeConstraints,
): ElementBox {
  const sized = clampSize(box.width, box.height, constraints);
  let left = box.left;
  let top = box.top;

  if (!constraints.canOverflow) {
    left = Math.max(zone.left, Math.min(left, zone.left + zone.width - sized.width));
    top = Math.max(zone.top, Math.min(top, zone.top + zone.height - sized.height));
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: sized.width,
    height: sized.height,
  };
}

export function applyConstraintsToDragBox(
  node: BuilderNode,
  box: ElementBox,
  container: HTMLElement,
): ElementBox {
  const constraints = getNodeConstraints(node);
  if (!constraints?.boundsParent) return box;

  const boundsEl = container.querySelector<HTMLElement>(`[data-v4-name="${constraints.boundsParent}"]`);
  const offsetParent = container.querySelector<HTMLElement>(`[data-v4-node-id="${node.parentId}"]`);
  if (!boundsEl || !offsetParent) return box;

  const zone = readZoneRect(boundsEl, offsetParent);
  return clampBoxToZone(box, zone, constraints);
}

export function applyConstraintsToResizeBox(
  node: BuilderNode,
  box: ElementBox,
  container: HTMLElement,
): ElementBox {
  const constraints = getNodeConstraints(node);
  if (!constraints) return box;

  let next = { ...box, ...clampSize(box.width, box.height, constraints) };

  if (constraints.boundsParent) {
    const boundsEl = container.querySelector<HTMLElement>(`[data-v4-name="${constraints.boundsParent}"]`);
    const offsetParent = container.querySelector<HTMLElement>(`[data-v4-node-id="${node.parentId}"]`);
    if (boundsEl && offsetParent) {
      const zone = readZoneRect(boundsEl, offsetParent);
      next = clampBoxToZone(next, zone, constraints);
    }
  }

  return next;
}

export function enforceLayoutConstraints(
  node: BuilderNode,
  layout: { width?: number | string; height?: number | string },
): { width?: number | string; height?: number | string } {
  const constraints = getNodeConstraints(node);
  if (!constraints) return layout;

  const width = parsePx(layout.width, 0);
  const height = parsePx(layout.height, 0);
  const sized = clampSize(width || constraints.minWidth || 420, height || 0, constraints);

  return {
    width: sized.width,
    ...(height > 0 ? { height: sized.height } : {}),
  };
}
