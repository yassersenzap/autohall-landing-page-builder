import type { BlockMotion } from './block-motion.types';
import {
  MOTION_DELAY_VALUES,
  MOTION_DURATION_VALUES,
  MOTION_INTENSITY_VALUES,
  MOTION_PRESET_VALUES,
} from './block-motion.types';

export const PREMIUM_ANIMATED_BLOCK_TYPES = [
  'premium_bento_features',
  'animated_stats_strip',
  'premium_testimonials',
  'vehicle_showcase_split',
  'sticky_lead_cta',
  'campaign_timeline_steps',
] as const;

export type PremiumAnimatedBlockType = (typeof PREMIUM_ANIMATED_BLOCK_TYPES)[number];

export const DEFAULT_BLOCK_MOTION: Required<BlockMotion> = {
  motionPreset: 'fade_up',
  motionDuration: 'normal',
  motionDelay: 'none',
  motionIntensity: 'standard',
};

const SAFE_CLASS_TOKEN = /^[a-z0-9-]+$/;

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parseBlockMotion(propsJson: Record<string, unknown>): Required<BlockMotion> {
  return {
    motionPreset: pickEnum(
      propsJson.motionPreset,
      MOTION_PRESET_VALUES,
      DEFAULT_BLOCK_MOTION.motionPreset,
    ),
    motionDuration: pickEnum(
      propsJson.motionDuration,
      MOTION_DURATION_VALUES,
      DEFAULT_BLOCK_MOTION.motionDuration,
    ),
    motionDelay: pickEnum(
      propsJson.motionDelay,
      MOTION_DELAY_VALUES,
      DEFAULT_BLOCK_MOTION.motionDelay,
    ),
    motionIntensity: pickEnum(
      propsJson.motionIntensity,
      MOTION_INTENSITY_VALUES,
      DEFAULT_BLOCK_MOTION.motionIntensity,
    ),
  };
}

function motionClassToken(value: string): string {
  return value.replace(/_/g, '-');
}

export function buildMotionClasses(motion: BlockMotion): string {
  if (motion.motionPreset === 'none') return '';

  const classes = ['lp-motion', `lp-motion--${motionClassToken(motion.motionPreset)}`];

  if (motion.motionDuration !== DEFAULT_BLOCK_MOTION.motionDuration) {
    const cls = `lp-motion--dur-${motion.motionDuration}`;
    if (SAFE_CLASS_TOKEN.test(cls)) classes.push(cls);
  }
  if (motion.motionDelay !== 'none') {
    const cls = `lp-motion--delay-${motion.motionDelay}`;
    if (SAFE_CLASS_TOKEN.test(cls)) classes.push(cls);
  }
  if (motion.motionIntensity !== DEFAULT_BLOCK_MOTION.motionIntensity) {
    const cls = `lp-motion--int-${motion.motionIntensity}`;
    if (SAFE_CLASS_TOKEN.test(cls)) classes.push(cls);
  }

  return classes.join(' ');
}

export function buildMotionDataAttributes(motion: BlockMotion): string {
  if (motion.motionPreset === 'none') return '';
  return ` data-lp-motion data-lp-motion-preset="${motion.motionPreset}"`;
}

export function appendMotionToClass(baseClass: string, propsJson: Record<string, unknown>): string {
  const motion = parseBlockMotion(propsJson);
  const motionClasses = buildMotionClasses(motion);
  return motionClasses ? `${baseClass} ${motionClasses}`.trim() : baseClass;
}

export function supportsBlockMotion(blockType: string): boolean {
  return (PREMIUM_ANIMATED_BLOCK_TYPES as readonly string[]).includes(blockType);
}

export function sanitizeMotionForExport(
  propsJson: Record<string, unknown>,
): Partial<BlockMotion> {
  const parsed = parseBlockMotion(propsJson);
  const out: Partial<BlockMotion> = {};

  if (parsed.motionPreset !== DEFAULT_BLOCK_MOTION.motionPreset) {
    out.motionPreset = parsed.motionPreset;
  }
  if (parsed.motionDuration !== DEFAULT_BLOCK_MOTION.motionDuration) {
    out.motionDuration = parsed.motionDuration;
  }
  if (parsed.motionDelay !== 'none') {
    out.motionDelay = parsed.motionDelay;
  }
  if (parsed.motionIntensity !== DEFAULT_BLOCK_MOTION.motionIntensity) {
    out.motionIntensity = parsed.motionIntensity;
  }

  return out;
}
