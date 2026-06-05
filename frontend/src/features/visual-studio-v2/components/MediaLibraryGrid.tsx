import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { AssetImage } from '@/features/builder-engine/components/media/AssetImage';
import { deletePageAsset } from '@/lib/page-assets-api';
import { cn } from '@/lib/utils';

type MediaLibraryGridProps = {
  pageVersionId: string;
  canWrite: boolean;
  selectedAssetId?: string;
  onSelect?: (assetId: string) => void;
  onClear?: () => void;
  compact?: boolean;
  showDelete?: boolean;
};

export function MediaLibraryGrid({
  pageVersionId,
  canWrite,
  selectedAssetId,
  onSelect,
  onClear,
  compact = false,
  showDelete = false,
}: MediaLibraryGridProps) {
  const { assets, uploading, error, upload, reload } = usePageAssets(pageVersionId);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
      for (const file of list) {
        const asset = await upload(file);
        if (asset && onSelect) onSelect(asset.id);
      }
    },
    [onSelect, upload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!canWrite) return;
      void handleFiles(e.dataTransfer.files);
    },
    [canWrite, handleFiles],
  );

  return (
    <div className={cn('vs2-media-library', compact && 'vs2-media-library--compact')}>
      {canWrite ? (
        <div
          className={cn('vs2-media-library__dropzone', dragOver && 'is-dragover')}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="vs2-media-library__upload-btn"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {uploading ? 'Envoi…' : 'Importer une image'}
          </button>
          <p className="vs2-media-library__drop-hint">ou glissez-déposez ici</p>
        </div>
      ) : null}

      {error ? <p className="vs2-media-library__error">{error}</p> : null}

      {selectedAssetId && onClear ? (
        <div className="vs2-media-library__selection">
          <span className="vs2-media-library__selection-label">Image active</span>
          <button type="button" className="vs2-media-library__clear-btn" onClick={onClear}>
            Retirer l&apos;image
          </button>
        </div>
      ) : null}

      {assets.length === 0 ? (
        <p className="vs2-media-library__empty">
          <ImagePlus className="inline h-3.5 w-3.5 opacity-60" aria-hidden /> Aucun média. Importez
          votre première image.
        </p>
      ) : (
        <ul className="vs2-media-library__grid">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            return (
              <li key={asset.id}>
                <button
                  type="button"
                  className={cn('vs2-media-library__thumb', isSelected && 'is-selected')}
                  onClick={() => onSelect?.(asset.id)}
                  title={asset.originalName}
                >
                  <AssetImage
                    assetId={asset.id}
                    alt=""
                    className="h-full w-full object-cover"
                    loadingClassName="h-full w-full"
                  />
                </button>
                <span className="vs2-media-library__name">{asset.originalName}</span>
                {showDelete && canWrite ? (
                  <button
                    type="button"
                    className="vs2-media-library__delete"
                    title="Supprimer de la bibliothèque"
                    onClick={() => void deletePageAsset(asset.id).then(() => reload())}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
