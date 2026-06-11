import { useCallback, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { getBuilderPersistPageVersionId } from '@/features/builder-engine/store/builder-document.store';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { Label, ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { sanitizePersistedMediaUrl } from '../lib/media-url-safety';
import { clearMediaValuePatch } from './media-field-utils';

export type MediaFieldValue = {
  imageAssetId?: string;
  imageUrl?: string;
  alt?: string;
  objectFit?: 'cover' | 'contain';
};

type MediaFieldControlProps = {
  label?: string;
  value: MediaFieldValue;
  onChange: (next: MediaFieldValue) => void;
  className?: string;
  assetKey?: string;
  urlKey?: string;
  helperText?: string;
  allowBlobFallback?: boolean;
  showAlt?: boolean;
  showObjectFit?: boolean;
};

function resolvePreviewUrl(value: MediaFieldValue): string {
  if (value.imageAssetId) return assetPublicFileUrl(value.imageAssetId);
  const url = sanitizePersistedMediaUrl(value.imageUrl);
  return url ?? '';
}

function formatAssetRef(value: MediaFieldValue): string {
  if (value.imageAssetId) return 'Visuel enregistré dans la bibliothèque';
  const url = sanitizePersistedMediaUrl(value.imageUrl);
  if (url) return 'Lien externe';
  return '';
}

export function MediaFieldControl({
  label = 'Importer une image',
  value,
  onChange,
  className,
  assetKey,
  urlKey,
  helperText,
  allowBlobFallback = false,
  showAlt = true,
  showObjectFit = true,
}: MediaFieldControlProps) {
  const pageVersionId = getBuilderPersistPageVersionId();
  const { assets, uploading, upload } = usePageAssets(pageVersionId || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = resolvePreviewUrl(value);
  const hasMedia = Boolean(previewUrl);
  const refLabel = formatAssetRef(value);

  const patch = useCallback(
    (partial: Partial<MediaFieldValue>) => {
      const next = { ...value, ...partial };
      if (partial.imageUrl !== undefined) {
        next.imageUrl = sanitizePersistedMediaUrl(partial.imageUrl);
      }
      onChange(next);
    },
    [onChange, value],
  );

  const handleClear = useCallback(() => {
    if (assetKey && urlKey) {
      onChange({ ...value, imageAssetId: '', imageUrl: '' });
      return;
    }
    patch({ imageUrl: '', imageAssetId: '' });
  }, [assetKey, onChange, patch, urlKey, value]);

  const handleUpload = useCallback(
    async (file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      if (!pageVersionId) {
        if (!allowBlobFallback) return;
        patch({ imageUrl: URL.createObjectURL(file), imageAssetId: '' });
        return;
      }
      const asset = await upload(file);
      if (asset) {
        patch({ imageAssetId: asset.id, imageUrl: '' });
      }
    },
    [pageVersionId, patch, upload, allowBlobFallback],
  );

  const pickAsset = useCallback(
    (assetId: string) => {
      patch({ imageAssetId: assetId, imageUrl: '' });
    },
    [patch],
  );

  const imageAssets = assets.filter((a) => a.mimeType?.startsWith('image/'));

  return (
    <div className={cn('space-y-2', className)} data-testid="media-field-control">
      <Label className="text-xs font-medium text-neutral-400">{label}</Label>

      <div className="overflow-hidden rounded-xl border border-neutral-800/90 bg-neutral-950/50">
        {hasMedia ? (
          <>
            <div className="relative">
              <img
                src={previewUrl}
                alt={value.alt || label}
                className={cn(
                  'h-40 w-full bg-neutral-950',
                  value.objectFit === 'contain' ? 'object-contain p-3' : 'object-cover',
                )}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-linear-to-t from-neutral-950/90 via-neutral-950/50 to-transparent px-2 pb-2 pt-8">
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 border-neutral-700/80 bg-neutral-900/90 px-2.5 text-[0.6875rem] text-neutral-200"
                  onClick={() => inputRef.current?.click()}
                >
                  <RefreshCw className="h-3 w-3" aria-hidden />
                  Remplacer
                </ShadButton>
                <ShadButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 border-neutral-700/80 bg-neutral-900/90 px-2.5 text-[0.6875rem] text-neutral-400 hover:text-red-300"
                  onClick={handleClear}
                  aria-label="Retirer l'image"
                  data-testid="media-field-clear"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                  Retirer
                </ShadButton>
              </div>
            </div>
            {refLabel ? (
              <p
                className="border-t border-neutral-800/80 px-3 py-1.5 text-[0.6875rem] text-neutral-600"
                data-testid="media-field-ref"
              >
                {refLabel}
              </p>
            ) : null}
          </>
        ) : (
          <div
            role="button"
            tabIndex={0}
            data-testid="media-field-empty"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleUpload(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2.5 px-4 py-8 text-center transition-colors',
              dragOver
                ? 'bg-blue-500/5'
                : 'hover:bg-neutral-900/40',
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                dragOver
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-500',
              )}
            >
              {dragOver ? <Upload className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-neutral-200">
                {uploading
                  ? 'Import en cours…'
                  : !pageVersionId && !allowBlobFallback
                    ? 'Import indisponible'
                    : 'Ajouter un visuel'}
              </p>
              <p className="text-xs text-neutral-500">
                Glissez une image ou parcourez vos fichiers
              </p>
            </div>
          </div>
        )}

        {showAlt ? (
          <div className="space-y-1.5 border-t border-neutral-800/80 px-3 py-3">
            <Label htmlFor={`media-alt-${label}`} className="text-xs text-neutral-500">
              Texte alternatif
            </Label>
            <input
              id={`media-alt-${label}`}
              type="text"
              value={value.alt ?? ''}
              onChange={(e) => patch({ alt: e.target.value })}
              placeholder="Décrivez le visuel pour l’accessibilité"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
            />
          </div>
        ) : null}
      </div>

      {helperText ? (
        <p className="text-xs leading-relaxed text-neutral-500">{helperText}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
      />

      {imageAssets.length > 0 ? (
        <div className="space-y-1.5" data-testid="media-field-asset-picker">
          <Label className="text-xs text-neutral-500">Remplacer depuis la bibliothèque</Label>
          <div className="flex gap-1.5 overflow-x-auto overscroll-contain rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-2">
            {imageAssets.map((asset) => {
              const selected = value.imageAssetId === asset.id;
              return (
                <button
                  key={asset.id}
                  type="button"
                  title={asset.originalName}
                  onClick={() => pickAsset(asset.id)}
                  className={cn(
                    'h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-all',
                    selected
                      ? 'border-blue-400 ring-1 ring-blue-400/40'
                      : 'border-neutral-800 hover:border-neutral-600',
                  )}
                  data-testid={`media-field-asset-${asset.id}`}
                >
                  <img
                    src={assetPublicFileUrl(asset.id)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showObjectFit ? (
        <div className="space-y-1.5">
          <Label htmlFor={`media-fit-${label}`} className="text-xs text-neutral-500">
            Aperçu recadrage
          </Label>
          <select
            id={`media-fit-${label}`}
            value={value.objectFit ?? 'cover'}
            onChange={(e) => patch({ objectFit: e.target.value as 'cover' | 'contain' })}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-200"
          >
            <option value="cover">Remplir (cover)</option>
            <option value="contain">Contenir (contain)</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}

export { clearMediaValuePatch };
