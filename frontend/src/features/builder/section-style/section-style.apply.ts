import {
  buildSectionStyleClasses,
  buildSectionStyleInlineStyle,
} from './section-style.classes';
import { isSectionStyleSupportedBlock, parseSectionStyle } from './section-style.registry';

export function mergeBlockSectionPresentation(
  baseClass: string,
  blockType: string,
  propsJson: Record<string, unknown>,
  baseInlineStyle: Record<string, string> = {},
): { className: string; style: Record<string, string> } {
  if (!isSectionStyleSupportedBlock(blockType)) {
    return { className: baseClass, style: baseInlineStyle };
  }

  const sectionStyle = parseSectionStyle(propsJson);
  return {
    className: `${baseClass} ${buildSectionStyleClasses(sectionStyle)}`.trim(),
    style: { ...baseInlineStyle, ...buildSectionStyleInlineStyle(sectionStyle) },
  };
}
