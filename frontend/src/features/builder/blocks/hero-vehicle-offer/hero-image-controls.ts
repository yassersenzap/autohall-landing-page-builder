export type HeroCropPreset = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';

export const HERO_CROP_PRESETS: HeroCropPreset[] = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'custom',
];

export const HERO_CROP_PRESET_FOCAL: Record<
  Exclude<HeroCropPreset, 'custom'>,
  { x: number; y: number }
> = {
  center: { x: 50, y: 50 },
  top: { x: 50, y: 20 },
  bottom: { x: 50, y: 80 },
  left: { x: 20, y: 50 },
  right: { x: 80, y: 50 },
};

const LEGACY_FOCAL_TO_PRESET: Record<string, Exclude<HeroCropPreset, 'custom'>> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

export type ResolvedHeroFocalPoint = {
  x: number;
  y: number;
  cropPreset: HeroCropPreset;
};

export function clampFocalPercent(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

export function resolveHeroCropPreset(value: unknown): HeroCropPreset {
  if (typeof value === 'string' && (value === 'custom' || value in HERO_CROP_PRESET_FOCAL)) {
    return value as HeroCropPreset;
  }
  return 'center';
}

export function resolveHeroFocalPoint(input: {
  cropPreset?: unknown;
  focalPointX?: unknown;
  focalPointY?: unknown;
  focalPoint?: unknown;
}): ResolvedHeroFocalPoint {
  const presetFromCrop = input.cropPreset ? resolveHeroCropPreset(input.cropPreset) : null;
  const presetFromLegacy =
    typeof input.focalPoint === 'string' ? LEGACY_FOCAL_TO_PRESET[input.focalPoint] : undefined;

  const cropPreset = presetFromCrop ?? presetFromLegacy ?? 'center';

  if (cropPreset === 'custom') {
    return {
      cropPreset: 'custom',
      x: clampFocalPercent(input.focalPointX, 50),
      y: clampFocalPercent(input.focalPointY, 50),
    };
  }

  const coords = HERO_CROP_PRESET_FOCAL[cropPreset];
  return { cropPreset, x: coords.x, y: coords.y };
}

export function buildHeroFocalStyleVars(x: number, y: number): Record<string, string> {
  const sx = clampFocalPercent(x, 50);
  const sy = clampFocalPercent(y, 50);
  return {
    '--lp-hero-focal-x': `${sx}%`,
    '--lp-hero-focal-y': `${sy}%`,
    '--lp-media-focal-x': `${sx}%`,
    '--lp-media-focal-y': `${sy}%`,
  };
}

export function buildHeroFocalInlineStyle(x: number, y: number): string {
  const sx = clampFocalPercent(x, 50);
  const sy = clampFocalPercent(y, 50);
  return `--lp-hero-focal-x: ${sx}%; --lp-hero-focal-y: ${sy}%; --lp-media-focal-x: ${sx}%; --lp-media-focal-y: ${sy}%`;
}

function readPropString(props: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function resolveHeroImageAlt(props: Record<string, unknown>): string {
  return (
    readPropString(props, 'heroImageAlt', 'imageAlt') ??
    readPropString(props, 'modelName') ??
    readPropString(props, 'headline') ??
    'Véhicule'
  );
}

export function hasHeroDesktopImage(props: Record<string, unknown>): boolean {
  return Boolean(readPropString(props, 'heroImage', 'heroImageUrl'));
}

export function hasHeroMobileImage(props: Record<string, unknown>): boolean {
  return Boolean(readPropString(props, 'mobileImage', 'mobileImageUrl'));
}
