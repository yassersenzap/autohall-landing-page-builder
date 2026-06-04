import { parseHeroProps } from '../../lib/block-props';

type HeroBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

/**
 * Preview React alignée sur le rendu public `.lp-hero` (landing-page.css).
 */
export function HeroBlockPreview({ propsJson }: HeroBlockPreviewProps) {
  const props = parseHeroProps(propsJson);

  const media = props.imageUrl ? (
    <div className="lp-hero__media">
      <img
        className="lp-hero__img"
        src={props.imageUrl}
        alt={props.alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  ) : (
    <div className="lp-hero__media lp-hero__media--placeholder" aria-hidden="true">
      <span>Visuel véhicule / offre</span>
    </div>
  );

  return (
    <section className="lp-block lp-hero">
      <div className="lp-hero__glow" aria-hidden="true" />
      <div className="lp-hero__inner lp-section">
        <div className="lp-hero__content">
          {props.eyebrow ? <p className="lp-hero__eyebrow">{props.eyebrow}</p> : null}
          {props.title ? <h1 className="lp-hero__title">{props.title}</h1> : null}
          {props.subtitle ? <p className="lp-hero__subtitle">{props.subtitle}</p> : null}
          {props.buttonText || props.secondaryButtonText ? (
            <div className="lp-hero__actions">
              {props.buttonText ? (
                <span className="lp-btn lp-btn--primary lp-btn--lg">{props.buttonText}</span>
              ) : null}
              {props.secondaryButtonText ? (
                <span className="lp-btn lp-btn--secondary lp-btn--lg">
                  {props.secondaryButtonText}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {media}
      </div>
    </section>
  );
}
