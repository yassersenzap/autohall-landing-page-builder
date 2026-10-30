import { useCallback } from 'react';
import { ASSET_DRAG_MIME } from '../types/assets.types';
import { uploadOrEmbedImage } from '../lib/upload-image-asset';
import { useAssetsStore } from '../store/assets.store';

function hasImagePayload(event: React.DragEvent): boolean {
  if (event.dataTransfer.types.includes(ASSET_DRAG_MIME)) return true;
  return Array.from(event.dataTransfer.items).some((item) => item.kind === 'file' && item.type.startsWith('image/'));
}

export function useImageAssetDrop(nodeId: string, enabled: boolean) {
  const applyAssetToNode = useAssetsStore((s) => s.applyAssetToNode);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!enabled || !hasImagePayload(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [enabled],
  );

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      if (!enabled) return;
      event.preventDefault();
      event.stopPropagation();

      const assetId = event.dataTransfer.getData(ASSET_DRAG_MIME);
      if (assetId) {
        applyAssetToNode(nodeId, assetId);
        return;
      }

      const file = event.dataTransfer.files?.[0];
      if (!file?.type.startsWith('image/')) return;

      try {
        const result = await uploadOrEmbedImage(file);
        applyAssetToNode(nodeId, result.assetId);
      } catch (error) {
        useAssetsStore.setState({
          uploadError: error instanceof Error ? error.message : 'Import impossible',
        });
      }
    },
    [applyAssetToNode, enabled, nodeId],
  );

  return { onDragOver, onDrop, acceptsImageDrop: hasImagePayload };
}
