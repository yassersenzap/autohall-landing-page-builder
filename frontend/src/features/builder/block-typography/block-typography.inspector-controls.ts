import type { InspectorControl } from '../block-registry/inspector-control.types';
import {
  BLOCK_TYPOGRAPHY_CAPABILITIES,
  BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS,
  BODY_SCALE_VALUES,
  DEFAULT_BLOCK_TYPOGRAPHY,
  EYEBROW_STYLE_VALUES,
  MOBILE_TITLE_SCALE_VALUES,
  SUBTITLE_SCALE_VALUES,
  TEXT_MAX_WIDTH_VALUES,
  TITLE_SCALE_VALUES,
  TITLE_WEIGHT_VALUES,
  type BlockTypographySupportedBlock,
} from './block-typography.registry';

const TITLE_LABELS: Record<string, string> = {
  sm: 'Petit',
  md: 'Standard',
  lg: 'Grand',
  xl: 'Très grand',
  display: 'Affichage',
};

const SUBTITLE_LABELS: Record<string, string> = {
  sm: 'Petit',
  md: 'Standard',
  lg: 'Grand',
};

const BODY_LABELS: Record<string, string> = {
  sm: 'Petit',
  md: 'Standard',
  lg: 'Grand',
};

const EYEBROW_LABELS: Record<string, string> = {
  hidden: 'Masqué',
  subtle: 'Discret',
  badge: 'Badge',
  uppercase: 'Majuscules',
};

const WEIGHT_LABELS: Record<string, string> = {
  medium: 'Moyen',
  semibold: 'Semi-gras',
  bold: 'Gras',
  black: 'Extra-gras',
};

const MAX_WIDTH_LABELS: Record<string, string> = {
  sm: 'Étroit',
  md: 'Standard',
  lg: 'Large',
  xl: 'Très large',
};

const MOBILE_TITLE_LABELS: Record<string, string> = {
  inherit: 'Hériter',
  sm: 'Petit',
  md: 'Standard',
  lg: 'Grand',
};

function toOptions(values: readonly string[], labels: Record<string, string>) {
  return values.map((value) => ({ value, label: labels[value] ?? value }));
}

function buildTypographyControlsForBlock(
  blockType: BlockTypographySupportedBlock,
): InspectorControl[] {
  const caps = BLOCK_TYPOGRAPHY_CAPABILITIES[blockType];
  const controls: InspectorControl[] = [];

  if (caps.titleScale) {
    controls.push({
      key: `${blockType}-typo-title-scale`,
      propKey: 'titleScale',
      type: 'select',
      label: 'Échelle titre',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.titleScale,
      options: toOptions(TITLE_SCALE_VALUES, TITLE_LABELS),
    });
  }

  if (caps.subtitleScale) {
    controls.push({
      key: `${blockType}-typo-subtitle-scale`,
      propKey: 'subtitleScale',
      type: 'select',
      label: 'Échelle sous-titre',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.subtitleScale,
      options: toOptions(SUBTITLE_SCALE_VALUES, SUBTITLE_LABELS),
    });
  }

  if (caps.bodyScale) {
    controls.push({
      key: `${blockType}-typo-body-scale`,
      propKey: 'bodyScale',
      type: 'select',
      label: 'Échelle texte',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.bodyScale,
      options: toOptions(BODY_SCALE_VALUES, BODY_LABELS),
    });
  }

  if (caps.eyebrowStyle) {
    controls.push({
      key: `${blockType}-typo-eyebrow`,
      propKey: 'eyebrowStyle',
      type: 'select',
      label: 'Style badge / accroche',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.eyebrowStyle,
      options: toOptions(EYEBROW_STYLE_VALUES, EYEBROW_LABELS),
    });
  }

  if (caps.titleWeight) {
    controls.push({
      key: `${blockType}-typo-title-weight`,
      propKey: 'titleWeight',
      type: 'select',
      label: 'Graisse titre',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.titleWeight,
      options: toOptions(TITLE_WEIGHT_VALUES, WEIGHT_LABELS),
    });
  }

  if (caps.textMaxWidth) {
    controls.push({
      key: `${blockType}-typo-max-width`,
      propKey: 'textMaxWidth',
      type: 'select',
      label: 'Largeur du texte',
      tab: 'design',
      group: 'Typographie',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.textMaxWidth,
      options: toOptions(TEXT_MAX_WIDTH_VALUES, MAX_WIDTH_LABELS),
    });
  }

  if (caps.mobileTitleScale) {
    controls.push({
      key: `${blockType}-typo-mobile-title`,
      propKey: 'mobileTitleScale',
      type: 'select',
      label: 'Titre mobile',
      tab: 'design',
      group: 'Mobile',
      store: 'typography',
      defaultValue: DEFAULT_BLOCK_TYPOGRAPHY.mobileTitleScale,
      options: toOptions(MOBILE_TITLE_SCALE_VALUES, MOBILE_TITLE_LABELS),
    });
  }

  return controls;
}

const TYPOGRAPHY_CONTROLS_BY_BLOCK = new Map<BlockTypographySupportedBlock, InspectorControl[]>(
  BLOCK_TYPOGRAPHY_SUPPORTED_BLOCKS.map((blockType) => [
    blockType,
    buildTypographyControlsForBlock(blockType),
  ]),
);

export function getBlockTypographyInspectorControls(blockType: string): InspectorControl[] {
  return TYPOGRAPHY_CONTROLS_BY_BLOCK.get(blockType as BlockTypographySupportedBlock) ?? [];
}
