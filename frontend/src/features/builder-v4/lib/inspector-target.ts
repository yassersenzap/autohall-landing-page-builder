import type { BuilderDocument } from '../types/nodes.types';
import { isHeroFormBlock, isSectionBlock, getPageBlocks } from './studio-compat.js';
import { findPageBlockForNode, isPageBlock } from './page-builder-ops';
import { resolveBusinessLayerSelection } from './layer-selection';
import { FORM_LAYER_NAME, IMAGE_LAYER_NAME } from './hero-layers';

export type InspectorMode =
  | 'page'     // root frame or nothing selected
  | 'hero'     // inside hero+form block
  | 'section'  // a section (direct root child) is selected
  | 'element'; // a text/image/button/etc inside a regular section

/** Resolve which inspector mode to use. */
export function resolveInspectorMode(
  document: BuilderDocument,
  selectedNodeId: string | null,
): InspectorMode {
  const { nodes, rootId } = document;

  if (!selectedNodeId || selectedNodeId === rootId) return 'page';

  const node = nodes[selectedNodeId];
  if (!node) return 'page';

  // Direct root child — gets its own tabbed inspector
  if (isPageBlock(document, node)) {
    // Hero+Form blocks get the dedicated business inspector (badge/title/
    // description/image/form tabs) instead of the generic section inspector.
    if (isHeroFormBlock(node)) return 'hero';
    return 'section';
  }

  // Any other node
  return 'element';
}

/** Node id used to drive the right business inspector (Hero+Form first). */
export function resolveInspectorNodeId(
  document: BuilderDocument,
  selectedNodeId: string | null,
): string {
  const { nodes, rootId } = document;
  const hero = getPageBlocks(document).find(isHeroFormBlock);

  if (!selectedNodeId) {
    return rootId;
  }

  const node = nodes[selectedNodeId];
  if (!node) {
    return hero?.id ?? rootId;
  }

  const pageBlock = findPageBlockForNode(document, selectedNodeId);
  if (pageBlock && isSectionBlock(pageBlock)) {
    return pageBlock.id;
  }

  if (selectedNodeId === rootId && hero) {
    return hero.id;
  }

  if (
    isHeroFormBlock(node)
    || node.name === IMAGE_LAYER_NAME
    || node.name === FORM_LAYER_NAME
    || node.kind === 'form'
  ) {
    return resolveBusinessLayerSelection(node, nodes);
  }

  if (hero) {
    return hero.id;
  }

  return selectedNodeId;
}

export function shouldShowBusinessInspector(
  document: BuilderDocument,
  selectedNodeId: string | null,
): boolean {
  if (!selectedNodeId) return false;
  const node = document.nodes[selectedNodeId];
  if (node && (isHeroFormBlock(node) || node.name === IMAGE_LAYER_NAME || node.name === FORM_LAYER_NAME || node.kind === 'form')) {
    return true;
  }
  const pageBlock = findPageBlockForNode(document, selectedNodeId);
  return Boolean(pageBlock && isSectionBlock(pageBlock));
}

export function inspectorPanelTitle(
  document: BuilderDocument,
  inspectorNodeId: string,
): string {
  const node = document.nodes[inspectorNodeId];
  if (!node) return 'Propriétés';
  if (isHeroFormBlock(node)) {
    return (node.props as { label?: string }).label?.trim() || 'Hero + Form';
  }
  if (isSectionBlock(node)) {
    return (node.props as { label?: string }).label?.trim() || 'Section';
  }
  if (inspectorNodeId === document.rootId) return 'Page';
  return 'Propriétés';
}
