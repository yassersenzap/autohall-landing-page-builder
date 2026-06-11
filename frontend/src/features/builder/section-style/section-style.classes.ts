import type { NormalizedSectionStyle } from './section-style.types';

export function buildSectionStyleClasses(style: NormalizedSectionStyle): string {
  const classes = [
    'lp-section-style',
    `lp-section-style--pad-y-${style.sectionPaddingY}`,
    `lp-section-style--pad-x-${style.sectionPaddingX}`,
    `lp-section-style--container-${style.containerWidth}`,
    `lp-section-style--bg-${style.sectionBackground}`,
    `lp-section-style--density-${style.verticalDensity}`,
    `lp-section-style--align-${style.contentAlignment}`,
  ];

  if (style.hideOnDesktop) classes.push('lp-section-style--hide-desktop');
  if (style.hideOnTablet) classes.push('lp-section-style--hide-tablet');
  if (style.hideOnMobile) classes.push('lp-section-style--hide-mobile');

  return classes.join(' ');
}

export function buildSectionStyleInlineStyle(
  style: NormalizedSectionStyle,
): Record<string, string> {
  if (style.sectionBackground === 'custom' && style.customBackgroundColor) {
    return { backgroundColor: style.customBackgroundColor };
  }
  return {};
}

export function appendSectionStyleClasses(
  baseClasses: string,
  propsJson: Record<string, unknown>,
  parse: (props: Record<string, unknown>) => NormalizedSectionStyle,
): string {
  const style = parse(propsJson);
  return `${baseClasses} ${buildSectionStyleClasses(style)}`.trim();
}

export function appendSectionStyleInlineStyle(
  baseStyle: Record<string, string>,
  propsJson: Record<string, unknown>,
  parse: (props: Record<string, unknown>) => NormalizedSectionStyle,
): Record<string, string> {
  const style = parse(propsJson);
  return { ...baseStyle, ...buildSectionStyleInlineStyle(style) };
}
