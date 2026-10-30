import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadOrEmbedImage } from '../../lib/upload-image-asset';
import { useAssetsStore } from '../../store/assets.store';

type AssetUploadDropzoneProps = {
  compact?: boolean;
  label?: string;
};

export function AssetUploadDropzone({ compact = false, label }: AssetUploadDropzoneProps) {
  const uploadError = useAssetsStore((s) => s.uploadError);
  const clearUploadError = useAssetsStore((s) => s.clearUploadError);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      clearUploadError();
      for (const file of accepted) {
        try {
          await uploadOrEmbedImage(file);
        } catch (error) {
          useAssetsStore.setState({
            uploadError: error instanceof Error ? error.message : 'Upload impossible',
          });
        }
      }
    },
    [clearUploadError],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'] },
    maxFiles: 12,
    multiple: true,
  });

  if (compact) {
    return (
      <div className="v4-media-upload-compact">
        <div
          {...getRootProps()}
          className={cn(
            'v4-media-upload-compact__btn',
            isDragActive && 'v4-media-upload-compact__btn--active',
            isDragReject && 'v4-media-upload-compact__btn--reject',
          )}
          data-testid="media-upload-btn"
        >
          <input {...getInputProps()} data-testid="media-upload-input" />
          <Plus size={14} aria-hidden />
          <span>{label ?? 'Importer'}</span>
        </div>
        {uploadError ? <p className="v4-assets-upload__error">{uploadError}</p> : null}
      </div>
    );
  }

  return (
    <div className="v4-assets-upload">
      <div
        {...getRootProps()}
        className={cn(
          'v4-assets-upload__zone',
          isDragActive && 'v4-assets-upload__zone--active',
          isDragReject && 'v4-assets-upload__zone--reject',
        )}
        data-testid="assets-upload-zone"
      >
        <input {...getInputProps()} data-testid="assets-upload-input" />
        <UploadCloud className="v4-assets-upload__icon" aria-hidden />
        <p className="v4-assets-upload__title">
          {isDragActive ? 'Déposez vos images ici' : 'Glissez-déposez ou cliquez'}
        </p>
        <p className="v4-assets-upload__hint">PNG, JPG, WebP · max 4 Mo</p>
      </div>
      {uploadError ? <p className="v4-assets-upload__error">{uploadError}</p> : null}
    </div>
  );
}
