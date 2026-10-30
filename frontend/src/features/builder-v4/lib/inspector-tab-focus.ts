import type { BuilderDocument } from '../types/nodes.types';
import {
  resolveBusinessInspectorContext,
  type BusinessInspectorContext,
  type BusinessInspectorTab,
} from './business-inspector-context';
import { findContentLayer } from './hero-layers';

export function resolveInspectorTabTargetId(
  tab: BusinessInspectorTab,
  ctx: BusinessInspectorContext,
  document: BuilderDocument,
): string | null {
  const { nodes, rootId } = document;

  switch (tab) {
    case 'hero':
      return ctx.heroBlockId ?? ctx.frameId;
    case 'image':
      return ctx.heroImageId;
    case 'content':
      return findContentLayer(nodes, rootId)?.id ?? ctx.heroBlockId ?? ctx.frameId;
    case 'form':
      return ctx.leadFormId ?? ctx.formId;
    case 'page':
      return ctx.frameId;
    case 'section':
      return ctx.sectionBlockId;
    default:
      return null;
  }
}

export function resolveInspectorContextForTab(
  document: BuilderDocument,
  selectedNodeId: string | null,
): BusinessInspectorContext | null {
  const hero = Object.values(document.nodes).find(
    (node) => node.name === 'HeroFormSection',
  );
  const anchorId = hero?.id ?? selectedNodeId ?? document.rootId;
  return resolveBusinessInspectorContext(anchorId, document);
}
