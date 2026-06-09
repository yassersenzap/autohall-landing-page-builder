import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockCtaClass, buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { CanvasCtaLink } from './CanvasCtaLink';

type TrimItem = {
  name?: string;
  price?: string;
  features?: string[];
  buttonText?: string;
  buttonHref?: string;
  featured?: boolean;
};

type PricingTrimBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function PricingTrimBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: PricingTrimBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const interactive = interactiveProp ?? previewContext.interactive;
  const design = normalizeSectionDesign('pricing_trim', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-pricing-trim', design);

  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const rawTrims = Array.isArray(propsJson.trims) ? propsJson.trims : [];
  const trims = (rawTrims as TrimItem[]).slice(0, 3);

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-pricing-trim__grid">
          {trims.map((trim, index) => {
            const name = trim.name;
            const price = trim.price;
            const features = Array.isArray(trim.features) ? trim.features : [];
            const buttonText = trim.buttonText;
            const buttonHref = trim.buttonHref || '#lead-form';
            const featured = Boolean(trim.featured);
            const btnClass = buildBlockCtaClass(
              { ...design, ctaStyle: featured ? 'primary' : 'outline' },
              'lp-btn lp-btn--md lp-pricing-trim__cta',
            );
            if (!name && !price) return null;
            return (
              <article
                key={`${name ?? 'trim'}-${index}`}
                className={
                  featured
                    ? 'lp-pricing-trim__card lp-pricing-trim__card--featured'
                    : 'lp-pricing-trim__card'
                }
              >
                {name ? <h3 className="lp-pricing-trim__name">{name}</h3> : null}
                {price ? <p className="lp-pricing-trim__price">{price}</p> : null}
                {features.length > 0 ? (
                  <ul className="lp-pricing-trim__features">
                    {features.map((feature, fi) => (
                      <li key={`${feature}-${fi}`} className="lp-pricing-trim__feature">
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {buttonText ? (
                  <CanvasCtaLink href={buttonHref} interactive={interactive} className={btnClass}>
                    {buttonText}
                  </CanvasCtaLink>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
