import { asPropString } from '../../lib/block-props';
import { parseFooterLinks } from '../../lib/list-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type FooterLegalBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FooterLegalBlockPreview({ propsJson }: FooterLegalBlockPreviewProps) {
  const legalText = asPropString(propsJson.legalText);
  const links = parseFooterLinks(propsJson);

  return (
    <section className="lp-block lp-footer-legal">
      <div className="lp-section">
        {legalText ? (
          <p className="lp-footer-legal__text">{legalText}</p>
        ) : (
          <CanvasEmptyHint className="lp-footer-legal__text text-zinc-400">
            Renseignez les mentions légales
          </CanvasEmptyHint>
        )}
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
