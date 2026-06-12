/**
 * Backend mirror of frontend block-motion registry.
 * Keep in sync with frontend/src/features/builder/block-motion/block-motion.registry.ts
 */

const MOTION_PRESET_VALUES = [
  'none',
  'fade_up',
  'fade_in',
  'scale_in',
  'slide_left',
  'slide_right',
  'reveal',
  'stagger_children',
] as const;

const MOTION_DURATION_VALUES = ['fast', 'normal', 'slow'] as const;
const MOTION_DELAY_VALUES = ['none', 'sm', 'md', 'lg'] as const;
const MOTION_INTENSITY_VALUES = ['subtle', 'standard', 'dramatic'] as const;

const DEFAULT_BLOCK_MOTION = {
  motionPreset: 'fade_up',
  motionDuration: 'normal',
  motionDelay: 'none',
  motionIntensity: 'standard',
} as const;

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

function parseBlockMotion(propsJson: Record<string, unknown>) {
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

export function buildMotionClasses(propsJson: Record<string, unknown>): string {
  const motion = parseBlockMotion(propsJson);
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

export function buildMotionDataAttributes(propsJson: Record<string, unknown>): string {
  const motion = parseBlockMotion(propsJson);
  if (motion.motionPreset === 'none') return '';
  return ` data-lp-motion data-lp-motion-preset="${motion.motionPreset}"`;
}

export function appendBlockMotionToClass(
  baseClass: string,
  propsJson: Record<string, unknown>,
): string {
  const motionClasses = buildMotionClasses(propsJson);
  return motionClasses ? `${baseClass} ${motionClasses}`.trim() : baseClass;
}
