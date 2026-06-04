import { asPropString } from '../../lib/block-props';

type FinalCtaBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FinalCtaBlockPreview({ propsJson }: FinalCtaBlockPreviewProps) {
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const buttonText = asPropString(propsJson.buttonText) || 'Je passe à l’action';
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';

  return (
    <section className="lp-block lp-final-cta">
      <div className="lp-section">
        <div className="lp-final-cta__panel">
          {title ? <h2 className="lp-final-cta__title">{title}</h2> : null}
          {subtitle ? <p className="lp-final-cta__subtitle">{subtitle}</p> : null}
          <span className="lp-btn lp-btn--primary lp-btn--lg" data-href={buttonTarget}>
            {buttonText}
          </span>
        </div>
      </div>
    </section>
  );
}
