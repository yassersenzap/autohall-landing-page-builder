import type { BuilderDocument } from '../types/nodes.types';
import { campaignBlockStatus } from './campaign-block-restore';
import {
  CONTENT_LAYER_NAME,
  FORM_LAYER_NAME,
  IMAGE_LAYER_NAME,
  findFormLayer,
  findImageLayer,
} from './hero-layers';
import { isHeroFormBlock, isSectionBlock, getPageBlocks } from './studio-compat.js';
import { findPageBlockForNode, isPageBlock } from './page-builder-ops';

export type BusinessInspectorTab = 'hero' | 'image' | 'content' | 'form' | 'section' | 'page';

export type BusinessInspectorContext = {
  frameId: string;
  heroBlockId: string | null;
  heroImageId: string | null;
  formId: string | null;
  leadFormId: string | null;
  sectionBlockId: string | null;
  tabs: BusinessInspectorTab[];
  defaultTab: BusinessInspectorTab;
};

export function resolveBusinessInspectorContext(
  nodeId: string,
  document: BuilderDocument,
): BusinessInspectorContext | null {
  const { nodes, rootId } = document;
  const frame = nodes[rootId];
  if (!frame || frame.kind !== 'frame') return null;

  const node = nodes[nodeId];
  const pageBlock = node ? findPageBlockForNode(document, nodeId) : undefined;

  // Hero-form blocks are sections but need the full tabbed inspector, not SectionInspector
  if (pageBlock && isSectionBlock(pageBlock) && !isHeroFormBlock(pageBlock)) {
    return {
      frameId: rootId,
      heroBlockId: null,
      heroImageId: null,
      formId: null,
      leadFormId: null,
      sectionBlockId: pageBlock.id,
      tabs: ['section'],
      defaultTab: 'section',
    };
  }

  if (nodeId === rootId || (node && isPageBlock(document, node) && !isHeroFormBlock(node))) {
    const { hasHeroImage, hasForm } = campaignBlockStatus(document);
    const tabs: BusinessInspectorTab[] = ['page'];
    if (hasHeroImage || hasForm) tabs.push('hero');
    return {
      frameId: rootId,
      heroBlockId: null,
      heroImageId: null,
      formId: null,
      leadFormId: null,
      sectionBlockId: null,
      tabs,
      defaultTab: 'page',
    };
  }

  const { hasHeroImage, hasForm } = campaignBlockStatus(document);
  const heroBlock = getPageBlocks(document).find(isHeroFormBlock) ?? null;
  const heroImage = findImageLayer(nodes, rootId);
  const formLayer = findFormLayer(nodes, rootId);

  const hasHeroBlock = Boolean(heroBlock) || hasHeroImage || hasForm;
  const tabs: BusinessInspectorTab[] = [];
  if (hasHeroBlock) tabs.push('hero');
  if (hasHeroImage && heroImage) tabs.push('image');
  tabs.push('content');
  const isFlatForm = heroBlock && ((heroBlock.props as any)?.blockType === 'hero-form' || (heroBlock.props as any)?.blockType === 'form-block');
  if ((hasForm && formLayer) || isFlatForm) tabs.push('form');

  if (tabs.length === 0) {
    return {
      frameId: rootId,
      heroBlockId: null,
      heroImageId: null,
      formId: null,
      leadFormId: null,
      sectionBlockId: null,
      tabs: ['page'],
      defaultTab: 'page',
    };
  }

  let defaultTab: BusinessInspectorTab = tabs[0] ?? 'hero';

  if (node) {
    if (node.id === rootId || isHeroFormBlock(node)) {
      defaultTab = 'hero';
    } else if (node.name === IMAGE_LAYER_NAME || node.name === 'HeroImage') {
      defaultTab = 'image';
    } else if (node.name === CONTENT_LAYER_NAME) {
      defaultTab = 'content';
    } else if (node.name === FORM_LAYER_NAME || node.kind === 'form') {
      defaultTab = 'form';
    }
  }

  if (!tabs.includes(defaultTab)) defaultTab = tabs[0] ?? 'page';

  return {
    frameId: rootId,
    heroBlockId: heroBlock?.id ?? null,
    heroImageId: heroImage?.id ?? null,
    formId: formLayer?.id ?? null,
    leadFormId: formLayer?.kind === 'form' ? formLayer.id : null,
    sectionBlockId: null,
    tabs,
    defaultTab,
  };
}

export function isBusinessInspectorNode(nodeId: string, document: BuilderDocument): boolean {
  const ctx = resolveBusinessInspectorContext(nodeId, document);
  if (!ctx) return false;
  const node = document.nodes[nodeId];
  if (!node) return false;

  if (node.id === ctx.frameId) return true;
  if (ctx.sectionBlockId && node.id === ctx.sectionBlockId) return true;
  if (ctx.heroBlockId && node.id === ctx.heroBlockId) return true;
  if (ctx.heroImageId && node.id === ctx.heroImageId) return true;
  if (ctx.formId && node.id === ctx.formId) return true;

  const pageBlock = findPageBlockForNode(document, nodeId);
  if (pageBlock && isSectionBlock(pageBlock)) return true;

  return false;
}

export { IMAGE_LAYER_NAME, FORM_LAYER_NAME };
