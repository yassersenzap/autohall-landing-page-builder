import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ImageIcon, Trash2 } from 'lucide-react';
import type { MediaAsset } from '../../types/assets.types';
import { ASSET_DRAG_MIME } from '../../types/assets.types';
import { cn } from '@/lib/utils';
import { MediaImage } from '../../media/MediaImage';

const GRID_COLUMNS = 2;
const ROW_HEIGHT = 108;
const ROW_GAP = 8;

type AssetVirtualGridProps = {
  assets: MediaAsset[];
  emptyMessage?: string;
  compact?: boolean;
  onSelect: (asset: MediaAsset) => void;
  onPreview: (asset: MediaAsset) => void;
  onRemove?: (asset: MediaAsset) => void;
};

function AssetGridCell({
  asset,
  onSelect,
  onPreview,
  onRemove,
}: {
  asset: MediaAsset;
  onSelect: (asset: MediaAsset) => void;
  onPreview: (asset: MediaAsset) => void;
  onRemove?: (asset: MediaAsset) => void;
}) {
  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.setData(ASSET_DRAG_MIME, asset.id);
    event.dataTransfer.setData('text/plain', asset.name);
    event.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div
      className="v4-assets-grid__cell"
      draggable
      onDragStart={handleDragStart}
      data-testid={`asset-cell-${asset.id}`}
    >
      <button
        type="button"
        className="v4-assets-grid__thumb"
        onClick={() => onSelect(asset)}
        onDoubleClick={() => onPreview(asset)}
        title={asset.name}
      >
        {asset.src ? (
          <MediaImage
            src={asset.src}
            alt={asset.name}
            variant="thumb"
            imgClassName="v4-assets-grid__img"
          />
        ) : (
          <ImageIcon className="v4-assets-grid__fallback" aria-hidden />
        )}
        <span className="v4-assets-grid__label">{asset.name}</span>
      </button>
      {asset.source === 'upload' && onRemove ? (
        <button
          type="button"
          className="v4-assets-grid__remove"
          onClick={() => onRemove(asset)}
          aria-label={`Supprimer ${asset.name}`}
        >
          <Trash2 size={12} />
        </button>
      ) : null}
    </div>
  );
}

export function AssetVirtualGrid({
  assets,
  emptyMessage = 'Aucun asset trouvé',
  compact = false,
  onSelect,
  onPreview,
  onRemove,
}: AssetVirtualGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(assets.length / GRID_COLUMNS);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + ROW_GAP,
    overscan: 4,
  });

  if (assets.length === 0) {
    return (
      <div className="v4-assets-grid__empty" data-testid="assets-grid-empty">
        <ImageIcon className="v4-assets-grid__empty-icon" aria-hidden />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('v4-assets-grid__scroll', compact && 'v4-assets-grid__scroll--compact')}
      data-testid="assets-virtual-grid"
    >
      <div
        className="v4-assets-grid__inner"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const rowAssets = assets.slice(rowIndex * GRID_COLUMNS, rowIndex * GRID_COLUMNS + GRID_COLUMNS);

          return (
            <div
              key={virtualRow.key}
              className={cn('v4-assets-grid__row')}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              {rowAssets.map((asset) => (
                <AssetGridCell
                  key={asset.id}
                  asset={asset}
                  onSelect={onSelect}
                  onPreview={onPreview}
                  onRemove={onRemove}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
