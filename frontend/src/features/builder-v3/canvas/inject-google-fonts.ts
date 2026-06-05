import { buildGoogleFontsUrl } from '../constants/google-fonts';

const GOOGLE_FONTS_LINK_ID = 'builder-v3-google-fonts';

/** Injecte ou met à jour le stylesheet Google Fonts dans le document cible (iframe). */
export function injectGoogleFonts(
  doc: Document,
  headingFont: string,
  bodyFont: string,
): void {
  const href = buildGoogleFontsUrl(headingFont, bodyFont);
  let link = doc.getElementById(GOOGLE_FONTS_LINK_ID) as HTMLLinkElement | null;

  if (!link) {
    link = doc.createElement('link');
    link.id = GOOGLE_FONTS_LINK_ID;
    link.rel = 'stylesheet';
    doc.head.appendChild(link);
  }

  if (link.href !== href) {
    link.href = href;
  }
}
