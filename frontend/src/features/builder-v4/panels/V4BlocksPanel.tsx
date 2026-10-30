import { isCanvasEmpty } from '../lib/canvas-composition';
import type { ElementBlockId } from '../lib/element-drag';
import { useBuilderV4Store } from '../store/document.store';
import { ElementBlockChip } from './ElementBlockChip';

const HERO_AND_FORMS: ElementBlockId[] = [
  'hero',
  'hero-form',
  'form-block',
];

const CONTENT_AND_MEDIA: ElementBlockId[] = [
  'text-block',
  'image-block',
  'video-block',
  'button-block',
];

const PRO_SECTIONS: ElementBlockId[] = [
  'features-grid',
  'gallery-block',
  'faq-block',
  'stats-banner',
  'cta-banner',
  'footer-block',
  'testimonials-block',
];

export function V4BlocksPanel() {
  const document = useBuilderV4Store((s) => s.document);
  const insertCanvasBlock = useBuilderV4Store((s) => s.insertCanvasBlock);
  const isEmpty = isCanvasEmpty(document);

  function handleInsert(blockId: ElementBlockId) {
    insertCanvasBlock(blockId);
  }

  return (
    <div className="v4-panel v4-blocks-panel" data-testid="blocks-panel">
      <div className="v4-panel__head">
        <p className="v4-panel__title">SECTIONS</p>
        <p className="v4-panel__subtitle">
          {isEmpty ? 'Commencez votre page' : 'Ajoutez des sections'}
        </p>
      </div>
      <div className="v4-panel__scroll">
        <div className="v4-blocks-section mb-6">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Héros et Formulaires</p>
          <div className="v4-blocks-grid px-4">
            {HERO_AND_FORMS.map((id) => (
              <ElementBlockChip
                key={id}
                blockId={id}
                onClick={() => handleInsert(id)}
              />
            ))}
          </div>
        </div>

        <div className="v4-blocks-section mb-6">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Contenu et Médias</p>
          <div className="v4-blocks-grid px-4">
            {CONTENT_AND_MEDIA.map((id) => (
              <ElementBlockChip
                key={id}
                blockId={id}
                onClick={() => handleInsert(id)}
              />
            ))}
          </div>
        </div>

        <div className="v4-blocks-section mb-6">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sections Premium</p>
          <div className="v4-blocks-grid px-4">
            {PRO_SECTIONS.map((id) => (
              <ElementBlockChip
                key={id}
                blockId={id}
                onClick={() => handleInsert(id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
