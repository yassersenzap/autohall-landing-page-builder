import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type RichTextBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function RichTextBlockPreview({ propsJson }: RichTextBlockPreviewProps) {
  const design = normalizeSectionDesign('rich_text', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-rich-text', design);
  const titre = asPropString(propsJson.titre) || asPropString(propsJson.title);
  const contenu = asPropString(propsJson.contenu) || asPropString(propsJson.content);
  const alignClass =
    design.alignment === 'left'
      ? 'lp-rich-text__inner--left'
      : 'lp-rich-text__inner--center';

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        <div className={`lp-rich-text__inner ${alignClass}`}>
          {titre ? (
            <h2 className="lp-rich-text__title">{titre}</h2>
          ) : (
            <CanvasEmptyHint className="lp-rich-text__title">Titre</CanvasEmptyHint>
          )}
          {contenu ? (
            <div className="lp-rich-text__body">
              <p className="lp-text__p">{contenu}</p>
            </div>
          ) : (
            <CanvasEmptyHint className="lp-rich-text__body">Contenu</CanvasEmptyHint>
          )}
        </div>
      </div>
    </section>
  );
}
