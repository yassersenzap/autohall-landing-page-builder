/** Layout */
export const STUDIO_V2_LAYOUT_COMPONENTS = ['Section', 'Container', 'Columns', 'Spacer', 'StackBlock'] as const;

/** Sections marketing */
export const STUDIO_V2_MARKETING_COMPONENTS = [
  'HeroAutoHall',
  'VehicleOffer',
  'VehicleRange',
  'Benefits',
  'StepsBlock',
  'FAQ',
  'CTASection',
  'FooterLegal',
  'TestimonialsBlock',
  'EventScheduleBlock',
  'FinancingHighlightBlock',
] as const;

/** Conversion */
export const STUDIO_V2_CONVERSION_COMPONENTS = ['LeadFormAutoHall'] as const;

/** Média */
export const STUDIO_V2_MEDIA_COMPONENTS = ['MediaImage', 'TextImageBlock'] as const;

/** Creative atomic blocks */
export const STUDIO_V2_CREATIVE_ATOMIC = [
  'HeadingBlock',
  'ParagraphBlock',
  'ButtonBlock',
  'BadgeBlock',
  'DividerBlock',
] as const;

/** Creative compound blocks */
export const STUDIO_V2_CREATIVE_COMPOUND = [
  'CardBlock',
  'QuoteBlock',
  'StatsBlock',
] as const;

export const STUDIO_V2_CREATIVE_BLOCKS = [
  ...STUDIO_V2_CREATIVE_ATOMIC,
  ...STUDIO_V2_CREATIVE_COMPOUND,
] as const;

/** @deprecated grouped alias */
export const STUDIO_V2_SECTION_COMPONENTS = [
  ...STUDIO_V2_MARKETING_COMPONENTS.filter((c) => c !== 'HeroAutoHall'),
] as const;

export const STUDIO_V2_BLOCK_COMPONENTS = ['HeroAutoHall', 'LeadFormAutoHall'] as const;

export const STUDIO_V2_ALL_COMPONENTS = [
  ...STUDIO_V2_LAYOUT_COMPONENTS,
  ...STUDIO_V2_MARKETING_COMPONENTS,
  ...STUDIO_V2_CONVERSION_COMPONENTS,
  ...STUDIO_V2_MEDIA_COMPONENTS,
  ...STUDIO_V2_CREATIVE_BLOCKS,
] as const;

export const STUDIO_V2_CREATIVE_SLOT_ALLOW = [
  ...STUDIO_V2_CREATIVE_ATOMIC,
  'Spacer',
  'DividerBlock',
  'CardBlock',
  'QuoteBlock',
  'ButtonBlock',
  'BadgeBlock',
  'MediaImage',
] as const;

export const STUDIO_V2_SLOT_CHILDREN = [
  ...STUDIO_V2_LAYOUT_COMPONENTS,
  ...STUDIO_V2_MARKETING_COMPONENTS,
  ...STUDIO_V2_CONVERSION_COMPONENTS,
  ...STUDIO_V2_MEDIA_COMPONENTS,
  ...STUDIO_V2_CREATIVE_BLOCKS,
] as const;

export const STUDIO_V2_SECTION_SLOT_ALLOW = [...STUDIO_V2_SLOT_CHILDREN] as const;

export const STUDIO_V2_CONTAINER_SLOT_ALLOW = [
  'Columns',
  'StackBlock',
  'HeroAutoHall',
  'LeadFormAutoHall',
  'VehicleOffer',
  'VehicleRange',
  'Benefits',
  'StepsBlock',
  'FAQ',
  'CTASection',
  'FooterLegal',
  'MediaImage',
  'TextImageBlock',
  'TestimonialsBlock',
  'EventScheduleBlock',
  'FinancingHighlightBlock',
  'StatsBlock',
  ...STUDIO_V2_CREATIVE_BLOCKS,
] as const;

export const STUDIO_V2_COLUMN_SLOT_ALLOW = [
  'HeroAutoHall',
  'LeadFormAutoHall',
  'Container',
  'StackBlock',
  'VehicleOffer',
  'Benefits',
  'CTASection',
  'MediaImage',
  'TextImageBlock',
  ...STUDIO_V2_CREATIVE_BLOCKS,
] as const;

export const STUDIO_V2_BENEFIT_ICONS = [
  'shield',
  'car',
  'phone',
  'clock',
  'map',
  'star',
  'check',
  'wrench',
  'battery',
  'fuel',
] as const;
