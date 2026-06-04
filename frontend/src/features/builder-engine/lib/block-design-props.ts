export type BuilderDeviceMode = 'desktop' | 'mobile';

export type ImageAlignment = 'right' | 'left';

export type BlockBackgroundTheme = 'light' | 'neutral' | 'dark';

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

export function parseImageAlignment(value: unknown): ImageAlignment {
  return value === 'left' ? 'left' : 'right';
}

export function parseBackgroundTheme(value: unknown): BlockBackgroundTheme {
  if (value === 'neutral' || value === 'dark') return value;
  return 'light';
}

export function blockBackgroundThemeAttr(
  theme: BlockBackgroundTheme,
): BlockBackgroundTheme | undefined {
  return theme === 'light' ? undefined : theme;
}

export function mediaLayoutModifier(
  blockKind: 'hero' | 'showcase',
  alignment: ImageAlignment,
): string {
  if (alignment === 'left') {
    return blockKind === 'hero' ? 'builder-hero--media-left' : 'builder-showcase--media-left';
  }
  return blockKind === 'hero' ? 'builder-hero--media-right' : 'builder-showcase--media-right';
}
