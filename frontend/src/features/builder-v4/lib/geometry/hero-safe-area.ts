import type { BuilderNode, NodeLayout } from '../../types/nodes.types';
import type { HeroContentAnchor, HeroSafeInset } from '../../types/geometry.types';
import {
  DEFAULT_HERO_GEOMETRY,
  HERO_CONTENT_MAX_WIDTH,
  HERO_SAFE_PADDING,
} from '../../types/geometry.types';

export const HERO_CONTENT_GROUP_NAMES = ['HeroContentGroup', 'HeroContent'] as const;

export function isHeroContentGroupName(name: string): boolean {
  if ((HERO_CONTENT_GROUP_NAMES as readonly string[]).includes(name)) return true;
  return name.startsWith('HeroContentGroup');
}

/** Structural check — survives layer rename (P5.8-R2). */
export function isHeroContentGroupNode(
  node: BuilderNode | undefined,
  nodes: Record<string, BuilderNode>,
): boolean {
  if (!node || node.kind !== 'stack') return false;
  const parent = node.parentId ? nodes[node.parentId] : undefined;
  return parent?.name === 'HeroSafeArea' || parent?.name === 'ContentLayer';
}

export function isHeroSafeAreaName(name: string): boolean {
  return name === 'HeroSafeArea';
}

/** Flex placement inside HeroSafeArea from anchor preset (Framer-style). */
export function flexLayoutForAnchor(anchor: HeroContentAnchor): Pick<NodeLayout, 'justify' | 'align'> {
  switch (anchor) {
    case 'top-left':
      return { justify: 'start', align: 'start' };
    case 'bottom-left':
      return { justify: 'end', align: 'start' };
    case 'center-left':
    default:
      return { justify: 'center', align: 'start' };
  }
}

export function getDefaultSafeInset(): HeroSafeInset {
  return DEFAULT_HERO_GEOMETRY.contentSafeInset ?? {
    top: HERO_SAFE_PADDING,
    left: HERO_SAFE_PADDING,
    right: HERO_SAFE_PADDING,
    bottom: HERO_SAFE_PADDING,
  };
}

/** Hero overlay zone — absolute fill; children are free-position text layers. */
export function layoutForHeroSafeArea(
  _anchor: HeroContentAnchor = 'center-left',
  _inset: HeroSafeInset = getDefaultSafeInset(),
): NodeLayout {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    overflow: 'visible',
  };
}

/** HeroContentGroup — constrained block inside safe area. */
export function layoutForHeroContentGroup(
  offsetX = 0,
  offsetY = 0,
): NodeLayout {
  return {
    display: 'flex',
    direction: 'column',
    gap: 16,
    maxWidth: HERO_CONTENT_MAX_WIDTH,
    width: 'max-content',
    position: 'relative',
    marginLeft: offsetX,
    marginTop: offsetY,
    flex: '0 0 auto',
  };
}

export function applyAnchorToSafeArea(
  anchor: HeroContentAnchor,
  offsetX = 0,
  offsetY = 0,
  inset?: HeroSafeInset,
): { safeArea: Partial<NodeLayout>; contentGroup: Partial<NodeLayout> } {
  return {
    safeArea: layoutForHeroSafeArea(anchor, inset),
    contentGroup: {
      ...flexLayoutForAnchor(anchor),
      marginLeft: offsetX,
      marginTop: offsetY,
    },
  };
}
