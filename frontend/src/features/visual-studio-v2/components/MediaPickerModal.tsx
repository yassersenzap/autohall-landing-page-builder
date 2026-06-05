import { ShadButton } from '@/components/ui/primitives';
import { MediaLibraryGrid } from './MediaLibraryGrid';

type MediaPickerModalProps = {
  open: boolean;
  pageVersionId: string;
  canWrite: boolean;
  onSelect: (assetId: string) => void;
  onClose: () => void;
};

export function MediaPickerModal({
  open,
  pageVersionId,
  canWrite,
  onSelect,
  onClose,
}: MediaPickerModalProps) {
  if (!open) return null;

  return (
    <div className="vs2-media-picker" role="dialog" aria-modal="true" aria-labelledby="vs2-media-picker-title">
      <div className="vs2-media-picker__backdrop" onClick={onClose} aria-hidden />
      <div className="vs2-media-picker__panel">
        <div className="vs2-media-picker__header">
          <h3 id="vs2-media-picker-title" className="vs2-media-picker__title">
            Choisir une image
          </h3>
          <ShadButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </ShadButton>
        </div>
        <p className="vs2-media-picker__hint">
          Importez ou sélectionnez un visuel. Le texte alternatif se configure dans l&apos;inspecteur.
        </p>
        <MediaLibraryGrid
          pageVersionId={pageVersionId}
          canWrite={canWrite}
          showDelete
          onSelect={(assetId) => {
            onSelect(assetId);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
