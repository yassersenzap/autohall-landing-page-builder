import type { BuilderDocument } from '../types/nodes.types';
import type { ImageNodeProps } from '../types/nodes.types';
import { HERO_FIXTURE_PATHS } from '../media/media-constants';
import { isEngineAssetId } from '../media/hero-media-state';
import { isImageLayerNode } from './hero-layers';

function isBakedHeroSrc(src: string): boolean {
  const normalized = src.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('unsplash.com')) return true;
  if (normalized.includes('autohall.ma')) return true;
  if (normalized.startsWith(HERO_FIXTURE_PATHS.chery.toLowerCase())) return true;
  if (normalized.includes('/assets/hero-fixtures/') && !normalized.includes('placeholder')) return true;
  return false;
}

/** True when hero media was auto-seeded (engine/template) — not user-owned. */
export function isBakedHeroMedia(props: ImageNodeProps): boolean {
  if (isEngineAssetId(props.assetId)) return true;
  return isBakedHeroSrc(props.src ?? '');
}

export function emptyHeroImageProps(props: ImageNodeProps): ImageNodeProps {
  return {
    src: '',
    alt: '',
    imageBehavior: props.imageBehavior ?? 'campaign-poster',
    fit: props.fit ?? 'contain',
    overlayEnabled: false,
  };
}

/** Post-rehydrate: unlock hero images stuck on engine/template URLs in localStorage. */
export function stripBakedHeroMedia(document: BuilderDocument): BuilderDocument {
  let changed = false;
  const nodes = { ...document.nodes };

  for (const [id, node] of Object.entries(nodes)) {
    if (node.kind !== 'image' || !isImageLayerNode(node)) continue;
    const props = node.props as ImageNodeProps;
    if (!isBakedHeroMedia(props)) continue;
    nodes[id] = {
      ...node,
      props: emptyHeroImageProps(props),
    };
    changed = true;
  }

  return changed ? { ...document, nodes } : document;
}

export const HERO_IMAGE_STYLE_RESET = {
  objectPositionX: 50,
  objectPositionY: 50,
  scale: 100,
  brightness: 100,
  saturation: 100,
  blur: 0,
} as const;
