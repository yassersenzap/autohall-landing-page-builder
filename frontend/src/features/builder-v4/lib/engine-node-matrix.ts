import type { BuilderNode } from '../types/nodes.types';
import {
  getNodeGeometryRole,
  getRoleCapabilities,
} from './geometry/geometry-roles';
import {
  getHeroLayoutMode,
  isFormFreeformLayoutMode,
} from './geometry/hero-layout-context';

/**
 * P5.6 — ENGINE AUDIT (geometry-aware)
 *
 * | Node              | Drag | Resize | Crop/Zoom | Lexical |
 * |-------------------|------|--------|-----------|---------|
 * | Frame (hero-root) |  ❌  |   ❌   |     ❌    |   ❌    |
 * | HeroImage         |  ❌  |   ❌   |     ✅    |   ❌    |
 * | HeroContent       |  ✅* |   ❌   |     ❌    |   ❌    |
 * | FormZone          |  ❌  |   ❌   |     ❌    |   ❌    |
 * | FloatingFormCard  |  ✅† |   ✅†  |     ❌    |   ❌    |
 * | Title             |  ❌  |   ❌   |     ❌    |   ✅    |
 * | LeadForm          |  ❌  |   ❌   |     ❌    | partial |
 *
 * * bounded by constraints (HeroImage / FormZone zones)
 * † only in floating / fullscreen / centered layout modes
 */
export type EngineNodeProfile = {
  kind: BuilderNode['kind'];
  drag: boolean;
  resize: boolean;
  absoluteOnDrag: boolean;
  flex: boolean;
  grid: boolean;
  lexical: boolean;
  cropInner: boolean;
};

const KIND_PROFILE: Record<
  BuilderNode['kind'],
  Omit<EngineNodeProfile, 'kind'>
> = {
  frame: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: false, cropInner: false },
  image: { drag: false, resize: false, absoluteOnDrag: false, flex: false, grid: true, lexical: false, cropInner: true },
  stack: { drag: true, resize: false, absoluteOnDrag: true, flex: true, grid: true, lexical: false, cropInner: false },
  card: { drag: true, resize: true, absoluteOnDrag: true, flex: true, grid: true, lexical: false, cropInner: false },
  section: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: false, cropInner: false },
  text: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: true, cropInner: false },
  button: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: true, cropInner: false },
  form: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: true, cropInner: false },
  input: { drag: false, resize: false, absoluteOnDrag: false, flex: true, grid: true, lexical: false, cropInner: false },
};

function resolveRoleCapabilities(
  role: ReturnType<typeof getNodeGeometryRole>,
  nodes: Record<string, BuilderNode> | undefined,
  rootId: string,
) {
  if (!role) return null;
  const caps = getRoleCapabilities(role);
  if (!caps) return null;

  if (role === 'form-layer' && nodes) {
    const layoutMode = getHeroLayoutMode(nodes, rootId);
    if (!isFormFreeformLayoutMode(layoutMode)) {
      return { ...caps, drag: false, resize: false };
    }
  }

  return caps;
}

/** Escape hatch only — Moveable ON by default. Set VITE_MOVEABLE_ENABLED=false to debug. */
export function isMoveableEngineEnabled(): boolean {
  return import.meta.env.VITE_MOVEABLE_ENABLED !== 'false';
}

export function getEngineProfile(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): EngineNodeProfile {
  const role = getNodeGeometryRole(node, nodes);
  const roleCaps = resolveRoleCapabilities(role, nodes, rootId);

  if (roleCaps) {
    const base = KIND_PROFILE[node.kind];
    return {
      kind: node.kind,
      ...base,
      drag: roleCaps.drag,
      resize: roleCaps.resize,
      cropInner: roleCaps.cropInner,
      absoluteOnDrag: roleCaps.drag,
    };
  }

  const base = KIND_PROFILE[node.kind];

  if (node.kind === 'frame') {
    const isRoot = node.id === rootId;
    return {
      kind: 'frame',
      ...base,
      drag: !isRoot,
      resize: !isRoot,
      absoluteOnDrag: !isRoot,
    };
  }

  return { kind: node.kind, ...base };
}

export function engineCanDrag(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  if (node.id === rootId) return false;
  if (node.visibility.hidden || node.visibility.locked) return false;
  if (!isMoveableEngineEnabled()) return false;
  const role = getNodeGeometryRole(node, nodes);
  const caps = resolveRoleCapabilities(role, nodes, rootId);
  if (caps) return caps.drag;
  return getEngineProfile(node, rootId, nodes).drag;
}

export function engineCanResize(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  if (node.id === rootId) return false;
  if (node.visibility.hidden || node.visibility.locked) return false;
  if (!isMoveableEngineEnabled()) return false;
  const role = getNodeGeometryRole(node, nodes);
  const caps = resolveRoleCapabilities(role, nodes, rootId);
  if (caps) return caps.resize;
  return getEngineProfile(node, rootId, nodes).resize;
}

export function engineCanMoveable(
  node: BuilderNode,
  rootId: string,
  nodes?: Record<string, BuilderNode>,
): boolean {
  return engineCanDrag(node, rootId, nodes) || engineCanResize(node, rootId, nodes);
}

export const CAMPAIGN_ENGINE_AUDIT: Array<{
  name: string;
  kind: BuilderNode['kind'];
  select: boolean;
  drag: boolean;
  resize: boolean;
  cropInner: boolean;
  lexical: boolean;
}> = [
  { name: 'Frame', kind: 'frame', select: false, drag: false, resize: false, cropInner: false, lexical: false },
  { name: 'HeroImage', kind: 'image', select: true, drag: false, resize: false, cropInner: true, lexical: false },
  { name: 'HeroSafeArea', kind: 'stack', select: false, drag: false, resize: false, cropInner: false, lexical: false },
  { name: 'HeroContentGroup', kind: 'stack', select: true, drag: false, resize: false, cropInner: false, lexical: false },
  { name: 'HeroContent', kind: 'stack', select: true, drag: false, resize: false, cropInner: false, lexical: false },
  { name: 'Title', kind: 'text', select: false, drag: false, resize: false, cropInner: false, lexical: true },
  { name: 'FormZone', kind: 'section', select: true, drag: false, resize: false, cropInner: false, lexical: false },
  { name: 'FloatingFormCard', kind: 'card', select: true, drag: true, resize: true, cropInner: false, lexical: false },
  { name: 'LeadForm', kind: 'form', select: true, drag: false, resize: false, cropInner: false, lexical: true },
];
