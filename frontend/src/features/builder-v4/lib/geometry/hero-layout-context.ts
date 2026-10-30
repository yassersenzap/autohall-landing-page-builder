import type { BuilderDocument, BuilderNode, FrameNodeProps } from '../../types/nodes.types';
import { getHeroFormGeometry } from '../studio-compat.js';

export type HeroLayoutMode = 'split' | 'floating';

export function getHeroLayoutMode(
  nodes: Record<string, BuilderNode>,
  rootId: string,
): HeroLayoutMode {
  const frame = nodes[rootId];
  if (!frame || frame.kind !== 'frame') return 'split';
  const geo = (frame.props as FrameNodeProps).heroFormGeometry;
  if (geo?.mode === 'floating-card') return 'floating';
  if (geo?.mode === 'split') return 'split';
  const legacy = (frame.props as FrameNodeProps).heroGeometry?.layoutMode;
  if (legacy === 'floating') return 'floating';
  return 'split';
}

export function getDocumentHeroLayoutMode(document: BuilderDocument): HeroLayoutMode {
  const geo = getHeroFormGeometry(document);
  return geo.mode === 'floating-card' ? 'floating' : 'split';
}

/** FormLayer is free-draggable only in Floating Card mode. */
export function isFormFreeformLayoutMode(mode: HeroLayoutMode): boolean {
  return mode === 'floating';
}

export function isSplitHeroLayout(document: BuilderDocument): boolean {
  return getDocumentHeroLayoutMode(document) === 'split';
}
