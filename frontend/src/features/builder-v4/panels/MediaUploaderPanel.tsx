import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { MediaImage } from '../media/MediaImage';
import { ASSET_DRAG_MIME } from '../types/assets.types';
import type { MediaAsset } from '../types/assets.types';
import { selectMediaImages, useAssetsStore } from '../store/assets.store';
import { AssetUploadDropzone } from './assets/AssetUploadDropzone';

function MediaImageRow({
  asset,
  onSelect,
  onDelete,
}: {
  asset: MediaAsset;
  onSelect: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}) {
  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.setData(ASSET_DRAG_MIME, asset.id);
    event.dataTransfer.setData('text/plain', asset.name);
    event.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <li className="v4-media-uploader__item" data-testid={`media-image-${asset.id}`}>
      <button
        type="button"
        className="v4-media-uploader__select"
        draggable
        onDragStart={handleDragStart}
        onClick={() => onSelect(asset)}
        title={asset.name}
      >
        <MediaImage src={asset.src} alt={asset.name} variant="thumb" imgClassName="v4-media-uploader__thumb" />
        <span className="v4-media-uploader__name">{asset.name}</span>
      </button>
      <button
        type="button"
        className="v4-media-uploader__delete"
        onClick={() => onDelete(asset)}
        aria-label={`Supprimer ${asset.name}`}
        data-testid={`media-delete-${asset.id}`}
      >
        <Trash2 size={14} aria-hidden />
        <span>Supprimer</span>
      </button>
    </li>
  );
}

/** Framer-style media panel — uploads only, no library/search/favorites. */
export function MediaUploaderPanel() {
  const images = useAssetsStore(useShallow(selectMediaImages));
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const applyAssetToHeroImageLayer = useAssetsStore((s) => s.applyAssetToHeroImageLayer);

  function handleSelect(asset: MediaAsset) {
    const applied = applyAssetToHeroImageLayer(asset.id);
    if (applied) {
      toast.success(`« ${asset.name} » appliqué à l'image hero`);
      return;
    }
    toast.message('Ajoutez d\'abord un bloc Hero + Form');
  }

  function handleDelete(asset: MediaAsset) {
    removeAsset(asset.id);
    toast.success(`« ${asset.name} » supprimé`);
  }

  return (
    <div className="v4-panel v4-media-uploader" data-testid="media-panel">
      <div className="v4-panel__head">
        <p className="v4-panel__title">Media</p>
      </div>

      <div className="v4-media-uploader__upload">
        <AssetUploadDropzone compact label="Upload image" />
      </div>

      <div className="v4-panel__scroll v4-media-uploader__body">
        <p className="v4-media-uploader__section-label">Images uploadées</p>

        {images.length === 0 ? (
          <p className="v4-media-uploader__empty" data-testid="media-empty">
            Aucune image — utilisez Upload ci-dessus.
          </p>
        ) : (
          <ul className={cn('v4-media-uploader__list')}>
            {images.map((asset) => (
              <MediaImageRow key={asset.id} asset={asset} onSelect={handleSelect} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
