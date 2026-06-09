import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockCtaClass, buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { CanvasCtaLink } from './CanvasCtaLink';

type CTABandBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function CTABandBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: CTABandBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const interactive = interactiveProp ?? previewContext.interactive;
  const design = normalizeSectionDesign('cta_band', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-cta-band', design);
  const btnClass = buildBlockCtaClass(design, 'lp-btn lp-btn--md');

  const title = asPropString(propsJson.title);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonHref = asPropString(propsJson.buttonHref) || '#lead-form';

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section lp-cta-band__inner">
        {title ? <p className="lp-cta-band__text">{title}</p> : null}
        {buttonText ? (
          <CanvasCtaLink href={buttonHref} interactive={interactive} className={btnClass}>
            {buttonText}
          </CanvasCtaLink>
        ) : null}
      </div>
    </section>
  );
}
