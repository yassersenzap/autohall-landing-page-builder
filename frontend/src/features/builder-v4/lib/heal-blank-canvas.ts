import type { BuilderDocument } from '../types/nodes.types';
import { createBlankCanvasDocument, isBlankCanvasDocument } from '../templates/blank-canvas';

const CAMPAIGN_STRUCTURE_NAMES = new Set([
  'HeroImage',
  'ImageLayer',
  'HeroSafeArea',
  'ContentLayer',
  'FormZone',
  'FormLayer',
  'FloatingFormCard',
  'LeadForm',
  'HeroBlock',
  'hero-showroom',
  'hero-mosaic',
  'hero-cinematic',
  'hero-immersive-form',
]);

export function hasCampaignStructureNodes(document: BuilderDocument): boolean {
  return Object.values(document.nodes).some((node) => CAMPAIGN_STRUCTURE_NAMES.has(node.name));
}

/** Blank template must contain only an empty frame shell — no hero/form leakage. */
export function isCleanBlankCanvasDocument(document: BuilderDocument): boolean {
  if (!isBlankCanvasDocument(document)) return false;
  if (hasCampaignStructureNodes(document)) return false;

  const frame = document.nodes[document.rootId];
  if (!frame || frame.kind !== 'frame') return false;
  if (frame.children.length > 0) return false;
  if (Object.keys(document.nodes).length !== 1) return false;

  return true;
}

/** Fixes localStorage drift where templateId is blank but campaign nodes remain. */
export function sanitizeBlankCanvasDocument(document: BuilderDocument): BuilderDocument {
  if (!isBlankCanvasDocument(document)) return document;
  if (isCleanBlankCanvasDocument(document)) return document;
  return createBlankCanvasDocument();
}
