/**
 * Backend mirror of frontend block-typography registry.
 * Keep in sync with frontend/src/features/builder/block-typography/block-typography.registry.ts
 */

const TITLE_SCALE_VALUES = ['sm', 'md', 'lg', 'xl', 'display'] as const;
const SUBTITLE_SCALE_VALUES = ['sm', 'md', 'lg'] as const;
const BODY_SCALE_VALUES = ['sm', 'md', 'lg'] as const;
const EYEBROW_STYLE_VALUES = ['hidden', 'subtle', 'badge', 'uppercase'] as const;
const TITLE_WEIGHT_VALUES = ['medium', 'semibold', 'bold', 'black'] as const;
const TEXT_MAX_WIDTH_VALUES = ['sm', 'md', 'lg', 'xl'] as const;
const MOBILE_TITLE_SCALE_VALUES = ['inherit', 'sm', 'md', 'lg'] as const;

const SUPPORTED_BLOCKS = new Set([
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'cta_band',
  'faq',
]);

const DEFAULT_TYPOGRAPHY = {
  titleScale: 'lg',
  subtitleScale: 'md',
  bodyScale: 'md',
  eyebrowStyle: 'badge',
  titleWeight: 'bold',
  textMaxWidth: 'lg',
  mobileTitleScale: 'inherit',
} as const;

const SAFE_CLASS_TOKEN = /^[a-z0-9_]+$/;

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function readBlockTypographyRaw(propsJson: Record<string, unknown>): Record<string, unknown> {
  const raw = propsJson.typography;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function parseBlockTypography(propsJson: Record<string, unknown>) {
  const raw = readBlockTypographyRaw(propsJson);
  return {
    titleScale: pickEnum(raw.titleScale, TITLE_SCALE_VALUES, DEFAULT_TYPOGRAPHY.titleScale),
    subtitleScale: pickEnum(
      raw.subtitleScale,
      SUBTITLE_SCALE_VALUES,
      DEFAULT_TYPOGRAPHY.subtitleScale,
    ),
    bodyScale: pickEnum(raw.bodyScale, BODY_SCALE_VALUES, DEFAULT_TYPOGRAPHY.bodyScale),
    eyebrowStyle: pickEnum(
      raw.eyebrowStyle,
      EYEBROW_STYLE_VALUES,
      DEFAULT_TYPOGRAPHY.eyebrowStyle,
    ),
    titleWeight: pickEnum(
      raw.titleWeight,
      TITLE_WEIGHT_VALUES,
      DEFAULT_TYPOGRAPHY.titleWeight,
    ),
    textMaxWidth: pickEnum(
      raw.textMaxWidth,
      TEXT_MAX_WIDTH_VALUES,
      DEFAULT_TYPOGRAPHY.textMaxWidth,
    ),
    mobileTitleScale: pickEnum(
      raw.mobileTitleScale,
      MOBILE_TITLE_SCALE_VALUES,
      DEFAULT_TYPOGRAPHY.mobileTitleScale,
    ),
  };
}

function typoClass(prefix: string, value: string): string | null {
  if (!SAFE_CLASS_TOKEN.test(value)) return null;
  return `${prefix}-${value}`;
}

export function buildBlockTypographyClasses(
  propsJson: Record<string, unknown>,
  blockType?: string,
): string {
  if (blockType && !SUPPORTED_BLOCKS.has(blockType)) {
    return '';
  }

  const typography = parseBlockTypography(propsJson);
  const classes: string[] = [];

  const pushIfNonDefault = (
    key: keyof typeof DEFAULT_TYPOGRAPHY,
    prefix: string,
    value: string,
  ) => {
    const cls = typoClass(prefix, value);
    if (!cls) return;
    if (value !== DEFAULT_TYPOGRAPHY[key]) {
      classes.push(cls);
    }
  };

  pushIfNonDefault('titleScale', 'lp-typo-title', typography.titleScale);
  pushIfNonDefault('subtitleScale', 'lp-typo-subtitle', typography.subtitleScale);
  pushIfNonDefault('bodyScale', 'lp-typo-body', typography.bodyScale);
  pushIfNonDefault('eyebrowStyle', 'lp-typo-eyebrow', typography.eyebrowStyle);
  pushIfNonDefault('titleWeight', 'lp-typo-weight', typography.titleWeight);
  pushIfNonDefault('textMaxWidth', 'lp-typo-max', typography.textMaxWidth);
  if (typography.mobileTitleScale !== 'inherit') {
    const mobileClass = typoClass('lp-typo-mobile-title', typography.mobileTitleScale);
    if (mobileClass) classes.push(mobileClass);
  }

  return [...new Set(classes)].join(' ');
}

export function appendBlockTypographyToClass(
  baseClass: string,
  blockType: string,
  propsJson: Record<string, unknown>,
): string {
  const typoClasses = buildBlockTypographyClasses(propsJson, blockType);
  return typoClasses ? `${baseClass} ${typoClasses}`.trim() : baseClass;
}

export function sanitizeBlockTypographyForExport(
  propsJson: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = parseBlockTypography(propsJson);
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== DEFAULT_TYPOGRAPHY[key as keyof typeof DEFAULT_TYPOGRAPHY]) {
      out[key] = value;
    }
  }

  return out;
}
