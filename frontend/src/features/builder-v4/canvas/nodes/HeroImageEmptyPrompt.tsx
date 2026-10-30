import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderV4Store } from '../../store/document.store';

type HeroImageEmptyPromptProps = {
  nodeId: string;
  dropActive: boolean;
};

export function HeroImageEmptyPrompt({ dropActive }: HeroImageEmptyPromptProps) {
  function openMediaPanel() {
    useBuilderV4Store.getState().setLeftSidebarTab('media');
  }

  return (
    <div
      className={cn('v4-hero-image-empty', dropActive && 'v4-hero-image-empty--drop-active')}
      data-testid="hero-image-empty-prompt"
    >
      <div className="v4-hero-image-empty__icon-wrap">
        <ImageIcon className="v4-hero-image-empty__icon" aria-hidden />
      </div>
      <p className="v4-hero-image-empty__title">Visuel de campagne</p>
      <p className="v4-hero-image-empty__hint">
        Importez un poster Chery, Ford ou Jeep — ou glissez une image depuis le panneau Media.
      </p>
      <button
        type="button"
        className="v4-hero-image-empty__btn v4-hero-image-empty__btn--primary"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openMediaPanel();
        }}
        data-testid="hero-image-empty-import"
      >
        Importer une image
      </button>
    </div>
  );
}
