import { useBuilderV4Store } from '../store/document.store';
import { useAssetsStore } from '../store/assets.store';
import { healDocumentMedia } from './heal-document-media';
import { stripLegacyHeroContent } from './heal-document-legacy-content';
import { stripBakedHeroMedia } from './hero-image-media';
import {
  isDocumentEmpty,
  normalizeDocument,
  resolveHeroBlockSelectionId,
} from './document-lifecycle';
import { resolveBusinessLayerSelection } from './layer-selection';

let documentReady = false;
let assetsReady = false;

function resolveSelectionAfterHeal(
  document: ReturnType<typeof useBuilderV4Store.getState>['document'],
  selectedNodeId: string | null,
  selectedNodeIds: string[],
): Pick<
  ReturnType<typeof useBuilderV4Store.getState>,
  'selectedNodeId' | 'selectedNodeIds'
> {
  if (isDocumentEmpty(document)) {
    return { selectedNodeId: null, selectedNodeIds: [] };
  }

  const heroId = resolveHeroBlockSelectionId(document);
  const validIds = selectedNodeIds.filter((id) => Boolean(document.nodes[id]));
  const primary = validIds[0] ?? selectedNodeId;

  if (primary && document.nodes[primary]) {
    const resolved = resolveBusinessLayerSelection(document.nodes[primary], document.nodes);
    if (document.nodes[resolved]) {
      return { selectedNodeId: resolved, selectedNodeIds: [resolved] };
    }
  }

  return heroId
    ? { selectedNodeId: heroId, selectedNodeIds: [heroId] }
    : { selectedNodeId: null, selectedNodeIds: [] };
}

function runHealIfReady() {
  if (!documentReady || !assetsReady) return;

  const state = useBuilderV4Store.getState();
  const getAsset = useAssetsStore.getState().getAsset;

  let next = normalizeDocument(state.document);
  next = stripBakedHeroMedia(next);
  next = stripLegacyHeroContent(next);
  next = normalizeDocument(next);
  next = healDocumentMedia(next, getAsset);
  next = normalizeDocument(next);

  const selection = resolveSelectionAfterHeal(next, state.selectedNodeId, state.selectedNodeIds);

  if (
    next !== state.document
    || selection.selectedNodeId !== state.selectedNodeId
    || selection.selectedNodeIds.join(',') !== state.selectedNodeIds.join(',')
  ) {
    useBuilderV4Store.setState({
      document: next,
      ...selection,
    });
  }
}

export function markDocumentStoreRehydrated() {
  documentReady = true;
  runHealIfReady();
}

export function markAssetsStoreRehydrated() {
  assetsReady = true;
  runHealIfReady();
}

export function resetRehydrateCoordinator() {
  documentReady = false;
  assetsReady = false;
}

export function healDocumentMediaNow() {
  documentReady = true;
  assetsReady = true;
  runHealIfReady();
}
