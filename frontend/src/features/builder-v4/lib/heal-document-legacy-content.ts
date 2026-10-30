import type { BuilderDocument } from '../types/nodes.types';
import { deletePageBlock } from './page-builder-ops';

export { stripLegacyHeroContent, findLegacyHeroContentNodes } from './strip-legacy-hero-content';

export { resolveCampaignDeleteTarget } from './campaign-delete';

/** @deprecated use deletePageBlock */
export function deleteCampaignNode(document: BuilderDocument, nodeId: string): BuilderDocument {
  return deletePageBlock(document, nodeId);
}
