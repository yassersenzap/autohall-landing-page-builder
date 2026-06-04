import { asPropString } from '../../lib/block-props';
import { parseFooterLinks } from '../../lib/list-props';

type FooterLegalBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FooterLegalBlockPreview({ propsJson }: FooterLegalBlockPreviewProps) {
  const legalText =
    asPropString(propsJson.legalText) ||
    'Mentions légales — Auto Hall. Offre soumise à conditions.';
  const links = parseFooterLinks(propsJson);

  return (
    <section className="lp-block lp-footer-legal">
      <div className="lp-section">
        <p className="lp-footer-legal__text">{legalText}</p>
        {links.length > 0 ? (
          <div className="lp-footer-legal__links">
            {links.map((link, index) => (
              <span key={`${link.label}-${index}`} className="lp-footer-legal__link">
                {link.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
