import { asPropString } from '@/features/builder-engine/lib/block-props';
import { buildBlockDesignClasses, normalizeSectionDesign } from '@/features/builder-engine/lib/block-design-system';

type FooterLegalBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FooterLegalBlockPreview({ propsJson }: FooterLegalBlockPreviewProps) {
  const design = normalizeSectionDesign('footer_legal', propsJson);
  const sectionClass = buildBlockDesignClasses('lp-footer-legal', design);
  const legalText = asPropString(propsJson.legalText);
  const rawLinks = Array.isArray(propsJson.links) ? propsJson.links : [];
  const links = rawLinks as Array<{ label?: string; href?: string }>;

  return (
    <footer className={`lp-block ${sectionClass}`}>
      <div className="lp-section">
        {legalText ? <p className="lp-footer-legal__text">{legalText}</p> : null}
        {links.length > 0 ? (
          <nav className="lp-footer-legal__links">
            {links.map((link, index) => {
              const label = link.label;
              const href = link.href || '#';
              if (!label) return null;
              return (
                <a key={`${label}-${index}`} className="lp-footer-legal__link" href={href}>
                  {label}
                </a>
              );
            })}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
