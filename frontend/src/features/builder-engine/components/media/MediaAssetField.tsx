import { FolderOpen } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import { usePageAssets } from '../../hooks/use-page-assets';
import { asPropString } from '../../lib/block-props';
import { AssetImage } from './AssetImage';

type MediaAssetFieldProps = {
  imageAssetId?: string;
  onPickAsset: (assetId: string) => void;
};

export function MediaAssetField({ imageAssetId, onPickAsset }: MediaAssetFieldProps) {
  const { pageVersionId, openMediaLibrary } = useBuilderEditorContext();
  const { assets } = usePageAssets(pageVersionId);
  const selectedId = asPropString(imageAssetId);
  const selected = assets.find((a) => a.id === selectedId);

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/20 p-2">
      {selectedId ? (
        <div className="flex gap-2">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            <AssetImage
              assetId={selectedId}
              alt={selected?.originalName ?? 'Média'}
              className="h-full w-full object-cover"
              loadingClassName="h-full w-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {selected?.originalName ?? 'Image sélectionnée'}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Depuis la bibliothèque média
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Aucune image uploadée. Ouvrez la bibliothèque média.
        </p>
      )}
      <ShadButton
        type="button"
        variant="secondary"
        size="sm"
        className="w-full text-xs"
        onClick={openMediaLibrary}
      >
        <FolderOpen className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Ouvrir la bibliothèque média
      </ShadButton>
      {assets.length > 0 && !selectedId ? (
        <ul className="grid grid-cols-3 gap-1">
          {assets.slice(0, 6).map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                className="aspect-video w-full overflow-hidden rounded border border-border hover:ring-2 hover:ring-primary/40"
                onClick={() => onPickAsset(asset.id)}
              >
                <AssetImage
                  assetId={asset.id}
                  alt=""
                  className="h-full w-full object-cover"
                  loadingClassName="h-full w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
