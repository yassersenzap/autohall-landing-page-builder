import type { NormalizedSectionStyle } from './section-style.types';
import {
  SECTION_BACKGROUND_VALUES,
  SECTION_CONTAINER_WIDTH_VALUES,
  SECTION_CONTENT_ALIGNMENT_VALUES,
  SECTION_PADDING_X_VALUES,
  SECTION_PADDING_Y_VALUES,
  SECTION_VERTICAL_DENSITY_VALUES,
} from './section-style.types';

/** Mirror: frontend/src/features/builder/section-style/section-style.registry.ts */
export const DEFAULT_SECTION_STYLE: NormalizedSectionStyle = {
  sectionPaddingY: 'md',
  sectionPaddingX: 'md',
  containerWidth: 'default',
  sectionBackground: 'default',
  customBackgroundColor: '',
  verticalDensity: 'comfortable',
  contentAlignment: 'left',
  hideOnDesktop: false,
  hideOnTablet: false,
  hideOnMobile: false,
};

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function sanitizeHexColor(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return '';
}

export function parseSectionStyle(props: Record<string, unknown>): NormalizedSectionStyle {
  const raw =
    props.sectionStyle &&
    typeof props.sectionStyle === 'object' &&
    !Array.isArray(props.sectionStyle)
      ? (props.sectionStyle as Record<string, unknown>)
      : {};

  return {
    sectionPaddingY: pickEnum(
      raw.sectionPaddingY,
      SECTION_PADDING_Y_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingY,
    ),
    sectionPaddingX: pickEnum(
      raw.sectionPaddingX,
      SECTION_PADDING_X_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingX,
    ),
    containerWidth: pickEnum(
      raw.containerWidth,
      SECTION_CONTAINER_WIDTH_VALUES,
      DEFAULT_SECTION_STYLE.containerWidth,
    ),
    sectionBackground: pickEnum(
      raw.sectionBackground,
      SECTION_BACKGROUND_VALUES,
      DEFAULT_SECTION_STYLE.sectionBackground,
    ),
    customBackgroundColor: sanitizeHexColor(raw.customBackgroundColor),
    verticalDensity: pickEnum(
      raw.verticalDensity,
      SECTION_VERTICAL_DENSITY_VALUES,
      DEFAULT_SECTION_STYLE.verticalDensity,
    ),
    contentAlignment: pickEnum(
      raw.contentAlignment,
      SECTION_CONTENT_ALIGNMENT_VALUES,
      DEFAULT_SECTION_STYLE.contentAlignment,
    ),
    hideOnDesktop: raw.hideOnDesktop === true,
    hideOnTablet: raw.hideOnTablet === true,
    hideOnMobile: raw.hideOnMobile === true,
  };
}
