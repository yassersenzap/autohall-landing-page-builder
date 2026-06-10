/** Stable identifier for an Auto Hall distributed brand. */
export type BrandPresetId =
  | 'opel'
  | 'ford'
  | 'dfsk'
  | 'nissan'
  | 'mitsubishi'
  | 'fiat'
  | 'fuso'
  | 'chery'
  | 'foton'
  | 'seres'
  | 'jeep'
  | 'gaz'
  | 'alfa_romeo'
  | 'ford_trucks'
  | 'maserati'
  | 'industriel_agricole';

/** Commercial / visual family used to group presets. */
export type BrandPresetCategory =
  | 'european_mainstream'
  | 'american_adventure'
  | 'japanese_reliability'
  | 'chinese_value_tech'
  | 'premium_luxury'
  | 'commercial_fleet';

/** Default page mood suggested by the preset. */
export type BrandPresetTone = 'light' | 'dark' | 'mixed';

/** Abstract typography strategy — resolved to concrete fonts at render time. */
export type BrandFontStrategy =
  | 'geometric-sans'
  | 'humanist-sans'
  | 'condensed-display'
  | 'luxury-serif'
  | 'industrial-sans'
  | 'modern-tech-sans';

export type BrandButtonStyle = 'pill' | 'rounded' | 'rectangular' | 'ghost';

export type BrandImageStyle =
  | 'studio-cutout'
  | 'lifestyle-bleed'
  | 'cinematic'
  | 'utility-side';

/** Premium block type keys recommended for page starters. */
export type RecommendedBlockType =
  | 'hero_vehicle_offer'
  | 'hero_form_campaign'
  | 'hero_campaign'
  | 'vehicle_features'
  | 'vehicle_range'
  | 'gallery'
  | 'media_only'
  | 'pricing_trim'
  | 'benefits'
  | 'trust_bar'
  | 'testimonials'
  | 'faq'
  | 'cta_band'
  | 'lead_form'
  | 'final_cta'
  | 'footer_legal'
  | 'rich_text'
  | 'video_embed';

export type BrandPreset = {
  id: BrandPresetId;
  name: string;
  category: BrandPresetCategory;
  tone: BrandPresetTone;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontStrategy: BrandFontStrategy;
  buttonStyle: BrandButtonStyle;
  imageStyle: BrandImageStyle;
  recommendedBlocks: RecommendedBlockType[];
};

/** Token fields every preset must define — used by unit tests. */
export const BRAND_PRESET_REQUIRED_TOKEN_KEYS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'textColor',
  'fontStrategy',
  'buttonStyle',
  'imageStyle',
] as const satisfies ReadonlyArray<keyof BrandPreset>;

export type BrandPresetTokenKey = (typeof BRAND_PRESET_REQUIRED_TOKEN_KEYS)[number];
