import type { InspectorControl } from '../block-registry/inspector-control.types';
import {
  getSectionStyleCapabilities,
  isSectionStyleSupportedBlock,
} from './section-style.registry';
import {
  SECTION_BACKGROUND_VALUES,
  SECTION_CONTAINER_WIDTH_VALUES,
  SECTION_CONTENT_ALIGNMENT_VALUES,
  SECTION_PADDING_X_VALUES,
  SECTION_PADDING_Y_VALUES,
  SECTION_VERTICAL_DENSITY_VALUES,
} from './section-style.types';

const PADDING_Y_LABELS: Record<string, string> = {
  none: 'Aucun',
  sm: 'Petit',
  md: 'Standard',
  lg: 'Large',
  xl: 'Très large',
};

const PADDING_X_LABELS: Record<string, string> = {
  none: 'Aucun',
  sm: 'Petit',
  md: 'Standard',
  lg: 'Large',
};

const CONTAINER_LABELS: Record<string, string> = {
  narrow: 'Étroit',
  default: 'Standard',
  wide: 'Large',
  full: 'Pleine largeur',
};

const BACKGROUND_LABELS: Record<string, string> = {
  default: 'Par défaut',
  muted: 'Gris discret',
  brand: 'Marque (thème)',
  dark: 'Sombre',
  custom: 'Couleur personnalisée',
};

const DENSITY_LABELS: Record<string, string> = {
  compact: 'Compact',
  comfortable: 'Confortable',
  spacious: 'Aéré',
};

const ALIGN_LABELS: Record<string, string> = {
  left: 'Gauche',
  center: 'Centré',
  right: 'Droite',
};

function enumOptions<T extends string>(
  values: readonly T[],
  labels: Record<string, string>,
): Array<{ value: T; label: string }> {
  return values.map((value) => ({ value, label: labels[value] ?? value }));
}

export function buildSectionStyleInspectorControls(blockType: string): InspectorControl[] {
  if (!isSectionStyleSupportedBlock(blockType)) return [];

  const caps = getSectionStyleCapabilities(blockType);
  if (!caps) return [];

  const controls: InspectorControl[] = [];
  const tab = 'design' as const;
  const group = 'Style section';
  const store = 'sectionStyle' as const;

  if (caps.sectionPaddingY) {
    controls.push({
      key: 'ss-pad-y',
      propKey: 'sectionPaddingY',
      type: 'select',
      label: 'Espacement vertical',
      description: 'Marge intérieure haut et bas de la section.',
      tab,
      group,
      store,
      defaultValue: 'md',
      options: enumOptions(SECTION_PADDING_Y_VALUES, PADDING_Y_LABELS),
    });
  }

  if (caps.sectionPaddingX) {
    controls.push({
      key: 'ss-pad-x',
      propKey: 'sectionPaddingX',
      type: 'select',
      label: 'Espacement horizontal',
      tab,
      group,
      store,
      defaultValue: 'md',
      options: enumOptions(SECTION_PADDING_X_VALUES, PADDING_X_LABELS),
    });
  }

  if (caps.containerWidth) {
    controls.push({
      key: 'ss-container',
      propKey: 'containerWidth',
      type: 'select',
      label: 'Largeur du contenu',
      tab,
      group,
      store,
      defaultValue: 'default',
      options: enumOptions(SECTION_CONTAINER_WIDTH_VALUES, CONTAINER_LABELS),
    });
  }

  if (caps.sectionBackground) {
    controls.push({
      key: 'ss-bg',
      propKey: 'sectionBackground',
      type: 'select',
      label: 'Fond de section',
      description: '« Marque » utilise la couleur primaire du thème de page.',
      tab,
      group,
      store,
      defaultValue: 'default',
      options: enumOptions(SECTION_BACKGROUND_VALUES, BACKGROUND_LABELS),
    });
    controls.push({
      key: 'ss-bg-custom',
      propKey: 'customBackgroundColor',
      type: 'color',
      label: 'Couleur de fond personnalisée',
      tab,
      group,
      store,
      visibleWhen: {
        prop: 'sectionBackground',
        store: 'sectionStyle',
        equals: 'custom',
      },
    });
  }

  if (caps.verticalDensity) {
    controls.push({
      key: 'ss-density',
      propKey: 'verticalDensity',
      type: 'select',
      label: 'Densité',
      tab,
      group,
      store,
      defaultValue: 'comfortable',
      options: enumOptions(SECTION_VERTICAL_DENSITY_VALUES, DENSITY_LABELS),
    });
  }

  if (caps.contentAlignment) {
    controls.push({
      key: 'ss-align',
      propKey: 'contentAlignment',
      type: 'select',
      label: 'Alignement',
      tab,
      group,
      store,
      defaultValue: 'left',
      options: enumOptions(SECTION_CONTENT_ALIGNMENT_VALUES, ALIGN_LABELS),
    });
  }

  return controls;
}
