type SectionHeadingProps = {
  heading?: string;
  subtitle?: string;
};

export function SectionHeading({ heading, subtitle }: SectionHeadingProps) {
  if (!heading && !subtitle) return null;

  return (
    <div className="lp-section-head">
      {heading ? <h2 className="lp-section-title">{heading}</h2> : null}
      {subtitle ? <p className="lp-section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
