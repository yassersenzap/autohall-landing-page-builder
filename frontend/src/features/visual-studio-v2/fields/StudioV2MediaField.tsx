import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { AssetImage } from '@/features/builder-engine/components/media/AssetImage';
import { ShadButton } from '@/components/ui/primitives';
import { useStudioV2Context } from '../context/StudioV2Context';

type StudioV2MediaFieldProps = {
  imageAssetId?: string;
  imageUrl?: string;
  onChangeAssetId: (assetId: string) => void;
  onChangeImageUrl: (url: string) => void;
};

export function StudioV2MediaField({
  imageAssetId,
  imageUrl,
  onChangeAssetId,
  onChangeImageUrl,
}: StudioV2MediaFieldProps) {
  const { pageVersionId } = useStudioV2Context();
  const { assets } = usePageAssets(pageVersionId);
  const selected = assets.find((a) => a.id === imageAssetId);

  return (
    <div className="space-y-2">
      {imageAssetId ? (
        <div className="flex gap-2 rounded border border-border p-2">
          <div className="h-12 w-16 overflow-hidden rounded bg-muted">
            <AssetImage
              assetId={imageAssetId}
              alt={selected?.originalName ?? 'Média'}
              className="h-full w-full object-cover"
              loadingClassName="h-full w-full"
            />
          </div>
          <p className="text-xs text-foreground">{selected?.originalName ?? 'Asset sélectionné'}</p>
        </div>
      ) : imageUrl ? (
        <p className="text-xs text-muted-foreground">URL image : {imageUrl}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Aucun visuel sélectionné.</p>
      )}

      {assets.length > 0 ? (
        <ul className="grid grid-cols-3 gap-1">
          {assets.slice(0, 9).map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                className="aspect-video w-full overflow-hidden rounded border border-border hover:ring-2 hover:ring-primary/40"
                onClick={() => {
                  onChangeAssetId(asset.id);
                  onChangeImageUrl('');
                }}
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

      <label className="block text-xs">
        <span className="mb-1 block text-muted-foreground">URL image (fallback)</span>
        <input
          className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
          value={imageUrl ?? ''}
          onChange={(e) => onChangeImageUrl(e.target.value)}
          placeholder="https://…"
        />
      </label>

      {imageAssetId ? (
        <ShadButton
          type="button"
          variant="secondary"
          size="sm"
          className="w-full text-xs"
          onClick={() => onChangeAssetId('')}
        >
          Retirer l’asset
        </ShadButton>
      ) : null}
    </div>
  );
}
