import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type TestimonialItem = {
  quote?: string;
  author?: string;
  role?: string;
};

type TestimonialBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function TestimonialBlockPreview({ propsJson }: TestimonialBlockPreviewProps) {
  const design = normalizeSectionDesign('testimonials', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-testimonials', design);
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as TestimonialItem[]).slice(0, 6);

  return (
    <section className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {heading || subtitle ? (
          <div className="lp-section-head">
            {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
            {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="lp-testimonials__grid">
          {items.map((item, index) => {
            const quote = item.quote;
            const author = item.author;
            if (!quote) return null;
            return (
              <blockquote key={`${author ?? 'quote'}-${index}`} className="lp-testimonial-card">
                <p className="lp-testimonial-card__text">« {quote} »</p>
                <footer className="lp-testimonial-card__author">
                  {author ? <strong>{author}</strong> : null}
                  {item.role ? <span>{item.role}</span> : null}
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}
