import type { NormalizedSectionStyle } from './section-style.types';
import { parseSectionStyle } from './section-style.registry';

/** Mirror: frontend/src/features/builder/section-style/section-style.classes.ts */
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

export function buildSectionStyleInlineStyle(style: NormalizedSectionStyle): string {
  if (style.sectionBackground === 'custom' && style.customBackgroundColor) {
    return `background-color: ${style.customBackgroundColor}`;
  }
  return '';
}

export function appendSectionStyleToClass(
  baseClass: string,
  props: Record<string, unknown>,
): string {
  return `${baseClass} ${buildSectionStyleClasses(parseSectionStyle(props))}`.trim();
}

export function appendSectionStyleToInlineStyle(
  baseInline: string,
  props: Record<string, unknown>,
): string {
  const extra = buildSectionStyleInlineStyle(parseSectionStyle(props));
  if (!extra) return baseInline;
  return baseInline ? `${baseInline}; ${extra}` : extra;
}
