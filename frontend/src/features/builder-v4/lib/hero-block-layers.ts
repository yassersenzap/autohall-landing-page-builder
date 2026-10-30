import type { BuilderDocument, BuilderNode, ImageNodeProps } from '../types/nodes.types';
import { resolveMediaSrc, type MediaAssetLookup } from '../media/resolve-media-src';
import { isCampaignTemplate } from './campaign-structure';
import {
  applyHeroFormLayout,
  findHeroFormLayers,
  getPageBlocks,
  insertHeroFormBlock,
  isHeroFormBlock,
} from './studio-compat.js';
import { IMAGE_LAYER_NAME } from './hero-layers.js';

export type HeroBlockLayers = {
  heroBlock: BuilderNode;
  heroImage: BuilderNode;
  formZone: BuilderNode;
  leadForm: BuilderNode;
};

export function resolveHeroBlockLayers(document: BuilderDocument): HeroBlockLayers | null {
  const heroBlock = getPageBlocks(document).find(isHeroFormBlock);
  if (!heroBlock) return null;
  const layers = findHeroFormLayers(document, heroBlock.id);
  if (!layers) return null;
  return {
    heroBlock,
    heroImage: layers.image,
    formZone: layers.form,
    leadForm: layers.form,
  };
}

export function ensureFullHeroBlockComposition(document: BuilderDocument): BuilderDocument {
  if (!isCampaignTemplate(document)) return document;
  const hero = getPageBlocks(document).find(isHeroFormBlock);
  if (hero) return applyHeroFormLayout(document, hero.id);
  const result = insertHeroFormBlock(document);
  return result.document;
}

const HERO_IMAGE_LAYER_STYLE = {
  objectFit: 'cover' as const,
  objectPositionX: 50,
  objectPositionY: 50,
  scale: 100,
};

export function patchHeroImageLayerFromResolved(
  document: BuilderDocument,
  payload: { assetId: string; src: string; alt: string },
): BuilderDocument | null {
  const layers = resolveHeroBlockLayers(document);
  if (!layers) return null;

  const currentProps = layers.heroImage.props as ImageNodeProps;
  const nextNodes = {
    ...document.nodes,
    [layers.heroImage.id]: {
      ...layers.heroImage,
      props: {
        ...currentProps,
        src: payload.src,
        alt: payload.alt,
        assetId: payload.assetId,
        imageBehavior: 'campaign-poster' as const,
        fit: 'contain' as const,
      },
      style: {
        ...layers.heroImage.style,
        ...HERO_IMAGE_LAYER_STYLE,
        objectFit: 'contain' as const,
      },
    },
  };

  return ensureFullHeroBlockComposition({ ...document, nodes: nextNodes });
}

export function patchHeroImageLayerAsset(
  document: BuilderDocument,
  assetId: string,
  getAsset: MediaAssetLookup,
): BuilderDocument | null {
  const asset = getAsset(assetId);
  if (!asset) return null;
  const resolved = resolveMediaSrc({ assetId: asset.id, src: asset.src }, getAsset);
  return patchHeroImageLayerFromResolved(document, {
    assetId: asset.id,
    src: resolved.src,
    alt: asset.name,
  });
}

export function heroBlockHasForm(document: BuilderDocument): boolean {
  return Boolean(getPageBlocks(document).find(isHeroFormBlock));
}

export function findHeroImageLayerId(document: BuilderDocument): string | null {
  const layers = resolveHeroBlockLayers(document);
  return layers?.heroImage.id ?? null;
}

export function findFormLayerId(document: BuilderDocument): string | null {
  const layers = resolveHeroBlockLayers(document);
  return layers?.formZone.id ?? null;
}

export { IMAGE_LAYER_NAME };
