/**
 * Modèle de style contrôlé — source de vérité backend (preview + export ZIP).
 * Le frontend mirror dans builder-engine/lib/block-style.ts doit rester aligné.
 */

export type BackgroundMode = 'light' | 'neutral' | 'dark';
export type SpacingPreset = 'compact' | 'normal' | 'spacious';
export type ContentWidth = 'narrow' | 'normal' | 'wide';
export type TextAlignment = 'left' | 'center' | 'right';
export type MediaFit = 'cover' | 'contain';
export type MediaFocal = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type MediaRadius = 'none' | 'soft' | 'medium' | 'strong';
export type MediaShadow = 'none' | 'soft' | 'strong';
export type OverlayOpacity = 'none' | 'light' | 'medium' | 'strong';
export type HeadingSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';
export type ButtonRadius = 'rounded' | 'pill' | 'square';

export type NormalizedBlockDesign = {
  layoutVariant: string;
  backgroundMode: BackgroundMode;
  paddingTop: SpacingPreset;
  paddingBottom: SpacingPreset;
  contentWidth: ContentWidth;
  alignment: TextAlignment;
  mediaPosition: 'left' | 'right' | 'background' | 'none';
  mediaFit: MediaFit;
  mediaFocal: MediaFocal;
  mediaRadius: MediaRadius;
  mediaShadow: MediaShadow;
  overlayOpacity: OverlayOpacity;
  headingSize: HeadingSize;
  buttonVariant: ButtonVariant;
  buttonSize: ButtonSize;
  buttonRadius: ButtonRadius;
  backgroundColor: string | null;
  textColor: string | null;
  headingColor: string | null;
  ctaColor: string | null;
};

const HERO_LAYOUTS = new Set([
  'split_image_right',
  'split_image_left',
  'centered',
  'background_image',
  'minimal',
]);

const FORM_LAYOUTS = new Set(['card_right', 'card_below', 'full_width', 'compact']);
const TEXT_LAYOUTS = new Set(['centered', 'left_aligned', 'two_columns']);
const IMAGE_LAYOUTS = new Set(['contained', 'full_bleed', 'image_with_caption']);
const FEATURES_LAYOUTS = new Set([
  'showcase',
  'grid_cards',
  'icon_list',
  'compact_row',
]);
const CTA_LAYOUTS = new Set(['simple_band', 'card', 'dark_section']);
const FOOTER_LAYOUTS = new Set(['minimal', 'legal_full']);

function pickEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
  fallback: T,
): T {
  return typeof value === 'string' && allowed.has(value as T)
    ? (value as T)
    : fallback;
}

function pickSpacing(value: unknown, fallback: SpacingPreset): SpacingPreset {
  return pickEnum(value, new Set(['compact', 'normal', 'spacious']), fallback);
}

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return null;
}

export function extractDesignRaw(props: Record<string, unknown>): Record<string, unknown> {
  const design = props.design;
  if (design && typeof design === 'object' && !Array.isArray(design)) {
    return design as Record<string, unknown>;
  }
  return {};
}

function legacyBackgroundMode(props: Record<string, unknown>): BackgroundMode {
  const v = props.backgroundTheme;
  if (v === 'neutral' || v === 'dark') return v;
  return 'light';
}

function legacyMediaPosition(props: Record<string, unknown>): 'left' | 'right' {
  return props.imageAlignment === 'left' ? 'left' : 'right';
}

function defaultHeroLayout(props: Record<string, unknown>, raw: Record<string, unknown>): string {
  const fromDesign = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  if (HERO_LAYOUTS.has(fromDesign)) return fromDesign;
  if (raw.mediaPosition === 'background') return 'background_image';
  if (legacyMediaPosition(props) === 'left') return 'split_image_left';
  return 'split_image_right';
}

function defaultFormLayout(raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  return FORM_LAYOUTS.has(v) ? v : 'card_right';
}

function defaultTextLayout(raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  return TEXT_LAYOUTS.has(v) ? v : 'left_aligned';
}

function defaultImageLayout(raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  return IMAGE_LAYOUTS.has(v) ? v : 'contained';
}

function defaultFeaturesLayout(props: Record<string, unknown>, raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  if (FEATURES_LAYOUTS.has(v)) return v;
  if (props.layout === 'showcase' || propHasImage(props)) return 'showcase';
  return 'grid_cards';
}

function propHasImage(props: Record<string, unknown>): boolean {
  return (
    (typeof props.imageUrl === 'string' && props.imageUrl.trim() !== '') ||
    (typeof props.imageAssetId === 'string' && props.imageAssetId.trim() !== '')
  );
}

function defaultCtaLayout(raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  return CTA_LAYOUTS.has(v) ? v : 'simple_band';
}

function defaultFooterLayout(raw: Record<string, unknown>): string {
  const v = typeof raw.layoutVariant === 'string' ? raw.layoutVariant : '';
  return FOOTER_LAYOUTS.has(v) ? v : 'legal_full';
}

function resolveLayoutVariant(
  blockType: string,
  props: Record<string, unknown>,
  raw: Record<string, unknown>,
): string {
  switch (blockType) {
    case 'hero':
      return defaultHeroLayout(props, raw);
    case 'lead_form':
      return defaultFormLayout(raw);
    case 'text':
      return defaultTextLayout(raw);
    case 'image':
      return defaultImageLayout(raw);
    case 'features':
      return defaultFeaturesLayout(props, raw);
    case 'final_cta':
      return defaultCtaLayout(raw);
    case 'footer_legal':
      return defaultFooterLayout(raw);
    default:
      return typeof raw.layoutVariant === 'string' ? raw.layoutVariant : 'default';
  }
}

export function normalizeBlockDesign(
  blockType: string,
  props: Record<string, unknown>,
): NormalizedBlockDesign {
  const raw = extractDesignRaw(props);
  const bgFromRaw =
    raw.backgroundMode === 'light' ||
    raw.backgroundMode === 'neutral' ||
    raw.backgroundMode === 'dark'
      ? raw.backgroundMode
      : legacyBackgroundMode(props);

  let mediaPosition: NormalizedBlockDesign['mediaPosition'] = 'right';
  if (raw.mediaPosition === 'left' || raw.mediaPosition === 'right') {
    mediaPosition = raw.mediaPosition;
  } else if (raw.mediaPosition === 'background' || raw.mediaPosition === 'none') {
    mediaPosition = raw.mediaPosition;
  } else {
    mediaPosition = legacyMediaPosition(props);
  }

  const layoutVariant = resolveLayoutVariant(blockType, props, raw);
  if (blockType === 'hero' && layoutVariant === 'background_image') {
    mediaPosition = 'background';
  }
  if (blockType === 'hero' && layoutVariant === 'minimal') {
    mediaPosition = 'none';
  }
  if (blockType === 'hero' && layoutVariant === 'split_image_left') {
    mediaPosition = 'left';
  }
  if (blockType === 'hero' && layoutVariant === 'split_image_right') {
    mediaPosition = 'right';
  }

  return {
    layoutVariant,
    backgroundMode: bgFromRaw,
    paddingTop: pickSpacing(raw.paddingTop, 'normal'),
    paddingBottom: pickSpacing(raw.paddingBottom, 'normal'),
    contentWidth: pickEnum(raw.contentWidth, new Set(['narrow', 'normal', 'wide']), 'normal'),
    alignment: pickEnum(raw.alignment, new Set(['left', 'center', 'right']), 'left'),
    mediaPosition,
    mediaFit: pickEnum(raw.mediaFit, new Set(['cover', 'contain']), 'cover'),
    mediaFocal: pickEnum(
      raw.mediaFocal,
      new Set(['center', 'top', 'bottom', 'left', 'right']),
      'center',
    ),
    mediaRadius: pickEnum(
      raw.mediaRadius,
      new Set(['none', 'soft', 'medium', 'strong']),
      'medium',
    ),
    mediaShadow: pickEnum(raw.mediaShadow, new Set(['none', 'soft', 'strong']), 'soft'),
    overlayOpacity: pickEnum(
      raw.overlayOpacity,
      new Set(['none', 'light', 'medium', 'strong']),
      layoutVariant === 'background_image' ? 'medium' : 'none',
    ),
    headingSize: pickEnum(
      raw.headingSize,
      new Set(['small', 'medium', 'large', 'xlarge']),
      'large',
    ),
    buttonVariant: pickEnum(
      raw.buttonVariant,
      new Set(['primary', 'secondary', 'ghost']),
      'primary',
    ),
    buttonSize: pickEnum(raw.buttonSize, new Set(['md', 'lg']), 'lg'),
    buttonRadius: pickEnum(
      raw.buttonRadius,
      new Set(['rounded', 'pill', 'square']),
      'pill',
    ),
    backgroundColor: normalizeHexColor(raw.backgroundColor),
    textColor: normalizeHexColor(raw.textColor),
    headingColor: normalizeHexColor(raw.headingColor),
    ctaColor: normalizeHexColor(raw.ctaColor),
  };
}

export function buildSpacingClasses(
  prefix: string,
  design: NormalizedBlockDesign,
): string[] {
  return [
    `${prefix}--pad-top-${design.paddingTop}`,
    `${prefix}--pad-bottom-${design.paddingBottom}`,
    `${prefix}--width-${design.contentWidth}`,
    `${prefix}--align-${design.alignment}`,
    `${prefix}--heading-${design.headingSize}`,
  ];
}

export function buildMediaImgClasses(prefix: string, design: NormalizedBlockDesign): string {
  return [
    `${prefix}__img`,
    `${prefix}__img--fit-${design.mediaFit}`,
    `${prefix}__img--focus-${design.mediaFocal}`,
    `${prefix}__img--radius-${design.mediaRadius}`,
    `${prefix}__img--shadow-${design.mediaShadow}`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildBlockSectionClasses(
  blockType: string,
  baseClass: string,
  design: NormalizedBlockDesign,
): string {
  const classes = [
    'lp-block',
    baseClass,
    `${baseClass}--layout-${design.layoutVariant}`,
    `${baseClass}--bg-${design.backgroundMode}`,
    ...buildSpacingClasses(baseClass, design),
  ];

  if (design.overlayOpacity !== 'none') {
    classes.push(`${baseClass}--overlay-${design.overlayOpacity}`);
  }

  return classes.filter(Boolean).join(' ');
}

export function buildInlineStyleVars(design: NormalizedBlockDesign): string {
  const parts: string[] = [];
  if (design.backgroundColor) parts.push(`--lp-block-bg:${design.backgroundColor}`);
  if (design.textColor) parts.push(`--lp-block-text:${design.textColor}`);
  if (design.headingColor) parts.push(`--lp-block-heading:${design.headingColor}`);
  if (design.ctaColor) parts.push(`--lp-block-cta:${design.ctaColor}`);
  return parts.length ? ` style="${parts.join(';')}"` : '';
}

export function buildButtonClasses(design: NormalizedBlockDesign): string {
  return `lp-btn lp-btn--${design.buttonVariant} lp-btn--${design.buttonSize} lp-btn--radius-${design.buttonRadius}`;
}
