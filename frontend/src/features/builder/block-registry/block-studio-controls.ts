import type { InspectorControl } from './inspector-control.types';

/**
 * Contrôles studio universels — affichés pour TOUS les blocs (onglet Avancé).
 * Aucune restriction de tier ou de type.
 */
export const BLOCK_STUDIO_VISIBILITY_CONTROLS: InspectorControl[] = [
  {
    key: 'block-hidden-global',
    propKey: 'hidden',
    type: 'boolean',
    label: 'Masquer le bloc',
    description:
      'Masqué en aperçu et à l’export. Reste sélectionnable dans le canvas avec un badge « Masqué ».',
    tab: 'advanced',
    group: 'Visibilité',
    defaultValue: false,
  },
  {
    key: 'block-hide-desktop',
    propKey: 'hideOnDesktop',
    type: 'boolean',
    label: 'Masquer sur desktop',
    tab: 'advanced',
    group: 'Visibilité responsive',
    store: 'sectionStyle',
    defaultValue: false,
  },
  {
    key: 'block-hide-tablet',
    propKey: 'hideOnTablet',
    type: 'boolean',
    label: 'Masquer sur tablette',
    tab: 'advanced',
    group: 'Visibilité responsive',
    store: 'sectionStyle',
    defaultValue: false,
  },
  {
    key: 'block-hide-mobile',
    propKey: 'hideOnMobile',
    type: 'boolean',
    label: 'Masquer sur mobile',
    tab: 'advanced',
    group: 'Visibilité responsive',
    store: 'sectionStyle',
    defaultValue: false,
  },
];
