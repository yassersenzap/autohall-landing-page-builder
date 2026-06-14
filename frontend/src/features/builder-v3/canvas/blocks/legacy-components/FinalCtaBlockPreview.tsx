import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  buildButtonClasses,
  buildCanvasInlineStyle,
  buildCanvasSectionClass,
  getDesignFromProps,
} from '@/features/builder-engine/lib/block-style';
import { CanvasCtaLink } from '../CanvasCtaLink';
import { CanvasEmptyHint } from '../CanvasEmptyHint';

type FinalCtaBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function FinalCtaBlockPreview({
  propsJson,
  interactive = false,
}: FinalCtaBlockPreviewProps) {
  const design = getDesignFromProps('final_cta', propsJson);
  const sectionClass = buildCanvasSectionClass('final_cta', 'lp-final-cta', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const btnClass = buildButtonClasses(design);
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';

  return (
    <section className={sectionClass} style={inlineStyle}>
      <div className="lp-section">
        <div className="lp-final-cta__panel">
          {title ? (
            <h2 className="lp-final-cta__title">{title}</h2>
          ) : (
            <CanvasEmptyHint className="lp-final-cta__title">Titre de conversion</CanvasEmptyHint>
          )}
          {subtitle ? <p className="lp-final-cta__subtitle">{subtitle}</p> : null}
          {buttonText ? (
            <CanvasCtaLink href={buttonTarget} className={btnClass} interactive={interactive}>
              {buttonText}
            </CanvasCtaLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
