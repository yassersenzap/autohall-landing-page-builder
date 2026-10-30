import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { isHeroFormBlock } from './studio-compat.js';

/** V2 business layer names — sole product-facing identifiers. */
export const IMAGE_LAYER_NAME = 'ImageLayer';
export const CONTENT_LAYER_NAME = 'ContentLayer';
export const FORM_LAYER_NAME = 'FormLayer';

export const HERO_LAYER_NAMES = [IMAGE_LAYER_NAME, CONTENT_LAYER_NAME, FORM_LAYER_NAME] as const;
export type HeroLayerName = (typeof HERO_LAYER_NAMES)[number];

const LEGACY_IMAGE = new Set(['HeroImage', IMAGE_LAYER_NAME]);
const LEGACY_CONTENT = new Set(['HeroSafeArea', CONTENT_LAYER_NAME]);
const LEGACY_FORM = new Set(['FormZone', 'FloatingFormCard', 'LeadForm', FORM_LAYER_NAME]);

function findHeroBlockInFrame(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const frame = nodes[rootId];
  if (!frame) return undefined;
  return frame.children
    .map((id) => nodes[id])
    .find((child) => child && isHeroFormBlock(child));
}

function findNestedChildByName(
  nodes: Record<string, BuilderNode>,
  parent: BuilderNode,
  name: string,
): BuilderNode | undefined {
  for (const childId of parent.children) {
    const child = nodes[childId];
    if (!child) continue;
    if (child.name === name) return child;
    const nested = findNestedChildByName(nodes, child, name);
    if (nested) return nested;
  }
  return undefined;
}

export function isHeroLayerName(name: string): name is HeroLayerName {
  return (HERO_LAYER_NAMES as readonly string[]).includes(name);
}

export function isImageLayerNode(node: BuilderNode | undefined): boolean {
  return Boolean(node && LEGACY_IMAGE.has(node.name));
}

export function isContentLayerNode(node: BuilderNode | undefined): boolean {
  return Boolean(node && LEGACY_CONTENT.has(node.name));
}

export function isFormLayerNode(node: BuilderNode | undefined): boolean {
  if (!node) return false;
  if (LEGACY_FORM.has(node.name)) return true;
  return node.name === FORM_LAYER_NAME && node.kind === 'form';
}

export function findImageLayer(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const heroBlock = findHeroBlockInFrame(nodes, rootId);
  if (heroBlock) {
    const direct = heroBlock.children
      .map((id) => nodes[id])
      .find((child) => child && isImageLayerNode(child));
    if (direct) return direct;
  }
  return Object.values(nodes).find((node) => isImageLayerNode(node));
}

export function findContentLayer(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const heroBlock = findHeroBlockInFrame(nodes, rootId);
  if (heroBlock) {
    const direct = heroBlock.children
      .map((id) => nodes[id])
      .find((child) => child && isContentLayerNode(child));
    if (direct) return direct;
    const image = findImageLayer(nodes, rootId);
    if (image) {
      return image.children
        .map((id) => nodes[id])
        .find((child) => child && isContentLayerNode(child));
    }
  }
  return Object.values(nodes).find((node) => isContentLayerNode(node));
}

export function findFormLayer(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const heroBlock = findHeroBlockInFrame(nodes, rootId);
  const searchRoot = heroBlock ?? nodes[rootId];
  if (!searchRoot) return undefined;

  const direct = searchRoot.children
    .map((id) => nodes[id])
    .find((child) => child && isFormLayerNode(child));
  if (direct) return direct;

  const legacyCard = findNestedChildByName(nodes, searchRoot, 'FloatingFormCard');
  if (legacyCard) return legacyCard;

  const legacyForm = findNestedChildByName(nodes, searchRoot, 'LeadForm');
  if (legacyForm) return legacyForm;

  return findNestedChildByName(nodes, searchRoot, 'FormZone');
}

export function resolveHeroLayerFromNode(
  node: BuilderNode,
  nodes: Record<string, BuilderNode>,
): BuilderNode | undefined {
  if (isImageLayerNode(node)) return node;
  if (isContentLayerNode(node)) return node;
  if (isFormLayerNode(node)) return node;

  let current: BuilderNode | undefined = node;
  while (current) {
    if (isImageLayerNode(current) || isContentLayerNode(current) || isFormLayerNode(current)) {
      return current;
    }
    if (isHeroFormBlock(current)) return undefined;
    current = current.parentId ? nodes[current.parentId] : undefined;
  }
  return undefined;
}

export type HeroBlockLayersV2 = {
  heroBlock: BuilderNode;
  imageLayer: BuilderNode;
  contentLayer: BuilderNode;
  formLayer: BuilderNode;
};

export function resolveHeroBlockLayersV2(document: BuilderDocument): HeroBlockLayersV2 | null {
  const { nodes, rootId } = document;
  const heroBlock = findHeroBlockInFrame(nodes, rootId);
  const imageLayer = findImageLayer(nodes, rootId);
  const contentLayer = findContentLayer(nodes, rootId);
  const formLayer = findFormLayer(nodes, rootId);

  if (!heroBlock || !imageLayer || !contentLayer || !formLayer) return null;
  return { heroBlock, imageLayer, contentLayer, formLayer };
}
