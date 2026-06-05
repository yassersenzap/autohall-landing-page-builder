import { useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw } from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { deletePageAsset } from '@/lib/page-assets-api';
import { useBuilderEditorContext } from '../../context/BuilderEditorContext';
import { usePageAssets } from '../../hooks/use-page-assets';
import { AssetImage } from '../media/AssetImage';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg';

export function MediaLibraryPanel() {
  const { pageVersionId, canWrite } = useBuilderEditorContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { assets, loading, uploading, error, reload, upload, setAssets } =
    usePageAssets(pageVersionId);

  async function handleFiles(files: FileList | File[] | null) {
    if (!canWrite || !files?.length) return;
    await upload(files[0]);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (!pageVersionId) {
    return (
      <p className="p-3 text-xs text-muted-foreground">
        Version de page introuvable.
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 space-y-2 border-b border-border p-2">
        <div
          className={[
            'rounded-lg border border-dashed px-3 py-3 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
            !canWrite ? 'pointer-events-none opacity-60' : '',
          ].join(' ')}
          onDragOver={(e) => {
            e.preventDefault();
            if (canWrite) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            disabled={!canWrite || uploading}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <ImagePlus
            className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground"
            aria-hidden
          />
          <p className="text-xs text-muted-foreground">
            Glissez une image ou téléversez un fichier
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
            JPG, PNG, WebP, SVG — 5 Mo max.
          </p>
          <ShadButton
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            disabled={!canWrite || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
                Envoi…
              </>
            ) : (
              'Uploader une image'
            )}
          </ShadButton>
        </div>

        {error ? (
          <div
            className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-2"
            role="alert"
          >
            <p className="text-xs text-destructive">{error}</p>
            <ShadButton
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1.5 h-7 text-xs"
              onClick={() => void reload()}
            >
              <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
              Réessayer
            </ShadButton>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Bibliothèque ({assets.length})
        </p>
        {loading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Chargement des médias…
          </p>
        ) : assets.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
            Aucun média pour cette landing page.
            <br />
            Téléversez un visuel pour l’utiliser dans le Hero ou les sections image.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="overflow-hidden rounded-md border border-border bg-card"
              >
                <div className="aspect-video bg-muted/30">
                  <AssetImage
                    assetId={asset.id}
                    alt={asset.originalName}
                    className="h-full w-full object-cover"
                    loadingClassName="h-full w-full"
                  />
                </div>
                <div className="space-y-1 p-1.5">
                  <p
                    className="truncate text-[10px] text-muted-foreground"
                    title={asset.originalName}
                  >
                    {asset.originalName}
                  </p>
                  {canWrite ? (
                    <ShadButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-full text-[10px] text-destructive"
                      onClick={() => {
                        void deletePageAsset(asset.id).then(() => {
                          setAssets((prev) =>
                            prev.filter((a) => a.id !== asset.id),
                          );
                        });
                      }}
                    >
                      Supprimer
                    </ShadButton>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
