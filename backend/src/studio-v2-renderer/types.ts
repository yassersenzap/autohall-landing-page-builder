export type StudioV2DesignTokens = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  fontFamily: string;
  headingScale: 'compact' | 'normal' | 'large';
  sectionSpacing: 'compact' | 'normal' | 'large' | 'hero';
  buttonRadius: 'square' | 'rounded' | 'pill';
  buttonStyle: 'solid' | 'outline';
  pageMaxWidth: 'narrow' | 'standard' | 'wide' | 'full';
  cardRadius: 'none' | 'soft' | 'round';
  shadowStyle: 'none' | 'soft' | 'elevated';
};

export type StudioV2SeoMeta = {
  title?: string;
  description?: string;
};

export type StudioV2RootProps = {
  title?: string;
  themePreset?: string;
  designTokens?: Partial<StudioV2DesignTokens>;
  seo?: StudioV2SeoMeta;
};

export type PuckNode = {
  type: string;
  props: Record<string, unknown>;
};

export type PuckDocument = {
  root?: { props?: StudioV2RootProps };
  content?: PuckNode[];
};

export type StudioV2RenderMode = 'preview' | 'export';

export type StudioV2AssetEntry = {
  previewUrl: string;
  exportPath: string;
  absolutePath: string;
  storedName: string;
};

export type StudioV2AssetMap = Record<string, StudioV2AssetEntry>;

export type StudioV2RenderContext = {
  mode: StudioV2RenderMode;
  assetMap: StudioV2AssetMap;
  tokens: StudioV2DesignTokens;
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

export type AllowedStudioV2Component =
  (typeof ALLOWED_STUDIO_V2_COMPONENTS)[number];
