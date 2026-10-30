import { useCallback, useState } from 'react';
import { ASSET_DRAG_MIME } from '../types/assets.types';
import { uploadOrEmbedImage } from '../lib/upload-image-asset';
import { hasElementDragPayload, readElementDragData } from '../lib/element-drag';
import { isDocumentEmpty } from '../lib/document-lifecycle';
import { useAssetsStore } from '../store/assets.store';
import { useBuilderV4Store } from '../store/document.store';

function hasImagePayload(event: React.DragEvent): boolean {
  if (event.dataTransfer.types.includes(ASSET_DRAG_MIME)) return true;
  return Array.from(event.dataTransfer.items).some(
    (item) => item.kind === 'file' && item.type.startsWith('image/'),
  );
}

function hasComposerPayload(event: React.DragEvent): boolean {
  return hasImagePayload(event) || hasElementDragPayload(event.dataTransfer);
}

/** Drop on empty canvas — always inserts atomic Hero + Form preset. */
export function useCanvasComposerDrop(enabled: boolean) {
  const [dropActive, setDropActive] = useState(false);
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const applyAssetToHeroImageLayer = useAssetsStore((s) => s.applyAssetToHeroImageLayer);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!enabled || !hasComposerPayload(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      setDropActive(true);
    },
    [enabled],
  );

  const onDragLeave = useCallback(() => {
    setDropActive(false);
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      if (!enabled) return;
      event.preventDefault();
      event.stopPropagation();
      setDropActive(false);

      const blockId = readElementDragData(event.dataTransfer);
      if (blockId) {
        insertCanvasBlock(blockId);
        return;
      }

      const assetId = event.dataTransfer.getData(ASSET_DRAG_MIME);
      if (assetId) {
        if (isDocumentEmpty(useBuilderV4Store.getState().document)) {
          insertCanvasBlock('hero-form');
        }
        applyAssetToHeroImageLayer(assetId);
        return;
      }

      const file = event.dataTransfer.files?.[0];
      if (!file?.type.startsWith('image/')) return;

      try {
        const result = await uploadOrEmbedImage(file);
        if (isDocumentEmpty(useBuilderV4Store.getState().document)) {
          insertCanvasBlock('hero-form');
        }
        applyAssetToHeroImageLayer(result.assetId);
      } catch (error) {
        useAssetsStore.setState({
          uploadError: error instanceof Error ? error.message : 'Import impossible',
        });
      }
    },
    [applyAssetToHeroImageLayer, enabled, insertCanvasBlock],
  );

  return { dropActive, onDragOver, onDragLeave, onDrop };
}
