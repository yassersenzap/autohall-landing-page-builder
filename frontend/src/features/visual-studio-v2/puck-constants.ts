export const STUDIO_V2_LAYOUT_COMPONENTS = ['Section', 'Container', 'Columns'] as const;

export const STUDIO_V2_SECTION_COMPONENTS = [
  'VehicleOffer',
  'VehicleRange',
  'Benefits',
  'FAQ',
  'CTASection',
  'FooterLegal',
] as const;

export const STUDIO_V2_BLOCK_COMPONENTS = ['HeroAutoHall', 'LeadFormAutoHall'] as const;

export const STUDIO_V2_ALL_COMPONENTS = [
  ...STUDIO_V2_LAYOUT_COMPONENTS,
  ...STUDIO_V2_SECTION_COMPONENTS,
  ...STUDIO_V2_BLOCK_COMPONENTS,
] as const;

/** @deprecated Use STUDIO_V2_BLOCK_COMPONENTS */
export const STUDIO_V2_AUTOHALL_COMPONENTS = STUDIO_V2_BLOCK_COMPONENTS;

export const STUDIO_V2_SECTION_SLOT_ALLOW = [
  'Container',
  'Columns',
  'HeroAutoHall',
  'LeadFormAutoHall',
  'VehicleOffer',
  'VehicleRange',
  'Benefits',
  'FAQ',
  'CTASection',
  'FooterLegal',
] as const;

export const STUDIO_V2_CONTAINER_SLOT_ALLOW = [
  'Columns',
  'HeroAutoHall',
  'LeadFormAutoHall',
  'VehicleOffer',
  'VehicleRange',
  'Benefits',
  'FAQ',
  'CTASection',
  'FooterLegal',
] as const;

export const STUDIO_V2_COLUMN_SLOT_ALLOW = [
  'HeroAutoHall',
  'LeadFormAutoHall',
  'Container',
  'VehicleOffer',
  'Benefits',
  'CTASection',
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
