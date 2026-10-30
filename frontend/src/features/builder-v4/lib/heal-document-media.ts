import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import type { ImageNodeProps } from '../types/nodes.types';
import { resolveMediaSrc, type MediaAssetLookup } from '../media/resolve-media-src';
import { isUserHeroMediaAssigned } from '../media/hero-media-state';

/** Post-rehydrate: sync user-assigned image src from asset library (skipHistory in store). */
export function healDocumentMedia(
  document: BuilderDocument,
  getAsset: MediaAssetLookup,
): BuilderDocument {
  let changed = false;
  const nodes = { ...document.nodes };

  for (const [id, node] of Object.entries(nodes)) {
    if (node.kind !== 'image') continue;
    const props = node.props as ImageNodeProps;
    if (!isUserHeroMediaAssigned(props, getAsset)) continue;
    const resolved = resolveMediaSrc(props, getAsset);
    if (props.src === resolved.src) continue;
    nodes[id] = {
      ...node,
      props: { ...props, src: resolved.src },
    };
    changed = true;
  }

  return changed ? { ...document, nodes } : document;
}

export function findImageNodes(document: BuilderDocument): BuilderNode<'image'>[] {
  return Object.values(document.nodes).filter(
    (node): node is BuilderNode<'image'> => node.kind === 'image',
  );
}
