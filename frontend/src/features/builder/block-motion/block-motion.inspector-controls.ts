import type { InspectorControl } from '../block-registry/inspector-control.types';
import {
  MOTION_DELAY_VALUES,
  MOTION_DURATION_VALUES,
  MOTION_INTENSITY_VALUES,
  MOTION_PRESET_VALUES,
} from './block-motion.types';
import { supportsBlockMotion } from './block-motion.registry';

const PRESET_LABELS: Record<string, string> = {
  none: 'Aucune',
  fade_up: 'Montée en fondu',
  fade_in: 'Fondu',
  scale_in: 'Zoom',
  slide_left: 'Glissement gauche',
  slide_right: 'Glissement droite',
  reveal: 'Révélation',
  stagger_children: 'En cascade',
};

const DURATION_LABELS: Record<string, string> = {
  fast: 'Rapide',
  normal: 'Standard',
  slow: 'Lente',
};

const DELAY_LABELS: Record<string, string> = {
  none: 'Aucun',
  sm: 'Court',
  md: 'Moyen',
  lg: 'Long',
};

const INTENSITY_LABELS: Record<string, string> = {
  subtle: 'Subtil',
  standard: 'Standard',
  dramatic: 'Marqué',
};

function toOptions(values: readonly string[], labels: Record<string, string>) {
  return values.map((value) => ({ value, label: labels[value] ?? value }));
}

const MOTION_CONTROLS: InspectorControl[] = [
  {
    key: 'motion-preset',
    propKey: 'motionPreset',
    type: 'select',
    label: 'Apparition',
    tab: 'design',
    group: 'Animation',
    defaultValue: 'fade_up',
    options: toOptions(MOTION_PRESET_VALUES, PRESET_LABELS),
  },
  {
    key: 'motion-duration',
    propKey: 'motionDuration',
    type: 'select',
    label: 'Durée',
    tab: 'design',
    group: 'Animation',
    defaultValue: 'normal',
    options: toOptions(MOTION_DURATION_VALUES, DURATION_LABELS),
    visibleWhen: { prop: 'motionPreset', notEquals: 'none' },
  },
  {
    key: 'motion-delay',
    propKey: 'motionDelay',
    type: 'select',
    label: 'Délai',
    tab: 'design',
    group: 'Animation',
    defaultValue: 'none',
    options: toOptions(MOTION_DELAY_VALUES, DELAY_LABELS),
    visibleWhen: { prop: 'motionPreset', notEquals: 'none' },
  },
  {
    key: 'motion-intensity',
    propKey: 'motionIntensity',
    type: 'select',
    label: 'Intensité',
    tab: 'design',
    group: 'Animation',
    defaultValue: 'standard',
    options: toOptions(MOTION_INTENSITY_VALUES, INTENSITY_LABELS),
    visibleWhen: { prop: 'motionPreset', notEquals: 'none' },
  },
];

export function getBlockMotionInspectorControls(blockType: string): InspectorControl[] {
  if (!supportsBlockMotion(blockType)) return [];
  return MOTION_CONTROLS.map((control) => ({
    ...control,
    key: `${blockType}-${control.key}`,
  }));
}
