import type { BuilderDocument } from '../types/nodes.types';
import { healCampaignDocument } from './heal-campaign-document';

/** Re-sync campaign structure + child placements from persisted heroGeometry. */
export function healDocumentHeroLayout(document: BuilderDocument): BuilderDocument {
  return healCampaignDocument(document);
}
