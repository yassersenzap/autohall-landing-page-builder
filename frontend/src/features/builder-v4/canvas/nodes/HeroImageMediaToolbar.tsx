import { ImagePlus, Trash2 } from 'lucide-react';
import { useBuilderV4Store } from '../../store/document.store';
import { useAssetsStore } from '../../store/assets.store';

export type HeroImageMediaToolbarProps = {
  nodeId: string;
};

export function HeroImageMediaToolbar({ nodeId }: HeroImageMediaToolbarProps) {
  const selectedNodeId = useBuilderV4Store((s) => s.selectedNodeId);
  const previewMode = useBuilderV4Store((s) => s.previewMode);
  const clearHeroImageMedia = useBuilderV4Store((s) => s.clearHeroImageMedia);
  const setActiveTab = useAssetsStore((s) => s.setActiveTab);

  if (previewMode || selectedNodeId !== nodeId) return null;

  function replaceImage() {
    useBuilderV4Store.getState().setLeftSidebarTab('media');
    setActiveTab('upload');
  }

  function removeImage() {
    clearHeroImageMedia(nodeId);
  }

  return (
    <div className="v4-hero-image-toolbar" data-testid="hero-image-toolbar">
      <button type="button" className="v4-hero-image-toolbar__btn" onClick={replaceImage}>
        <ImagePlus size={12} aria-hidden />
        Remplacer
      </button>
      <button
        type="button"
        className="v4-hero-image-toolbar__btn v4-hero-image-toolbar__btn--danger"
        onClick={removeImage}
        data-testid="hero-image-remove"
      >
        <Trash2 size={12} aria-hidden />
        Supprimer
      </button>
    </div>
  );
}
