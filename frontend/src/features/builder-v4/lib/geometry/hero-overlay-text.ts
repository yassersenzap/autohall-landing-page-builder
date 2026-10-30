import type { BuilderNode, NodeLayout } from '../../types/nodes.types';
import { createNode, linkParentChild } from '../node-factory';
import { IMAGE_LAYER_NAME } from '../hero-layers';

export const HERO_TEXT_DRAG_MIME = 'application/x-v4-hero-text';

export function isHeroOverlayTextNode(
  node: BuilderNode | undefined,
  nodes: Record<string, BuilderNode>,
): boolean {
  if (!node || node.kind !== 'text') return false;
  if (node.name === 'HeroText') return true;
  const parent = node.parentId ? nodes[node.parentId] : undefined;
  return parent?.name === IMAGE_LAYER_NAME;
}

export function layoutForHeroOverlayText(left: number, top: number): NodeLayout {
  return {
    position: 'absolute',
    left,
    top,
    width: 'max-content',
    maxWidth: 480,
    zIndex: 3,
  };
}

export function createHeroOverlayText(options?: {
  left?: number;
  top?: number;
  text?: string;
  tag?: 'h1' | 'h2' | 'p' | 'span';
}): BuilderNode<'text'> {
  const left = options?.left ?? 64;
  const top = options?.top ?? 120;
  const label = options?.text?.trim() || 'Votre texte';
  const tag = options?.tag ?? 'h2';

  return createNode({
    kind: 'text',
    name: 'HeroText',
    layout: layoutForHeroOverlayText(left, top),
    props: {
      text: label,
      content: label,
      tag,
      typographyToken: tag === 'span' ? 'badge' : tag === 'p' ? 'body' : tag,
      editable: true,
      align: 'left',
    },
    style: {
      color: '#ffffff',
      fontSize: tag === 'h1' ? 34 : tag === 'h2' ? 28 : tag === 'span' ? 14 : 17,
      fontWeight: tag === 'p' ? 400 : 700,
      lineHeight: tag === 'p' ? 1.55 : 1.12,
    },
  });
}

export function insertHeroOverlayText(
  nodes: Record<string, BuilderNode>,
  imageLayerId: string,
  options?: { left?: number; top?: number; text?: string; tag?: 'h1' | 'h2' | 'p' | 'span' },
  _rootId?: string,
): { nodes: Record<string, BuilderNode>; textId: string } | null {
  const imageLayer = nodes[imageLayerId];
  if (!imageLayer || imageLayer.name !== IMAGE_LAYER_NAME) return null;

  const textNode = createHeroOverlayText(options);
  let nextNodes = { ...nodes, [textNode.id]: textNode };
  nextNodes = linkParentChild(nextNodes, imageLayer.id, textNode.id);
  return { nodes: nextNodes, textId: textNode.id };
}

export function overlayTextLayerLabel(node: BuilderNode): string {
  const text = (node.props as { text?: string; content?: string }).text
    ?? (node.props as { content?: string }).content
    ?? '';
  const trimmed = text.trim();
  if (!trimmed) return 'Texte';
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed;
}
