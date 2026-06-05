import { asPropString } from '../../lib/block-props';
import { buildCanvasInlineStyle, buildCanvasSectionClass, getDesignFromProps } from '../../lib/block-style';
import { parseFooterLinks } from '../../lib/list-props';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type FooterLegalBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FooterLegalBlockPreview({ propsJson }: FooterLegalBlockPreviewProps) {
  const design = getDesignFromProps('footer_legal', propsJson);
  const sectionClass = buildCanvasSectionClass('footer_legal', 'lp-footer-legal', propsJson);
  const inlineStyle = buildCanvasInlineStyle(design);
  const legalText = asPropString(propsJson.legalText);
  const links = parseFooterLinks(propsJson);

  return (
    <section className={sectionClass} style={inlineStyle}>
      <div className="lp-section">
        {legalText ? (
          <p className="lp-footer-legal__text">{legalText}</p>
        ) : (
          <CanvasEmptyHint className="lp-footer-legal__text">
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
