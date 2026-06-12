export const MOTION_PRESET_VALUES = [
  'none',
  'fade_up',
  'fade_in',
  'scale_in',
  'slide_left',
  'slide_right',
  'reveal',
  'stagger_children',
] as const;

export const MOTION_DURATION_VALUES = ['fast', 'normal', 'slow'] as const;
export const MOTION_DELAY_VALUES = ['none', 'sm', 'md', 'lg'] as const;
export const MOTION_INTENSITY_VALUES = ['subtle', 'standard', 'dramatic'] as const;

export type MotionPreset = (typeof MOTION_PRESET_VALUES)[number];
export type MotionDuration = (typeof MOTION_DURATION_VALUES)[number];
export type MotionDelay = (typeof MOTION_DELAY_VALUES)[number];
export type MotionIntensity = (typeof MOTION_INTENSITY_VALUES)[number];

export type BlockMotion = {
  motionPreset: MotionPreset;
  motionDuration: MotionDuration;
  motionDelay: MotionDelay;
  motionIntensity: MotionIntensity;
};
