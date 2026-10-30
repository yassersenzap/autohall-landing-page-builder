import type { BuilderDocument } from '../types/nodes.types';
import { createEmptyPageDocument, insertHeroFormBlock } from '../lib/studio-compat.js';

/** Default document — empty page, no pre-seeded hero (Phase 0). */
export function createCampaignHeroFormDocument(): BuilderDocument {
  return createEmptyPageDocument();
}

/** Test / dev helper — empty page + single HeroFormSection. */
export function createPopulatedHeroFormDocument(): BuilderDocument {
  return insertHeroFormBlock(createEmptyPageDocument()).document;
}
