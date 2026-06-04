import { asPropString } from '../../lib/block-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type FinalCtaBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FinalCtaBlockPreview({ propsJson }: FinalCtaBlockPreviewProps) {
  const title = asPropString(propsJson.title);
  const subtitle = asPropString(propsJson.subtitle);
  const buttonText = asPropString(propsJson.buttonText);
  const buttonTarget = asPropString(propsJson.buttonTarget) || '#lead-form';

  return (
    <section className="lp-block lp-final-cta">
      <div className="lp-section">
        <div className="lp-final-cta__panel">
          {title ? (
            <h2 className="lp-final-cta__title">{title}</h2>
          ) : (
            <CanvasEmptyHint className="text-zinc-500">Titre du CTA à renseigner</CanvasEmptyHint>
          )}
          {subtitle ? (
            <p className="lp-final-cta__subtitle">{subtitle}</p>
          ) : (
            <CanvasEmptyHint className="mt-2 text-zinc-400">
              Texte d’accompagnement à renseigner
            </CanvasEmptyHint>
          )}
          {buttonText ? (
            <span className="lp-btn lp-btn--primary lp-btn--lg" data-href={buttonTarget}>
              {buttonText}
            </span>
          ) : (
            <CanvasEmptyHint className="mt-3 text-zinc-400">
              Texte du bouton à renseigner
            </CanvasEmptyHint>
          )}
        </div>
      </div>
    </section>
  );
}
