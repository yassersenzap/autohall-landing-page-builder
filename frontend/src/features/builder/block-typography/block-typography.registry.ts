import type { BlockTypography, BlockTypographyCapabilities } from './block-typography.types';

export const TITLE_SCALE_VALUES = ['sm', 'md', 'lg', 'xl', 'display'] as const;
export const SUBTITLE_SCALE_VALUES = ['sm', 'md', 'lg'] as const;
export const BODY_SCALE_VALUES = ['sm', 'md', 'lg'] as const;
export const EYEBROW_STYLE_VALUES = ['hidden', 'subtle', 'badge', 'uppercase'] as const;
export const TITLE_WEIGHT_VALUES = ['medium', 'semibold', 'bold', 'black'] as const;
export const TEXT_MAX_WIDTH_VALUES = ['sm', 'md', 'lg', 'xl'] as const;
export const MOBILE_TITLE_SCALE_VALUES = ['inherit', 'sm', 'md', 'lg'] as const;

export const BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS = [
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'cta_band',
  'faq',
] as const;

export type BlockTypographySupportedBlock = (typeof BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS)[number];

const SAFE_CLASS_TOKEN = /^[a-z0-9_]+$/;

export const DEFAULT_BLOCK_TYPOGRAPHY: Required<BlockTypography> = {
  titleScale: 'lg',
  subtitleScale: 'md',
  bodyScale: 'md',
  eyebrowStyle: 'badge',
  titleWeight: 'bold',
  textMaxWidth: 'lg',
  mobileTitleScale: 'inherit',
};

export const BLOCK_TYPOGRAPHY_CAPABILITIES: Record<
  BlockTypographySupportedBlock,
  BlockTypographyCapabilities
> = {
  campaign_lead_hero: {
    titleScale: true,
    subtitleScale: true,
    bodyScale: false,
    eyebrowStyle: true,
    titleWeight: true,
    textMaxWidth: true,
    mobileTitleScale: true,
  },
  hero_vehicle_offer: {
    titleScale: true,
    subtitleScale: true,
    bodyScale: true,
    eyebrowStyle: true,
    titleWeight: true,
    textMaxWidth: true,
    mobileTitleScale: true,
  },
  cta_band: {
    titleScale: true,
    subtitleScale: false,
    bodyScale: false,
    eyebrowStyle: false,
    titleWeight: true,
    textMaxWidth: true,
    mobileTitleScale: false,
  },
  faq: {
    titleScale: true,
    subtitleScale: true,
    bodyScale: true,
    eyebrowStyle: false,
    titleWeight: true,
    textMaxWidth: true,
    mobileTitleScale: false,
  },
};

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function readBlockTypographyRaw(
  propsJson: Record<string, unknown>,
): Record<string, unknown> {
  const raw = propsJson.typography;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function parseBlockTypography(
  propsJson: Record<string, unknown>,
): Required<BlockTypography> {
  const raw = readBlockTypographyRaw(propsJson);
  return {
    titleScale: pickEnum(raw.titleScale, TITLE_SCALE_VALUES, DEFAULT_BLOCK_TYPOGRAPHY.titleScale),
    subtitleScale: pickEnum(
      raw.subtitleScale,
      SUBTITLE_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.subtitleScale,
    ),
    bodyScale: pickEnum(raw.bodyScale, BODY_SCALE_VALUES, DEFAULT_BLOCK_TYPOGRAPHY.bodyScale),
    eyebrowStyle: pickEnum(
      raw.eyebrowStyle,
      EYEBROW_STYLE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.eyebrowStyle,
    ),
    titleWeight: pickEnum(
      raw.titleWeight,
      TITLE_WEIGHT_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.titleWeight,
    ),
    textMaxWidth: pickEnum(
      raw.textMaxWidth,
      TEXT_MAX_WIDTH_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.textMaxWidth,
    ),
    mobileTitleScale: pickEnum(
      raw.mobileTitleScale,
      MOBILE_TITLE_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.mobileTitleScale,
    ),
  };
}

export function sanitizeBlockTypographyPatch(
  blockType: string,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  if (!BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS.includes(blockType as BlockTypographySupportedBlock)) {
    return {};
  }

  const caps =
    BLOCK_TYPOGRAPHY_CAPABILITIES[blockType as BlockTypographySupportedBlock];
  const out: Record<string, unknown> = {};

  if (caps.titleScale && patch.titleScale !== undefined) {
    out.titleScale = pickEnum(
      patch.titleScale,
      TITLE_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.titleScale,
    );
  }
  if (caps.subtitleScale && patch.subtitleScale !== undefined) {
    out.subtitleScale = pickEnum(
      patch.subtitleScale,
      SUBTITLE_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.subtitleScale,
    );
  }
  if (caps.bodyScale && patch.bodyScale !== undefined) {
    out.bodyScale = pickEnum(
      patch.bodyScale,
      BODY_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.bodyScale,
    );
  }
  if (caps.eyebrowStyle && patch.eyebrowStyle !== undefined) {
    out.eyebrowStyle = pickEnum(
      patch.eyebrowStyle,
      EYEBROW_STYLE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.eyebrowStyle,
    );
  }
  if (caps.titleWeight && patch.titleWeight !== undefined) {
    out.titleWeight = pickEnum(
      patch.titleWeight,
      TITLE_WEIGHT_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.titleWeight,
    );
  }
  if (caps.textMaxWidth && patch.textMaxWidth !== undefined) {
    out.textMaxWidth = pickEnum(
      patch.textMaxWidth,
      TEXT_MAX_WIDTH_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.textMaxWidth,
    );
  }
  if (caps.mobileTitleScale && patch.mobileTitleScale !== undefined) {
    out.mobileTitleScale = pickEnum(
      patch.mobileTitleScale,
      MOBILE_TITLE_SCALE_VALUES,
      DEFAULT_BLOCK_TYPOGRAPHY.mobileTitleScale,
    );
  }

  return out;
}

function typoClass(prefix: string, value: string): string | null {
  if (!SAFE_CLASS_TOKEN.test(value)) return null;
  return `${prefix}-${value}`;
}

export function buildBlockTypographyClasses(
  propsJson: Record<string, unknown>,
  blockType?: string,
): string {
  if (
    blockType &&
    !BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS.includes(blockType as BlockTypographySupportedBlock)
  ) {
    return '';
  }

  const typography = parseBlockTypography(propsJson);
  const classes: string[] = [];

  const pushIfNonDefault = (
    key: keyof BlockTypography,
    prefix: string,
    value: string,
  ) => {
    const cls = typoClass(prefix, value);
    if (!cls) return;
    if (value !== DEFAULT_BLOCK_TYPOGRAPHY[key]) {
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

export function buildControlTypographyPatch(
  propsJson: Record<string, unknown>,
  propKey: keyof BlockTypography,
  value: string,
): Record<string, unknown> {
  return {
    typography: {
      ...readBlockTypographyRaw(propsJson),
      [propKey]: value,
    },
  };
}
