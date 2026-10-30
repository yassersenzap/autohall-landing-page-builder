import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { deleteNodeFromDocument } from './node-tree-ops';
import { isHeroContentGroupNode } from './geometry/hero-safe-area';
import { applyHeroLayoutEngine } from './geometry/hero-layout-engine';
import { isCampaignTemplate } from './campaign-structure';

/** Removes legacy imposed hero content groups (Badge/Title/Subtitle stacks). */
export function stripLegacyHeroContent(document: BuilderDocument): BuilderDocument {
  if (!isCampaignTemplate(document)) return document;

  let next = document;
  let changed = false;

  for (const node of Object.values(document.nodes)) {
    if (!isHeroContentGroupNode(node, document.nodes)) continue;
    const stripped = deleteNodeFromDocument(next, node.id);
    if (stripped !== next) {
      next = stripped;
      changed = true;
    }
  }

  if (!changed) return document;
  return applyHeroLayoutEngine(next);
}

export function findLegacyHeroContentNodes(nodes: Record<string, BuilderNode>): BuilderNode[] {
  return Object.values(nodes).filter((node) => isHeroContentGroupNode(node, nodes));
}
