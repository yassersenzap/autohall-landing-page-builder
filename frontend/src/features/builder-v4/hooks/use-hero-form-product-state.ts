import { useBuilderV4Store } from '../store/document.store';
import { useAssetsStore } from '../store/assets.store';
import {
  findHeroFormBlock,
  resolveHeroFormProductState,
  type HeroFormProductState,
} from '../lib/studio-compat.js';

export function useHeroFormProductState(): HeroFormProductState | null {
  const document = useBuilderV4Store((s) => s.document);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const getAsset = useAssetsStore((s) => s.getAsset);

  if (!findHeroFormBlock(document)) return null;
  return resolveHeroFormProductState(document, getAsset, previewMode);
}
