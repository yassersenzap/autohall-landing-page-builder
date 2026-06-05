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

export type StudioV2ThemePresetId =
  | 'autohall-blue'
  | 'ford-promo'
  | 'sav-red'
  | 'gamme-hev-green'
  | 'premium-dark';

export type StudioV2SeoMeta = {
  title?: string;
  description?: string;
};

export type StudioV2RootProps = {
  title?: string;
  themePreset?: StudioV2ThemePresetId | string;
  designTokens?: Partial<StudioV2DesignTokens>;
  seo?: StudioV2SeoMeta;
};
