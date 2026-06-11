/**
 * Contrat design unifié — props whitelistées, sanitizées, rendues canvas + preview + export.
 */
export type LayoutVariant = string;
export type ContentAlignment = 'left' | 'center' | 'right';
export type MediaPosition = 'left' | 'right' | 'background' | 'none';
export type MediaFit = 'cover' | 'contain';
export type MediaFocal = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type SectionTone = 'light' | 'neutral' | 'dark';
export type WidthPreset = 'narrow' | 'normal' | 'wide';
export type SpacingPreset = 'compact' | 'normal' | 'spacious';
export type CardStyle = 'default' | 'elevated' | 'outline';
export type ButtonStyle = 'primary' | 'secondary' | 'ghost';
export type ButtonRadius = 'rounded' | 'pill' | 'square';
export type ButtonSize = 'md' | 'lg';
export type HeadingSize = 'small' | 'medium' | 'large' | 'xlarge';
export type OverlayOpacity = 'none' | 'light' | 'medium' | 'strong';
export type MediaRadius = 'none' | 'soft' | 'medium' | 'strong';
export type MediaShadow = 'none' | 'soft' | 'strong';

/** Props design exposées dans l’inspecteur — clés whitelistées. */
export type BlockDesignProps = {
  layoutVariant?: LayoutVariant;
  contentAlignment?: ContentAlignment;
  alignment?: ContentAlignment;
  mediaPosition?: MediaPosition;
  mediaFit?: MediaFit;
  mediaFocal?: MediaFocal;
  sectionTone?: SectionTone;
  backgroundMode?: SectionTone;
  widthPreset?: WidthPreset;
  contentWidth?: WidthPreset;
  spacingPreset?: SpacingPreset;
  paddingTop?: SpacingPreset;
  paddingBottom?: SpacingPreset;
  cardStyle?: CardStyle;
  buttonStyle?: ButtonStyle;
  buttonVariant?: ButtonStyle;
  buttonRadius?: ButtonRadius;
  buttonSize?: ButtonSize;
  headingSize?: HeadingSize;
  overlayOpacity?: OverlayOpacity;
  mediaRadius?: MediaRadius;
  mediaShadow?: MediaShadow;
  backgroundColor?: string;
  textColor?: string;
  headingColor?: string;
  ctaColor?: string;
};

export const BLOCK_DESIGN_PROP_KEYS = new Set<string>([
  'layoutVariant',
  'contentAlignment',
  'alignment',
  'mediaPosition',
  'mediaFit',
  'mediaFocal',
  'sectionTone',
  'backgroundMode',
  'widthPreset',
  'contentWidth',
  'spacingPreset',
  'paddingTop',
  'paddingBottom',
  'cardStyle',
  'buttonStyle',
  'buttonVariant',
  'buttonRadius',
  'buttonSize',
  'headingSize',
  'overlayOpacity',
  'mediaRadius',
  'mediaShadow',
  'backgroundColor',
  'textColor',
  'headingColor',
  'ctaColor',
]);

const ENUM_VALUES: Record<string, Set<string>> = {
  contentAlignment: new Set(['left', 'center', 'right']),
  alignment: new Set(['left', 'center', 'right']),
  mediaPosition: new Set(['left', 'right', 'background', 'none']),
  mediaFit: new Set(['cover', 'contain']),
  mediaFocal: new Set(['center', 'top', 'bottom', 'left', 'right']),
  sectionTone: new Set(['light', 'neutral', 'dark']),
  backgroundMode: new Set(['light', 'neutral', 'dark']),
  widthPreset: new Set(['narrow', 'normal', 'wide']),
  contentWidth: new Set(['narrow', 'normal', 'wide']),
  spacingPreset: new Set(['compact', 'normal', 'spacious']),
  paddingTop: new Set(['compact', 'normal', 'spacious']),
  paddingBottom: new Set(['compact', 'normal', 'spacious']),
  cardStyle: new Set(['default', 'elevated', 'outline']),
  buttonStyle: new Set(['primary', 'secondary', 'ghost']),
  buttonVariant: new Set(['primary', 'secondary', 'ghost']),
  buttonRadius: new Set(['rounded', 'pill', 'square']),
  buttonSize: new Set(['md', 'lg']),
  headingSize: new Set(['small', 'medium', 'large', 'xlarge']),
  overlayOpacity: new Set(['none', 'light', 'medium', 'strong']),
  mediaRadius: new Set(['none', 'soft', 'medium', 'strong']),
  mediaShadow: new Set(['none', 'soft', 'strong']),
};

const LAYOUT_WHITELIST = new Set([
  'split_image_right',
  'split_image_left',
  'centered',
  'background_image',
  'minimal',
  'card_right',
  'card_below',
  'full_width',
  'compact',
  'left_aligned',
  'two_columns',
  'contained',
  'full_bleed',
  'image_with_caption',
  'showcase',
  'grid_cards',
  'icon_list',
  'compact_row',
  'simple_band',
  'card',
  'dark_section',
  'legal_full',
  'minimal',
]);

function sanitizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return null;
}

/** Sanitize design patch — whitelist keys + enum/layout values. */
export function sanitizeBlockDesignProps(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!BLOCK_DESIGN_PROP_KEYS.has(key)) continue;
    if (typeof value !== 'string') continue;
    const trimmed = value.trim().slice(0, 120);
    if (trimmed.toLowerCase().startsWith('data:')) continue;

    if (key === 'layoutVariant') {
      if (LAYOUT_WHITELIST.has(trimmed)) out[key] = trimmed;
      continue;
    }

    if (key.endsWith('Color')) {
      const hex = sanitizeHexColor(trimmed);
      if (hex) out[key] = hex;
      continue;
    }

    const allowed = ENUM_VALUES[key];
    if (allowed && allowed.has(trimmed)) {
      out[key] = trimmed;
    }
  }

  return out;
}

export type BuilderDeviceMode = 'desktop' | 'tablet' | 'mobile';

export const IMAGE_ALIGNMENT_OPTIONS: { value: ImageAlignment; label: string }[] = [
  { value: 'right', label: 'Image à droite' },
  { value: 'left', label: 'Image à gauche' },
];

export const BACKGROUND_THEME_OPTIONS: {
  value: BlockBackgroundTheme;
  label: string;
}[] = [
  { value: 'light', label: 'Clair' },
  { value: 'neutral', label: 'Gris neutre' },
  { value: 'dark', label: 'Sombre (Brand)' },
];

/** @deprecated — legacy helpers kept for gradual migration */
export type ImageAlignment = 'right' | 'left';
export type BlockBackgroundTheme = 'light' | 'neutral' | 'dark';

export function parseImageAlignment(value: unknown): ImageAlignment {
  return value === 'left' ? 'left' : 'right';
}

export function parseBackgroundTheme(value: unknown): BlockBackgroundTheme {
  if (value === 'neutral' || value === 'dark') return value;
  return 'light';
}
