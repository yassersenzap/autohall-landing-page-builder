import type { BuilderDocument, BuilderNode, FrameNodeProps, NodeLayout } from '../../types/nodes.types';
import {
  DEFAULT_HERO_GEOMETRY,
  DEFAULT_HERO_MIN_HEIGHT,
  FORM_WIDTH,
  FORM_ZONE_INNER_OFFSET,
  FORM_ZONE_PADDING,
  normalizeHeroLayoutMode,
  type HeroRootGeometry,
} from '../../types/geometry.types';
import { resolveHeroRootLayout } from './hero-geometry';
import { findHeroBlock, HERO_BLOCK_NAME } from '../hero-block';
import {
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  isContentLayerNode,
  isFormLayerNode,
  isImageLayerNode,
} from '../hero-layers';

export type CampaignLayoutNodes = {
  frame: BuilderNode | undefined;
  heroBlock: BuilderNode | undefined;
  imageLayer: BuilderNode | undefined;
  contentLayer: BuilderNode | undefined;
  formLayer: BuilderNode | undefined;
};

const OVERLAY_KEYS: (keyof NodeLayout)[] = ['top', 'right', 'bottom', 'left', 'zIndex'];

function findByName(nodes: Record<string, BuilderNode>, name: string): BuilderNode | undefined {
  return Object.values(nodes).find((node) => node.name === name);
}

function findLayerInHero(
  nodes: Record<string, BuilderNode>,
  heroBlock: BuilderNode | undefined,
  matcher: (node: BuilderNode) => boolean,
): BuilderNode | undefined {
  if (!heroBlock) return undefined;
  const direct = heroBlock.children
    .map((id) => nodes[id])
    .find((child) => child && matcher(child));
  if (direct) return direct;
  for (const childId of heroBlock.children) {
    const child = nodes[childId];
    if (!child) continue;
    for (const nestedId of child.children) {
      const nested = nodes[nestedId];
      if (nested && matcher(nested)) return nested;
    }
  }
  return undefined;
}

export function findCampaignLayoutNodes(
  nodes: Record<string, BuilderNode>,
  rootId?: string,
): CampaignLayoutNodes {
  const frame = findByName(nodes, 'Frame');
  const rootKey = rootId ?? Object.values(nodes).find((n) => n.kind === 'frame' && !n.parentId)?.id;
  const heroBlock = rootKey ? findHeroBlock(nodes, rootKey) : findByName(nodes, HERO_BLOCK_NAME);

  return {
    frame,
    heroBlock,
    imageLayer: findLayerInHero(nodes, heroBlock, isImageLayerNode),
    contentLayer: findLayerInHero(nodes, heroBlock, isContentLayerNode),
    formLayer: findLayerInHero(nodes, heroBlock, isFormLayerNode),
  };
}

export type CampaignComposition = 'full' | 'hero-only' | 'form-only' | 'empty';

function isBlockLinkedToSection(
  section: BuilderNode | undefined,
  block: BuilderNode | undefined,
): boolean {
  if (!section || !block) return false;
  return section.children.includes(block.id);
}

export function resolveCampaignComposition(
  nodes: Record<string, BuilderNode>,
  rootId?: string,
): CampaignComposition {
  const { heroBlock, imageLayer, formLayer } = findCampaignLayoutNodes(nodes, rootId);
  const hasHero = isBlockLinkedToSection(heroBlock, imageLayer);
  const hasForm = isBlockLinkedToSection(heroBlock, formLayer);
  if (hasHero && hasForm) return 'full';
  if (hasHero) return 'hero-only';
  if (hasForm) return 'form-only';
  return 'empty';
}

function stripOverlayKeys(layout: NodeLayout): NodeLayout {
  const next = { ...layout };
  for (const key of OVERLAY_KEYS) {
    delete next[key];
  }
  return next;
}

function resolveFormLayerWidth(hero: HeroRootGeometry): Pick<NodeLayout, 'width' | 'minWidth' | 'maxWidth'> {
  if (hero.layoutMode === 'split' && hero.formColumnMode === 'fixed' && hero.formColumnWidth) {
    const inner = Math.max(280, hero.formColumnWidth - FORM_ZONE_INNER_OFFSET);
    return { width: '100%', minWidth: inner, maxWidth: inner };
  }
  if (hero.layoutMode === 'split') {
    return { width: '100%', minWidth: 280, maxWidth: '100%' };
  }
  return { width: '100%', minWidth: FORM_WIDTH.min, maxWidth: FORM_WIDTH.max };
}

export type HeroLayerLayouts = {
  imageLayer: Partial<NodeLayout>;
  contentLayer: Partial<NodeLayout>;
  formLayer: Partial<NodeLayout>;
};

/** V2 SSOT — child placements from heroGeometry (HeroBlock owns grid). */
export function resolveHeroLayerLayouts(hero: HeroRootGeometry): HeroLayerLayouts {
  const formWidth = resolveFormLayerWidth(hero);
  const contentBase: Partial<NodeLayout> = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 2,
    display: 'flex',
    align: 'center',
    justify: 'start',
    padding: 48,
    overflow: 'visible',
    pointerEvents: 'none',
  };

  switch (hero.layoutMode) {
    case 'floating':
      return {
        imageLayer: {
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          height: '100%',
          overflow: 'hidden',
        },
        contentLayer: {
          ...contentBase,
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          right: FORM_WIDTH.max + 96,
        },
        formLayer: {
          gridColumn: '1 / -1',
          gridRow: '1 / -1',
          position: 'absolute',
          top: 48,
          right: 48,
          bottom: 48,
          left: 'auto',
          width: FORM_WIDTH.max + 48,
          minHeight: 'auto',
          height: 'auto',
          display: 'flex',
          align: 'center',
          justify: 'center',
          padding: 0,
          overflow: 'visible',
          zIndex: 10,
          ...formWidth,
        },
      };

    case 'split':
    default:
      return {
        imageLayer: {
          gridColumn: '1 / 2',
          gridRow: '1 / -1',
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          height: '100%',
          alignSelf: 'stretch',
          overflow: 'hidden',
        },
        contentLayer: {
          ...contentBase,
          gridColumn: '1 / 2',
          gridRow: '1 / -1',
          right: 0,
        },
        formLayer: {
          gridColumn: '2 / 3',
          gridRow: '1 / -1',
          position: 'relative',
          display: 'flex',
          align: 'center',
          justify: 'center',
          minHeight: '100%',
          height: '100%',
          alignSelf: 'stretch',
          padding: FORM_ZONE_PADDING,
          overflow: 'visible',
          ...formWidth,
        },
      };
  }
}

/** @deprecated Use resolveHeroLayerLayouts */
export function resolveHeroChildLayouts(hero: HeroRootGeometry): {
  heroImage: Partial<NodeLayout>;
  formZone: Partial<NodeLayout>;
  floatingFormCard: Partial<NodeLayout>;
} {
  const layouts = resolveHeroLayerLayouts(hero);
  return {
    heroImage: layouts.imageLayer,
    formZone: layouts.formLayer,
    floatingFormCard: { position: 'relative', display: 'flex', ...resolveFormLayerWidth(hero) },
  };
}

function mergeNodeLayout(node: BuilderNode, patch: Partial<NodeLayout>): NodeLayout {
  const stripped = stripOverlayKeys(node.layout);
  const next = { ...stripped, ...patch };
  if (patch.position !== 'absolute') {
    return stripOverlayKeys(next);
  }
  return next;
}

function patchNode(nodes: Record<string, BuilderNode>, id: string, layout: Partial<NodeLayout>): BuilderNode {
  const node = nodes[id];
  return { ...node, layout: mergeNodeLayout(node, layout) };
}

function patchHeroBlockLayout(heroBlock: BuilderNode, hero: HeroRootGeometry): BuilderNode {
  const minHeight = hero.minHeight ?? DEFAULT_HERO_MIN_HEIGHT;
  const rootLayout = resolveHeroRootLayout(hero);
  return {
    ...heroBlock,
    layout: {
      ...heroBlock.layout,
      ...rootLayout,
      minHeight,
      height: '100%',
      width: '100%',
    },
  };
}

function patchPageFrameShell(frame: BuilderNode): BuilderNode {
  return {
    ...frame,
    layout: {
      ...frame.layout,
      display: 'flex',
      direction: 'column',
      width: '100%',
      minHeight: '100%',
      height: '100%',
      align: 'stretch',
      gap: 0,
      padding: 0,
      columns: undefined,
      rows: undefined,
    },
  };
}

function patchFormLayerStyle(
  nodes: Record<string, BuilderNode>,
  formLayerId: string,
  hero: HeroRootGeometry,
): Record<string, BuilderNode> {
  const formLayer = nodes[formLayerId];
  const transparent = hero.layoutMode === 'floating';
  const cardBg = transparent ? 'transparent' : '#ffffff';
  return {
    ...nodes,
    [formLayerId]: {
      ...formLayer,
      style: {
        ...formLayer.style,
        background: cardBg,
      },
    },
  };
}

function normalizeFrameHeroGeometry(frame: BuilderNode): HeroRootGeometry {
  const props = frame.props as FrameNodeProps;
  const hero = props.heroGeometry ?? DEFAULT_HERO_GEOMETRY;
  return {
    ...hero,
    layoutMode: normalizeHeroLayoutMode(hero.layoutMode),
  };
}

/**
 * V2 layout engine — Frame neutral, HeroBlock owns grid, three sibling layers.
 */
export function applyHeroLayoutEngine(document: BuilderDocument): BuilderDocument {
  const { frame, heroBlock, imageLayer, contentLayer, formLayer } =
    findCampaignLayoutNodes(document.nodes, document.rootId);
  if (!frame || !heroBlock) return document;

  const hero = normalizeFrameHeroGeometry(frame);
  const composition = resolveCampaignComposition(document.nodes, document.rootId);

  if (composition === 'empty') return document;

  let nodes: Record<string, BuilderNode> = { ...document.nodes };

  nodes = {
    ...nodes,
    [frame.id]: {
      ...patchPageFrameShell(frame),
      props: {
        ...(frame.props as FrameNodeProps),
        heroGeometry: hero,
      },
    },
  };

  const childLayouts = resolveHeroLayerLayouts(hero);

  nodes = {
    ...nodes,
    [heroBlock.id]: patchHeroBlockLayout(heroBlock, hero),
  };

  if (imageLayer) {
    nodes = { ...nodes, [imageLayer.id]: patchNode(nodes, imageLayer.id, childLayouts.imageLayer) };
  }
  if (contentLayer) {
    nodes = { ...nodes, [contentLayer.id]: patchNode(nodes, contentLayer.id, childLayouts.contentLayer) };
  }
  if (formLayer) {
    nodes = { ...nodes, [formLayer.id]: patchNode(nodes, formLayer.id, childLayouts.formLayer) };
    nodes = patchFormLayerStyle(nodes, formLayer.id, hero);
  }

  return { ...document, nodes };
}

export { IMAGE_LAYER_NAME, CONTENT_LAYER_NAME, FORM_LAYER_NAME };
