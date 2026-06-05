import type { CSSProperties } from 'react';

export const FONT_SIZE_OPTIONS = [
  { label: 'Petit', value: 'sm' },
  { label: 'Moyen', value: 'md' },
  { label: 'Grand', value: 'lg' },
  { label: 'Très grand', value: 'xl' },
] as const;

export const FONT_WEIGHT_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Medium', value: 'medium' },
  { label: 'Gras', value: 'bold' },
  { label: 'Extra-gras', value: 'extrabold' },
] as const;

export const TEXT_ALIGN_OPTIONS = [
  { label: 'Gauche', value: 'left' },
  { label: 'Centre', value: 'center' },
  { label: 'Droite', value: 'right' },
] as const;

export const BLOCK_SPACING_OPTIONS = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
] as const;

export const BUTTON_STYLE_OPTIONS = [
  { label: 'Primaire', value: 'primary' },
  { label: 'Secondaire', value: 'secondary' },
  { label: 'Contour', value: 'outline' },
  { label: 'Lien', value: 'link' },
] as const;

export const BUTTON_SIZE_OPTIONS = [
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'md' },
  { label: 'L', value: 'lg' },
] as const;

export const COLOR_PRESET_OPTIONS = [
  { label: 'Par défaut', value: 'default' },
  { label: 'Marque', value: 'brand' },
  { label: 'Accent', value: 'accent' },
  { label: 'Clair', value: 'light' },
  { label: 'Sombre', value: 'dark' },
] as const;

export const CONTENT_STYLE_FIELDS = {
  fontSize: { type: 'select' as const, label: 'Taille', options: [...FONT_SIZE_OPTIONS] },
  fontWeight: { type: 'select' as const, label: 'Graisse', options: [...FONT_WEIGHT_OPTIONS] },
  alignment: { type: 'select' as const, label: 'Alignement', options: [...TEXT_ALIGN_OPTIONS] },
  colorPreset: { type: 'select' as const, label: 'Couleur texte', options: [...COLOR_PRESET_OPTIONS] },
  spacing: { type: 'select' as const, label: 'Espacement', options: [...BLOCK_SPACING_OPTIONS] },
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'vs2-text--sm',
  md: 'vs2-text--md',
  lg: 'vs2-text--lg',
  xl: 'vs2-text--xl',
};

const WEIGHT_CLASS: Record<string, string> = {
  normal: 'vs2-weight--normal',
  medium: 'vs2-weight--medium',
  bold: 'vs2-weight--bold',
  extrabold: 'vs2-weight--extrabold',
};

const ALIGN_CLASS: Record<string, string> = {
  left: 'vs2-align-left',
  center: 'vs2-align-center',
  right: 'vs2-align-right',
};

const COLOR_CLASS: Record<string, string> = {
  default: 'vs2-color--default',
  brand: 'vs2-color--brand',
  accent: 'vs2-color--accent',
  light: 'vs2-color--light',
  dark: 'vs2-color--dark',
};

const SPACING_CLASS: Record<string, string> = {
  compact: 'vs2-block-space--compact',
  normal: 'vs2-block-space--normal',
  large: 'vs2-block-space--large',
};

export function creativeTextClasses(props: Record<string, unknown>, extra = ''): string {
  const size = typeof props.fontSize === 'string' ? props.fontSize : 'md';
  const weight = typeof props.fontWeight === 'string' ? props.fontWeight : 'bold';
  const align = typeof props.alignment === 'string' ? props.alignment : 'left';
  const color = typeof props.colorPreset === 'string' ? props.colorPreset : 'default';
  const spacing = typeof props.spacing === 'string' ? props.spacing : 'normal';
  return [
    extra,
    SIZE_CLASS[size] ?? SIZE_CLASS.md,
    WEIGHT_CLASS[weight] ?? WEIGHT_CLASS.bold,
    ALIGN_CLASS[align] ?? ALIGN_CLASS.left,
    COLOR_CLASS[color] ?? COLOR_CLASS.default,
    SPACING_CLASS[spacing] ?? SPACING_CLASS.normal,
  ]
    .filter(Boolean)
    .join(' ');
}

export function buttonClasses(props: Record<string, unknown>): string {
  const variant = typeof props.buttonStyle === 'string' ? props.buttonStyle : 'primary';
  const size = typeof props.buttonSize === 'string' ? props.buttonSize : 'md';
  const align = typeof props.alignment === 'string' ? props.alignment : 'left';
  return [
    'vs2-btn-block',
    `vs2-btn-block--${variant}`,
    `vs2-btn-block--${size}`,
    ALIGN_CLASS[align] ?? ALIGN_CLASS.left,
    SPACING_CLASS[typeof props.spacing === 'string' ? props.spacing : 'normal'],
  ].join(' ');
}

export function cardStyleClasses(props: Record<string, unknown>): string {
  const radius = typeof props.cardRadius === 'string' ? props.cardRadius : 'soft';
  const shadow = typeof props.cardShadow === 'string' ? props.cardShadow : 'soft';
  return `vs2-card-block vs2-card-block--radius-${radius} vs2-card-block--shadow-${shadow}`;
}

export function blockWrapperStyle(maxWidth?: string): CSSProperties | undefined {
  if (!maxWidth || maxWidth === 'full') return undefined;
  const map: Record<string, string> = {
    narrow: '40rem',
    standard: '56rem',
    wide: '72rem',
  };
  const value = map[maxWidth];
  return value ? { maxWidth: value, marginInline: 'auto' } : undefined;
}
