export type GoogleFontOption = {
  value: string;
  label: string;
};

/** Polices Google Fonts premium — liste stricte pour le thème global. */
export const GOOGLE_FONT_OPTIONS: GoogleFontOption[] = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
];

function fontFamilyParam(family: string): string {
  return `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`;
}

export function buildGoogleFontsUrl(headingFont: string, bodyFont: string): string {
  const unique = [...new Set([headingFont, bodyFont].filter(Boolean))];
  const params = unique.map(fontFamilyParam).join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function resolveThemeFonts(theme: {
  headingFont?: string;
  bodyFont?: string;
  fontFamily?: string;
}): { headingFont: string; bodyFont: string } {
  return {
    headingFont: theme.headingFont ?? theme.fontFamily ?? 'Inter',
    bodyFont: theme.bodyFont ?? 'Roboto',
  };
}
