import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { createNode, linkParentChild } from './node-factory';
import { isCampaignTemplate } from './campaign-structure';
import {
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  findContentLayer,
  findFormLayer,
  findImageLayer,
} from './hero-layers';

import { HERO_FORM_BLOCK_NAME, isHeroFormBlock } from './studio-compat.js';

/** @deprecated use HERO_FORM_BLOCK_NAME */
export const HERO_BLOCK_NAME = HERO_FORM_BLOCK_NAME;

export const HERO_LAYOUT_VIRTUAL_SUFFIX = '__hero-layout';
export const HERO_CONTENT_PLACEHOLDER_SUFFIX = '__content-placeholder';

export function heroLayoutVirtualId(heroBlockId: string): string {
  return `${heroBlockId}${HERO_LAYOUT_VIRTUAL_SUFFIX}`;
}

export function heroContentPlaceholderId(heroBlockId: string): string {
  return `${heroBlockId}${HERO_CONTENT_PLACEHOLDER_SUFFIX}`;
}

export function isHeroLayoutVirtualId(id: string): boolean {
  return id.endsWith(HERO_LAYOUT_VIRTUAL_SUFFIX);
}

export function isHeroContentPlaceholderId(id: string): boolean {
  return id.endsWith(HERO_CONTENT_PLACEHOLDER_SUFFIX);
}

export function findByName(nodes: Record<string, BuilderNode>, name: string): BuilderNode | undefined {
  return Object.values(nodes).find((node) => node.name === name);
}

export function findHeroBlock(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const frame = nodes[rootId];
  if (!frame) return undefined;
  return frame.children
    .map((id) => nodes[id])
    .find((child) => child && isHeroFormBlock(child));
}

export function findHeroLayoutRoot(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  return findHeroBlock(nodes, rootId) ?? nodes[rootId];
}

export function findHeroImageNode(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  return findImageLayer(nodes, rootId);
}

export function findFormZoneNode(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  return findFormLayer(nodes, rootId);
}

export function findNestedChildByName(
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

export function findFloatingFormCard(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  return findFormLayer(nodes, rootId);
}

export function findLeadFormNode(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  const formLayer = findFormLayer(nodes, rootId);
  if (formLayer?.kind === 'form') return formLayer;
  return findByName(nodes, 'LeadForm');
}

export function findContentLayerNode(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): BuilderNode | undefined {
  return findContentLayer(nodes, rootId);
}

export function isBlockAttachedToHeroSection(
  document: BuilderDocument,
  blockName: typeof IMAGE_LAYER_NAME | typeof FORM_LAYER_NAME | 'HeroImage' | 'FormZone',
): boolean {
  const { nodes, rootId } = document;
  const section = findHeroBlock(nodes, rootId) ?? nodes[rootId];
  const block =
    blockName === IMAGE_LAYER_NAME || blockName === 'HeroImage'
      ? findImageLayer(nodes, rootId)
      : findFormLayer(nodes, rootId);
  if (!section || !block) return false;
  return section.children.includes(block.id);
}

/** Ensure HeroBlock wraps V2 layers; Frame stays flex column. */
export function ensureHeroBlockStructure(document: BuilderDocument): BuilderDocument {
  if (!isCampaignTemplate(document)) return document;

  const { nodes, rootId } = document;
  const frame = nodes[rootId];
  if (!frame) return document;

  let nextNodes = { ...nodes };
  let heroBlock = findHeroBlock(nextNodes, rootId);
  const imageLayer = findImageLayer(nextNodes, rootId);
  const formLayer = findFormLayer(nextNodes, rootId);

  if (!imageLayer && !formLayer) return document;

  if (!heroBlock) {
    heroBlock = createNode({
      kind: 'section',
      name: HERO_BLOCK_NAME,
      layout: {
        display: 'grid',
        width: '100%',
        minHeight: 720,
        height: '100%',
        align: 'stretch',
        overflow: 'hidden',
        position: 'relative',
      },
      style: { background: 'transparent' },
      props: { label: 'Hero + Form', blockType: 'hero-form' },
    });
    nextNodes = { ...nextNodes, [heroBlock.id]: heroBlock };
    nextNodes = linkParentChild(nextNodes, frame.id, heroBlock.id);
  }

  const blockParent = heroBlock;

  for (const block of [imageLayer, formLayer]) {
    if (!block) continue;
    const currentParent = block.parentId ? nextNodes[block.parentId] : undefined;
    if (currentParent?.id === blockParent.id) continue;

    if (block.parentId && nextNodes[block.parentId]) {
      const parent = nextNodes[block.parentId];
      nextNodes = {
        ...nextNodes,
        [parent.id]: {
          ...parent,
          children: parent.children.filter((id) => id !== block.id),
        },
      };
    }

    nextNodes = {
      ...nextNodes,
      [block.id]: { ...block, parentId: blockParent.id },
      [blockParent.id]: {
        ...nextNodes[blockParent.id],
        children: nextNodes[blockParent.id].children.includes(block.id)
          ? nextNodes[blockParent.id].children
          : [...nextNodes[blockParent.id].children, block.id],
      },
    };
  }

  const nextFrame = nextNodes[rootId];
  nextNodes = {
    ...nextNodes,
    [rootId]: {
      ...nextFrame,
      layout: {
        ...nextFrame.layout,
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
    },
  };

  if (nextNodes === nodes) return document;
  return { ...document, nodes: nextNodes };
}

export { IMAGE_LAYER_NAME, CONTENT_LAYER_NAME, FORM_LAYER_NAME };
