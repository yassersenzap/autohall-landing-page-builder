import type {
  NormalizedSectionStyle,
  SectionStyleCapabilities,
  SectionStyleProps,
} from './section-style.types';
import {
  SECTION_BACKGROUND_VALUES,
  SECTION_CONTAINER_WIDTH_VALUES,
  SECTION_CONTENT_ALIGNMENT_VALUES,
  SECTION_PADDING_X_VALUES,
  SECTION_PADDING_Y_VALUES,
  SECTION_VERTICAL_DENSITY_VALUES,
} from './section-style.types';

export const DEFAULT_SECTION_STYLE: NormalizedSectionStyle = {
  sectionPaddingY: 'md',
  sectionPaddingX: 'md',
  containerWidth: 'default',
  sectionBackground: 'default',
  customBackgroundColor: '',
  verticalDensity: 'comfortable',
  contentAlignment: 'left',
  hideOnDesktop: false,
  hideOnTablet: false,
  hideOnMobile: false,
};

export const SECTION_STYLE_SUPPORTED_BLOCKS = [
  'campaign_lead_hero',
  'hero_vehicle_offer',
  'faq',
  'cta_band',
  'footer_legal',
  'trust_bar',
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'sticky_lead_cta',
  'campaign_timeline_steps',
] as const;

const PREMIUM_SECTION_STYLE_CAPS: SectionStyleCapabilities = {
  sectionPaddingY: true,
  sectionPaddingX: true,
  containerWidth: true,
  sectionBackground: true,
  verticalDensity: true,
  contentAlignment: true,
  visibility: true,
};

export type SectionStyleSupportedBlock = (typeof SECTION_STYLE_SUPPORTED_BLOCKS)[number];

export const SECTION_STYLE_CAPABILITIES: Record<
  SectionStyleSupportedBlock,
  SectionStyleCapabilities
> = {
  campaign_lead_hero: {
    sectionPaddingY: true,
    sectionPaddingX: true,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: false,
    contentAlignment: false,
    visibility: true,
  },
  hero_vehicle_offer: {
    sectionPaddingY: true,
    sectionPaddingX: true,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: false,
    contentAlignment: false,
    visibility: true,
  },
  faq: {
    sectionPaddingY: true,
    sectionPaddingX: true,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: true,
    contentAlignment: true,
    visibility: true,
  },
  cta_band: {
    sectionPaddingY: true,
    sectionPaddingX: false,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: true,
    contentAlignment: true,
    visibility: true,
  },
  footer_legal: {
    sectionPaddingY: true,
    sectionPaddingX: true,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: false,
    contentAlignment: true,
    visibility: true,
  },
  trust_bar: {
    sectionPaddingY: true,
    sectionPaddingX: true,
    containerWidth: true,
    sectionBackground: true,
    verticalDensity: true,
    contentAlignment: true,
    visibility: true,
  },
  premium_bento_features: PREMIUM_SECTION_STYLE_CAPS,
  animated_stats_strip: PREMIUM_SECTION_STYLE_CAPS,
  premium_testimonials: PREMIUM_SECTION_STYLE_CAPS,
  vehicle_showcase_split: PREMIUM_SECTION_STYLE_CAPS,
  sticky_lead_cta: PREMIUM_SECTION_STYLE_CAPS,
  campaign_timeline_steps: PREMIUM_SECTION_STYLE_CAPS,
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

function sanitizeHexColor(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return '';
}

export function isSectionStyleSupportedBlock(
  blockType: string,
): blockType is SectionStyleSupportedBlock {
  return (SECTION_STYLE_SUPPORTED_BLOCKS as readonly string[]).includes(blockType);
}

export function getSectionStyleCapabilities(
  blockType: string,
): SectionStyleCapabilities | null {
  if (!isSectionStyleSupportedBlock(blockType)) return null;
  return SECTION_STYLE_CAPABILITIES[blockType];
}

export function readSectionStyleRaw(
  propsJson: Record<string, unknown>,
): Record<string, unknown> {
  const raw = propsJson.sectionStyle;
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function sanitizeSectionStylePatch(
  raw: Record<string, unknown>,
): SectionStyleProps {
  const out: SectionStyleProps = {};

  if ('sectionPaddingY' in raw) {
    out.sectionPaddingY = pickEnum(
      raw.sectionPaddingY,
      SECTION_PADDING_Y_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingY,
    );
  }
  if ('sectionPaddingX' in raw) {
    out.sectionPaddingX = pickEnum(
      raw.sectionPaddingX,
      SECTION_PADDING_X_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingX,
    );
  }
  if ('containerWidth' in raw) {
    out.containerWidth = pickEnum(
      raw.containerWidth,
      SECTION_CONTAINER_WIDTH_VALUES,
      DEFAULT_SECTION_STYLE.containerWidth,
    );
  }
  if ('sectionBackground' in raw) {
    out.sectionBackground = pickEnum(
      raw.sectionBackground,
      SECTION_BACKGROUND_VALUES,
      DEFAULT_SECTION_STYLE.sectionBackground,
    );
  }
  if ('customBackgroundColor' in raw) {
    out.customBackgroundColor = sanitizeHexColor(raw.customBackgroundColor);
  }
  if ('verticalDensity' in raw) {
    out.verticalDensity = pickEnum(
      raw.verticalDensity,
      SECTION_VERTICAL_DENSITY_VALUES,
      DEFAULT_SECTION_STYLE.verticalDensity,
    );
  }
  if ('contentAlignment' in raw) {
    out.contentAlignment = pickEnum(
      raw.contentAlignment,
      SECTION_CONTENT_ALIGNMENT_VALUES,
      DEFAULT_SECTION_STYLE.contentAlignment,
    );
  }
  if ('hideOnDesktop' in raw) {
    out.hideOnDesktop = raw.hideOnDesktop === true;
  }
  if ('hideOnTablet' in raw) {
    out.hideOnTablet = raw.hideOnTablet === true;
  }
  if ('hideOnMobile' in raw) {
    out.hideOnMobile = raw.hideOnMobile === true;
  }

  return out;
}

export function parseSectionStyle(propsJson: Record<string, unknown>): NormalizedSectionStyle {
  const raw = readSectionStyleRaw(propsJson);
  return {
    sectionPaddingY: pickEnum(
      raw.sectionPaddingY,
      SECTION_PADDING_Y_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingY,
    ),
    sectionPaddingX: pickEnum(
      raw.sectionPaddingX,
      SECTION_PADDING_X_VALUES,
      DEFAULT_SECTION_STYLE.sectionPaddingX,
    ),
    containerWidth: pickEnum(
      raw.containerWidth,
      SECTION_CONTAINER_WIDTH_VALUES,
      DEFAULT_SECTION_STYLE.containerWidth,
    ),
    sectionBackground: pickEnum(
      raw.sectionBackground,
      SECTION_BACKGROUND_VALUES,
      DEFAULT_SECTION_STYLE.sectionBackground,
    ),
    customBackgroundColor: sanitizeHexColor(raw.customBackgroundColor),
    verticalDensity: pickEnum(
      raw.verticalDensity,
      SECTION_VERTICAL_DENSITY_VALUES,
      DEFAULT_SECTION_STYLE.verticalDensity,
    ),
    contentAlignment: pickEnum(
      raw.contentAlignment,
      SECTION_CONTENT_ALIGNMENT_VALUES,
      DEFAULT_SECTION_STYLE.contentAlignment,
    ),
    hideOnDesktop: raw.hideOnDesktop === true,
    hideOnTablet: raw.hideOnTablet === true,
    hideOnMobile: raw.hideOnMobile === true,
  };
}

export function mergeSectionStylePatch(
  propsJson: Record<string, unknown>,
  patch: SectionStyleProps,
): Record<string, unknown> {
  const sanitized = sanitizeSectionStylePatch(patch);
  if (Object.keys(sanitized).length === 0) return {};
  return {
    sectionStyle: {
      ...readSectionStyleRaw(propsJson),
      ...sanitized,
    },
  };
}
