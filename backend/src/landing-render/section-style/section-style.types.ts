/** Mirror: frontend/src/features/builder/section-style/section-style.types.ts */
export const SECTION_PADDING_Y_VALUES = ['none', 'sm', 'md', 'lg', 'xl'] as const;
export type SectionPaddingY = (typeof SECTION_PADDING_Y_VALUES)[number];

export const SECTION_PADDING_X_VALUES = ['none', 'sm', 'md', 'lg'] as const;
export type SectionPaddingX = (typeof SECTION_PADDING_X_VALUES)[number];

export const SECTION_CONTAINER_WIDTH_VALUES = ['narrow', 'default', 'wide', 'full'] as const;
export type SectionContainerWidth = (typeof SECTION_CONTAINER_WIDTH_VALUES)[number];

export const SECTION_BACKGROUND_VALUES = [
  'default',
  'muted',
  'brand',
  'dark',
  'custom',
] as const;
export type SectionBackground = (typeof SECTION_BACKGROUND_VALUES)[number];

export const SECTION_VERTICAL_DENSITY_VALUES = ['compact', 'comfortable', 'spacious'] as const;
export type SectionVerticalDensity = (typeof SECTION_VERTICAL_DENSITY_VALUES)[number];

export const SECTION_CONTENT_ALIGNMENT_VALUES = ['left', 'center', 'right'] as const;
export type SectionContentAlignment = (typeof SECTION_CONTENT_ALIGNMENT_VALUES)[number];

export type NormalizedSectionStyle = {
  sectionPaddingY: SectionPaddingY;
  sectionPaddingX: SectionPaddingX;
  containerWidth: SectionContainerWidth;
  sectionBackground: SectionBackground;
  customBackgroundColor: string;
  verticalDensity: SectionVerticalDensity;
  contentAlignment: SectionContentAlignment;
  hideOnDesktop: boolean;
  hideOnTablet: boolean;
  hideOnMobile: boolean;
};
