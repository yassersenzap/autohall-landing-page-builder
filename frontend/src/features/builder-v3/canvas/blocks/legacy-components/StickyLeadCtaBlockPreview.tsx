import { asPropString } from '@/features/builder-engine/lib/block-props';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import { CanvasCtaLink } from '../CanvasCtaLink';
import { CanvasEmptyHint } from '../CanvasEmptyHint';

type StickyLeadCtaBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function sectionClass(
  base: string,
  blockType: string,
  propsJson: Record<string, unknown>,
  extra = '',
) {
  const { className } = mergeBlockSectionPresentation(base, blockType, propsJson);
  return extra ? `${className} ${extra}`.trim() : className;
}

export function StickyLeadCtaBlockPreview({ propsJson }: StickyLeadCtaBlockPreviewProps) {
  const stickyMode = asPropString(propsJson.stickyMode) || 'bottom';
  const style = asPropString(propsJson.style) || 'brand';

  return (
    <section
      className={sectionClass(
        'lp-block lp-sticky-cta',
        'sticky_lead_cta',
        propsJson,
        `lp-sticky-cta--mode-${stickyMode} lp-sticky-cta--style-${style}`,
      )}
    >
      <div className="lp-sticky-cta__inner">
        <div className="lp-sticky-cta__copy">
          {asPropString(propsJson.label) ? (
            <p className="lp-sticky-cta__label">{asPropString(propsJson.label)}</p>
          ) : null}
          {asPropString(propsJson.title) ? (
            <p className="lp-sticky-cta__title">{asPropString(propsJson.title)}</p>
          ) : (
            <CanvasEmptyHint className="lp-sticky-cta__title">CTA conversion</CanvasEmptyHint>
          )}
        </div>
        <div className="lp-sticky-cta__actions">
          {asPropString(propsJson.primaryCtaLabel) ? (
            <CanvasCtaLink
              interactive={false}
              href={asPropString(propsJson.primaryCtaHref) || '#lead-form'}
              className="lp-btn lp-btn--primary lp-btn--md"
            >
              {asPropString(propsJson.primaryCtaLabel)}
            </CanvasCtaLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
