import type { InspectorControl } from '../shared/inspector-control.types';
import {
  imageControl,
  imageGeometryControls,
  overlayControls,
  selectControl,
  textControl,
} from '../shared/inspector';

function secondaryCtaControls(): InspectorControl[] {
  return [
    textControl('v4-cta-secondary-label', 'secondaryCtaLabel', 'CTA secondaire', 'content'),
    textControl('v4-cta-secondary-href', 'secondaryCtaHref', 'Lien secondaire', 'content'),
  ];
}

export const HERO_UNIVERSAL_CONTROLS: InspectorControl[] = [
  selectControl('v4-campaign-variant', 'campaignVariant', 'Campagne', [
    { value: 'default', label: 'Générique' },
    { value: 'vehicle', label: 'Essai véhicule' },
    { value: 'sav', label: 'SAV & entretien' },
    { value: 'financing', label: 'Financement' },
    { value: 'commercial', label: 'Offre commerciale' },
  ], 'content'),
  textControl('v4-badge', 'badge', 'Badge', 'content'),
  textControl('v4-title', 'title', 'Titre'),
  textControl('v4-subtitle', 'subtitle', 'Sous-titre'),
  textControl('v4-body', 'bodyText', 'Texte', 'content', true),
  textControl('v4-cta-label', 'ctaLabel', 'CTA principal'),
  textControl('v4-cta-href', 'ctaHref', 'Lien principal'),
  ...secondaryCtaControls(),
  textControl('v4-trust-1', 'trustStat1', 'Indicateur confiance 1', 'content'),
  textControl('v4-trust-2', 'trustStat2', 'Indicateur confiance 2', 'content'),
  textControl('v4-trust-3', 'trustStat3', 'Indicateur confiance 3', 'content'),
  textControl('v4-partners', 'partnerLogos', 'Logos partenaires (séparés par ·)', 'content'),
  selectControl('v4-layout-mode', 'layoutMode', 'Mode', [
    { value: 'split', label: 'Split image + texte' },
    { value: 'background', label: 'Image plein fond' },
  ], 'design'),
  selectControl('v4-image-pos', 'imagePosition', 'Image', [
    { value: 'left', label: 'À gauche' },
    { value: 'right', label: 'À droite' },
  ], 'design'),
  selectControl('v4-align', 'contentAlignment', 'Alignement', [
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ], 'design'),
  selectControl('v4-ratio', 'imageAspectRatio', 'Ratio image', [
    { value: '16/9', label: '16:9' },
    { value: '4/3', label: '4:3' },
    { value: '1/1', label: '1:1' },
    { value: 'auto', label: 'Auto' },
  ], 'design'),
  {
    key: 'v4-gradient',
    propKey: 'gradientEnabled',
    label: 'Dégradé',
    tab: 'design',
    type: 'boolean',
  },
  imageControl('v4-image', 'Image campagne'),
  ...overlayControls(),
  ...imageGeometryControls(),
];

export const HERO_ART_CONTROLS: InspectorControl[] = [
  textControl('v4-title', 'title', 'Titre'),
  imageControl('v4-image', 'Image d\'arrière-plan'),
];

