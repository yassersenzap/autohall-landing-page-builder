import type { BuilderNode } from '../../types/nodes.types';
import type {
  GeometryRole,
  HeroSafeInset,
  NodeConstraints,
  RoleCapabilities,
} from '../../types/geometry.types';
import { DEFAULT_HERO_GEOMETRY, FORM_WIDTH } from '../../types/geometry.types';
import { isHeroOverlayTextNode } from './hero-overlay-text';
import {
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from '../hero-layers';

export const GEOMETRY_ROLE_BY_NAME: Record<string, GeometryRole> = {
  Frame: 'hero-root',
  [IMAGE_LAYER_NAME]: 'hero-image',
  HeroImage: 'hero-image',
  [CONTENT_LAYER_NAME]: 'hero-content-layer',
  HeroSafeArea: 'hero-content-layer',
  HeroContentGroup: 'hero-content',
  HeroContent: 'hero-content',
  [FORM_LAYER_NAME]: 'form-layer',
  FormZone: 'form-layer',
  FloatingFormCard: 'form-layer',
};

export const ROLE_CAPABILITIES: Record<GeometryRole, RoleCapabilities> = {
  'hero-root': { drag: false, resize: false, cropInner: false },
  'hero-image': { drag: false, resize: false, cropInner: true },
  'hero-content-layer': { drag: false, resize: false, cropInner: false },
  'hero-content': { drag: false, resize: false, cropInner: false },
  'hero-overlay-text': { drag: true, resize: false, cropInner: false },
  'form-layer': { drag: true, resize: true, cropInner: false },
};

export const CONSTRAINTS_BY_ROLE: Record<GeometryRole, NodeConstraints> = {
  'hero-root': {},
  'hero-image': {},
  'hero-content-layer': { boundsParent: 'HeroBlock', canOverflow: false },
  'hero-content': {
    minWidth: 280,
    maxWidth: 480,
    boundsParent: CONTENT_LAYER_NAME,
    canOverflow: false,
  },
  'hero-overlay-text': {
    minWidth: 80,
    maxWidth: 480,
    boundsParent: CONTENT_LAYER_NAME,
    canOverflow: false,
  },
  'form-layer': {
    minWidth: FORM_WIDTH.min,
    maxWidth: FORM_WIDTH.max,
    boundsParent: 'HeroBlock',
    canOverflow: false,
  },
};

export function getHeroSafeInset(): HeroSafeInset {
  return DEFAULT_HERO_GEOMETRY.contentSafeInset ?? { top: 48, left: 48, right: 32, bottom: 48 };
}

export function getNodeGeometryRole(
  node: BuilderNode,
  nodes?: Record<string, BuilderNode>,
): GeometryRole | null {
  if (node.kind === 'text' && node.name === 'HeroText') return 'hero-overlay-text';
  if (nodes && isHeroOverlayTextNode(node, nodes)) return 'hero-overlay-text';
  if (isImageLayerNode(node)) return 'hero-image';
  if (isContentLayerNode(node)) return 'hero-content-layer';
  if (isFormLayerNode(node)) return 'form-layer';
  return GEOMETRY_ROLE_BY_NAME[node.name] ?? null;
}

export function getRoleCapabilities(role: GeometryRole | null): RoleCapabilities | null {
  if (!role) return null;
  return ROLE_CAPABILITIES[role];
}

export function getNodeConstraints(
  node: BuilderNode,
  nodes?: Record<string, BuilderNode>,
): NodeConstraints | null {
  const role = getNodeGeometryRole(node, nodes);
  if (!role) return null;
  return CONSTRAINTS_BY_ROLE[role];
}

export function isBoundsZoneNode(node: BuilderNode, nodes?: Record<string, BuilderNode>): boolean {
  const role = getNodeGeometryRole(node, nodes);
  return role === 'form-layer' || role === 'hero-image';
}
