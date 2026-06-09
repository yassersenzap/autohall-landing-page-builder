import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { getBuilderPersistPageVersionId } from '@/features/builder-engine/store/builder-document.store';
import { assetPublicFileUrl } from '@/lib/page-assets-api';
import { Label, ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

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
  /** When false, blob URLs are rejected (page settings / export-safe fields). */
  allowBlobFallback?: boolean;
};

function resolvePreviewUrl(value: MediaFieldValue): string {
  if (value.imageAssetId) return assetPublicFileUrl(value.imageAssetId);
  return value.imageUrl ?? '';
}

export function MediaFieldControl({
  label = 'Importer une image',
  value,
  onChange,
  className,
  allowBlobFallback = false,
}: MediaFieldControlProps) {
  const pageVersionId = getBuilderPersistPageVersionId();
  const { assets, uploading, upload } = usePageAssets(pageVersionId || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = resolvePreviewUrl(value);

  const patch = useCallback(
    (partial: Partial<MediaFieldValue>) => onChange({ ...value, ...partial }),
    [onChange, value],
  );

  const handleUpload = useCallback(
    async (file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      if (!pageVersionId) {
        if (!allowBlobFallback) {
          return;
        }
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

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-neutral-400">{label}</Label>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
          <img
            src={previewUrl}
            alt={value.alt || 'Aperçu'}
            className={cn(
              'h-36 w-full bg-neutral-950',
              value.objectFit === 'contain' ? 'object-contain p-2' : 'object-cover',
            )}
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-neutral-600 bg-neutral-950/80 px-2 text-[0.625rem]"
              onClick={() => inputRef.current?.click()}
            >
              Remplacer
            </ShadButton>
            <ShadButton
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 w-7 border-neutral-600 bg-neutral-950/80 p-0"
              onClick={() => patch({ imageUrl: '', imageAssetId: '' })}
              aria-label="Retirer l'image"
            >
              <X className="h-3.5 w-3.5" />
            </ShadButton>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
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
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
            {dragOver ? <Upload className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </div>
          <p className="text-xs font-medium text-neutral-300">
            {uploading
              ? 'Import en cours…'
              : !pageVersionId && !allowBlobFallback
                ? 'Import indisponible'
                : 'Importer une image'}
          </p>
          <p className="text-[0.625rem] text-neutral-500">
            {!pageVersionId && !allowBlobFallback
              ? 'Utilisez la bibliothèque de la page — les fichiers locaux ne sont pas exportables.'
              : 'PNG, JPG — enregistrée sur la campagne'}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
      />

      {assets.length > 0 ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">Bibliothèque de la page</Label>
          <div className="grid grid-cols-4 gap-2">
            {assets.slice(0, 8).map((asset) => (
              <button
                key={asset.id}
                type="button"
                title={asset.originalName}
                onClick={() => patch({ imageAssetId: asset.id, imageUrl: '' })}
                className={cn(
                  'aspect-square overflow-hidden rounded-md border transition-colors',
                  value.imageAssetId === asset.id
                    ? 'border-blue-500 ring-1 ring-blue-500/40'
                    : 'border-neutral-700 hover:border-neutral-500',
                )}
              >
                <img
                  src={assetPublicFileUrl(asset.id)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="media-alt" className="text-xs text-neutral-500">
          Texte alternatif
        </Label>
        <input
          id="media-alt"
          type="text"
          value={value.alt ?? ''}
          onChange={(e) => patch({ alt: e.target.value })}
          placeholder="Ex. SUV en ville, vue trois-quarts"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="media-fit" className="text-xs text-neutral-500">
          Recadrage
        </Label>
        <select
          id="media-fit"
          value={value.objectFit ?? 'cover'}
          onChange={(e) => patch({ objectFit: e.target.value as 'cover' | 'contain' })}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200"
        >
          <option value="cover">Remplir (cover)</option>
          <option value="contain">Contenir (contain)</option>
        </select>
      </div>
    </div>
  );
}
