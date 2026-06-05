import type { Data } from '@puckeditor/core';
import type { StudioV2DesignTokens, StudioV2RootProps, StudioV2SeoMeta } from './design-tokens/types';

export type { StudioV2DesignTokens, StudioV2RootProps, StudioV2SeoMeta };

export type StudioV2SaveStatus = 'saved' | 'dirty' | 'saving' | 'error' | 'loading';

export type StudioV2DocumentRecord = {
  id: string;
  pageVersionId: string;
  engine: string;
  documentJson: Data;
  createdAt: string;
  updatedAt: string;
};

export const ALLOWED_STUDIO_V2_COMPONENTS = [
  'Section',
  'Container',
  'Columns',
  'Spacer',
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
  'HeadingBlock',
  'ParagraphBlock',
  'ButtonBlock',
  'BadgeBlock',
  'DividerBlock',
  'CardBlock',
  'QuoteBlock',
  'StatsBlock',
  'TestimonialsBlock',
  'EventScheduleBlock',
  'FinancingHighlightBlock',
] as const;

export type AllowedStudioV2Component = (typeof ALLOWED_STUDIO_V2_COMPONENTS)[number];

export type BackgroundTone = 'white' | 'light' | 'soft' | 'dark' | 'brand' | 'gradient';
export type SpacingPreset = 'compact' | 'normal' | 'large' | 'hero';
export type ContentAlignment = 'left' | 'center';
export type ContainerMaxWidth = 'narrow' | 'default' | 'standard' | 'wide' | 'full';
export type ColumnRatio = '50-50' | '40-60' | '60-40' | '30-70' | '70-30';
export type ColumnGap = 'compact' | 'normal' | 'large';
export type HeroLayout = 'split_right' | 'split_left' | 'stacked';
export type HeroTone = 'white' | 'light' | 'dark' | 'brand' | 'gradient';

export type HeroAutoHallProps = {
  eyebrow?: string;
  promoBadge?: string;
  title?: string;
  subtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  layout?: HeroLayout;
  tone?: HeroTone;
  backgroundTone?: HeroTone;
  alignment?: ContentAlignment;
  imageAssetId?: string;
  imageUrl?: string;
  imageAlt?: string;
  showBadges?: boolean;
  badges?: string[];
};

export type LeadFormAutoHallProps = {
  title?: string;
  subtitle?: string;
  submitText?: string;
  consentText?: string;
  privacyNote?: string;
  showCivility?: boolean;
  splitFullName?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showVehicleModel?: boolean;
  showMessage?: boolean;
  layout?: 'card' | 'inline';
  alignment?: ContentAlignment;
  spacingPreset?: SpacingPreset;
};

export type VehicleOfferProps = {
  layout?: 'card' | 'split';
  title?: string;
  subtitle?: string;
  modelName?: string;
  offerLabel?: string;
  priceText?: string;
  highlights?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  imageAssetId?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type VehicleRangeCard = {
  name?: string;
  category?: string;
  energy?: string;
  priceText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageAssetId?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type VehicleRangeProps = {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  cardStyle?: 'clean' | 'bordered' | 'elevated';
  vehicles?: VehicleRangeCard[];
};

export type BenefitItem = {
  icon?: string;
  title?: string;
  description?: string;
};

export type BenefitsProps = {
  title?: string;
  subtitle?: string;
  layout?: 'cards' | 'list' | 'icons' | 'trust';
  items?: BenefitItem[];
};

export type StepsBlockProps = {
  title?: string;
  subtitle?: string;
  steps?: { title?: string; description?: string }[];
};

export type SpacerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export type MediaImageProps = {
  imageAssetId?: string;
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  alignment?: ContentAlignment;
};

export type FaqItem = {
  question?: string;
  answer?: string;
};

export type FAQProps = {
  title?: string;
  defaultOpenFirst?: boolean;
  items?: FaqItem[];
};

export type CTASectionProps = {
  layout?: 'band' | 'card' | 'minimal';
  tone?: BackgroundTone;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type FooterLink = {
  label?: string;
  href?: string;
};

export type FooterLegalProps = {
  brandName?: string;
  legalText?: string;
  links?: FooterLink[];
};

export type SectionProps = {
  backgroundTone?: BackgroundTone;
  spacingPreset?: SpacingPreset;
  spacing?: SpacingPreset;
  fullHeight?: boolean;
  anchorId?: string;
};

export type ContainerProps = {
  maxWidth?: ContainerMaxWidth;
  alignment?: ContentAlignment;
  align?: ContentAlignment;
};

export type ColumnsProps = {
  columnRatio?: ColumnRatio;
  columnGap?: ColumnGap;
  stackOnMobile?: boolean;
  mobileStack?: 'left_first' | 'right_first';
  verticalAlign?: 'top' | 'center' | 'bottom';
  alignment?: ContentAlignment;
};
