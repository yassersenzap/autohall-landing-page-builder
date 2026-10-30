import type { BuilderNode } from '../types/nodes.types';
import {
  engineCanDrag,
  engineCanMoveable,
  engineCanResize,
} from './engine-node-matrix';
import { getNodeGeometryRole } from './geometry/geometry-roles';

export type CanvasNodeCapabilities = {
  canDrag: boolean;
  canResize: boolean;
  canRotate: boolean;
  showPositionInspector: boolean;
  showSizeInspector: boolean;
  showStackInspector: boolean;
  showOpacityInspector: boolean;
};

const INSPECTOR_BY_KIND: Record<
  BuilderNode['kind'],
  Omit<CanvasNodeCapabilities, 'canDrag' | 'canResize' | 'canRotate'>
> = {
  frame: {
    showPositionInspector: false,
    showSizeInspector: true,
    showStackInspector: false,
    showOpacityInspector: true,
  },
  image: {
    showPositionInspector: false,
    showSizeInspector: true,
    showStackInspector: false,
    showOpacityInspector: true,
  },
  stack: {
    showPositionInspector: false,
    showSizeInspector: false,
    showStackInspector: true,
    showOpacityInspector: false,
  },
  text: {
    showPositionInspector: false,
    showSizeInspector: false,
    showStackInspector: false,
    showOpacityInspector: false,
  },
  button: {
    showPositionInspector: false,
    showSizeInspector: false,
    showStackInspector: false,
    showOpacityInspector: false,
  },
  input: {
    showPositionInspector: false,
    showSizeInspector: false,
    showStackInspector: false,
    showOpacityInspector: false,
  },
  form: {
    showPositionInspector: false,
    showSizeInspector: false,
    showStackInspector: false,
    showOpacityInspector: false,
  },
  card: {
    showPositionInspector: false,
    showSizeInspector: true,
    showStackInspector: true,
    showOpacityInspector: false,
  },
  section: {
    showPositionInspector: false,
    showSizeInspector: true,
    showStackInspector: true,
    showOpacityInspector: false,
  },
};

const DISABLED: CanvasNodeCapabilities = {
  canDrag: false,
  canResize: false,
  canRotate: false,
  showPositionInspector: false,
  showSizeInspector: false,
  showStackInspector: false,
  showOpacityInspector: false,
};

export function isCanvasSelectable(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  if (node.id === rootId) return false;
  if (node.visibility.hidden) return false;
  if (getNodeGeometryRole(node, nodes) === 'hero-content-layer') return true;
  if (getNodeGeometryRole(node, nodes) === 'form-layer') return true;
  if (getNodeGeometryRole(node, nodes) === 'hero-image') return true;
  if (node.kind === 'text' && node.name === 'HeroText') return true;
  return true;
}

/** P5.5-R3 + P5.7 — capabilities from engine matrix + geometry role overrides */
export function getCanvasNodeCapabilities(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): CanvasNodeCapabilities {
  if (!isCanvasSelectable(node, rootId) || node.visibility.locked) return DISABLED;

  const role = getNodeGeometryRole(node, nodes);
  const inspector = { ...INSPECTOR_BY_KIND[node.kind] };

  if (role === 'hero-image') {
    inspector.showSizeInspector = false;
  }
  if (role === 'hero-content-layer') {
    inspector.showStackInspector = true;
  }
  if (role === 'hero-content' || role === 'form-layer') {
    inspector.showSizeInspector = role === 'form-layer';
    inspector.showStackInspector = role === 'hero-content';
  }
  if (role === 'hero-overlay-text') {
    inspector.showPositionInspector = true;
    inspector.showOpacityInspector = true;
  }

  return {
    canDrag: engineCanDrag(node, rootId, nodes),
    canResize: engineCanResize(node, rootId, nodes),
    canRotate: false,
    ...inspector,
  };
}

export function isCanvasDraggable(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  return getCanvasNodeCapabilities(node, rootId, nodes).canDrag;
}

export function isCanvasResizable(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  return getCanvasNodeCapabilities(node, rootId, nodes).canResize;
}

export function isCanvasMoveable(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  return engineCanMoveable(node, rootId, nodes);
}

export function isGridFlowChild(node: BuilderNode, parentNode?: BuilderNode | null): boolean {
  if (node.layout.position === 'absolute') return false;
  if (!parentNode) return false;
  if (parentNode.layout.display === 'grid') return true;
  if (parentNode.layout.display === 'flex') return true;
  if (parentNode.kind === 'stack') return true;
  if (node.layout.gridColumn) return true;
  return false;
}
