import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { ApiError } from '@/lib/api';
import {
  deletePageAsset,
  listPageVersionAssets,
  uploadPageVersionAsset,
  type PageAsset,
} from '@/lib/page-assets-api';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import { AssetImage } from './AssetImage';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg';

type MediaPickerProps = {
  selectedAssetId?: string;
  onSelect: (asset: PageAsset) => void;
  onClearExternalUrl?: () => void;
};

export function MediaPicker({
  selectedAssetId,
  onSelect,
  onClearExternalUrl,
}: MediaPickerProps) {
  const { pageVersionId, canWrite } = useBuilderEditorContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<PageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    if (!pageVersionId) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const data = await listPageVersionAssets(pageVersionId);
      setAssets(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Impossible de charger les médias';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pageVersionId]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!canWrite || !pageVersionId || !files?.length) return;

    const file = files[0];
    setUploading(true);
    setError(null);

    try {
      const asset = await uploadPageVersionAsset(pageVersionId, file);
      setAssets((prev) => [asset, ...prev]);
      onSelect(asset);
      onClearExternalUrl?.();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Échec du téléversement';
      setError(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (!canWrite) return;
    void handleFiles(event.dataTransfer.files);
  }

  if (!pageVersionId) {
    return (
      <p className="text-xs text-muted-foreground">
        Version de page introuvable pour les médias.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={[
          'rounded-lg border border-dashed px-3 py-4 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
          !canWrite ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          if (canWrite) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={!canWrite || uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <ImagePlus className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Glissez une image ici ou utilisez le bouton ci-dessous
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/80">
          JPG, PNG, WebP, SVG — max. 5 Mo
        </p>
        <ShadButton
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled={!canWrite || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
              Envoi…
            </>
          ) : (
            'Uploader une image'
          )}
        </ShadButton>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Bibliothèque
        </p>
        {loading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Chargement…
          </p>
        ) : assets.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun média pour cette page.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {assets.map((asset) => {
              const selected = selectedAssetId === asset.id;
              return (
                <li
                  key={asset.id}
                  className={[
                    'overflow-hidden rounded-md border bg-card',
                    selected ? 'border-primary ring-1 ring-primary/40' : 'border-border',
                  ].join(' ')}
                >
                  <div className="aspect-video w-full bg-muted/30">
                    <AssetImage
                      assetId={asset.id}
                      alt={asset.originalName}
                      className="h-full w-full object-cover"
                      loadingClassName="h-full w-full"
                    />
                  </div>
                  <div className="space-y-1 p-2">
                    <p
                      className="truncate text-[10px] text-muted-foreground"
                      title={asset.originalName}
                    >
                      {asset.originalName}
                    </p>
                    <div className="flex gap-1">
                      <ShadButton
                        type="button"
                        variant={selected ? 'default' : 'secondary'}
                        size="sm"
                        className="h-7 flex-1 text-[10px]"
                        disabled={!canWrite}
                        onClick={() => {
                          onSelect(asset);
                          onClearExternalUrl?.();
                        }}
                      >
                        {selected ? 'Sélectionné' : 'Sélectionner'}
                      </ShadButton>
                      {canWrite ? (
                        <ShadButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] text-destructive"
                          onClick={() => {
                            void deletePageAsset(asset.id).then(() => {
                              setAssets((prev) => prev.filter((a) => a.id !== asset.id));
                            });
                          }}
                        >
                          ×
                        </ShadButton>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
