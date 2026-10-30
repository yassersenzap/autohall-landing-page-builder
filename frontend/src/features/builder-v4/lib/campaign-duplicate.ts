import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { canDuplicatePageNode } from './page-builder-ops';

export function canDuplicateCampaignNode(document: BuilderDocument, nodeId: string): boolean {
  return canDuplicatePageNode(document, nodeId);
}

export function duplicateUsesClipboard(_node: BuilderNode | undefined): boolean {
  return false;
}
