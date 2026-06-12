import type { InspectorControl } from '../../block-registry/inspector-control.types';

const BENTO_LAYOUT_OPTIONS = [
  { value: '2x2', label: 'Grille 2×2' },
  { value: '3_cards', label: '3 cartes' },
  { value: 'asymmetric', label: 'Asymétrique' },
];

const VISUAL_STYLE_OPTIONS = [
  { value: 'glass', label: 'Verre' },
  { value: 'cards', label: 'Cartes' },
  { value: 'border', label: 'Contour' },
  { value: 'dark', label: 'Sombre' },
];

const STATS_LAYOUT_OPTIONS = [
  { value: 'row', label: 'Ligne' },
  { value: 'grid', label: 'Grille' },
];

const STATS_STYLE_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'cards', label: 'Cartes' },
  { value: 'premium', label: 'Premium' },
];

const TESTIMONIAL_STYLE_OPTIONS = [
  { value: 'cards', label: 'Cartes' },
  { value: 'carousel_static', label: 'Grille responsive' },
  { value: 'quote_wall', label: 'Mur de citations' },
];

const SHOWCASE_LAYOUT_OPTIONS = [
  { value: 'image_left', label: 'Image à gauche' },
  { value: 'image_right', label: 'Image à droite' },
  { value: 'background_focus', label: 'Arrière-plan focus' },
];

const SHOWCASE_VISUAL_OPTIONS = [
  { value: 'dark_card', label: 'Carte sombre' },
  { value: 'light_card', label: 'Carte claire' },
  { value: 'glass', label: 'Verre' },
];

const STICKY_MODE_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'bottom', label: 'Bas de page' },
  { value: 'side_desktop', label: 'Latéral (desktop)' },
];

const STICKY_STYLE_OPTIONS = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'brand', label: 'Marque' },
];

const TIMELINE_STYLE_OPTIONS = [
  { value: 'line', label: 'Ligne' },
  { value: 'cards', label: 'Cartes' },
  { value: 'vertical', label: 'Vertical' },
];

export const premiumBentoInspectorControls: InspectorControl[] = [
  { key: 'pb-eyebrow', propKey: 'eyebrow', type: 'text', label: 'Sur-titre', tab: 'content', group: 'Contenu' },
  { key: 'pb-title', propKey: 'title', type: 'text', label: 'Titre', tab: 'content', group: 'Contenu' },
  { key: 'pb-subtitle', propKey: 'subtitle', type: 'textarea', label: 'Sous-titre', tab: 'content', group: 'Contenu' },
  {
    key: 'pb-layout',
    propKey: 'layout',
    type: 'select',
    label: 'Mise en page',
    tab: 'layout',
    group: 'Mise en page',
    options: BENTO_LAYOUT_OPTIONS,
    defaultValue: '2x2',
  },
  {
    key: 'pb-visual',
    propKey: 'visualStyle',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: VISUAL_STYLE_OPTIONS,
    defaultValue: 'glass',
  },
];

export const animatedStatsInspectorControls: InspectorControl[] = [
  {
    key: 'as-layout',
    propKey: 'layout',
    type: 'select',
    label: 'Mise en page',
    tab: 'layout',
    group: 'Mise en page',
    options: STATS_LAYOUT_OPTIONS,
    defaultValue: 'grid',
  },
  {
    key: 'as-style',
    propKey: 'style',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: STATS_STYLE_OPTIONS,
    defaultValue: 'premium',
  },
  {
    key: 'as-count',
    propKey: 'countAnimation',
    type: 'select',
    label: 'Animation chiffres',
    tab: 'design',
    group: 'Animation',
    options: [
      { value: 'none', label: 'Aucune' },
      { value: 'count_up', label: 'Compteur' },
    ],
    defaultValue: 'count_up',
  },
];

export const premiumTestimonialsInspectorControls: InspectorControl[] = [
  { key: 'pt-title', propKey: 'title', type: 'text', label: 'Titre', tab: 'content', group: 'Contenu' },
  {
    key: 'pt-style',
    propKey: 'style',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: TESTIMONIAL_STYLE_OPTIONS,
    defaultValue: 'cards',
  },
];

export const vehicleShowcaseInspectorControls: InspectorControl[] = [
  { key: 'vs-brand', propKey: 'brand', type: 'text', label: 'Marque', tab: 'content', group: 'Véhicule' },
  { key: 'vs-model', propKey: 'model', type: 'text', label: 'Modèle', tab: 'content', group: 'Véhicule' },
  { key: 'vs-headline', propKey: 'headline', type: 'text', label: 'Titre', tab: 'content', group: 'Véhicule' },
  { key: 'vs-subtitle', propKey: 'subtitle', type: 'textarea', label: 'Sous-titre', tab: 'content', group: 'Véhicule' },
  { key: 'vs-price', propKey: 'price', type: 'text', label: 'Prix', tab: 'content', group: 'Véhicule' },
  {
    key: 'vs-image',
    propKey: 'imageAssetId',
    type: 'asset',
    label: 'Visuel véhicule',
    tab: 'media',
    group: 'Média',
    assetKey: 'imageAssetId',
    urlKey: 'imageUrl',
    altKey: 'alt',
    enableFocalPicker: true,
  },
  {
    key: 'vs-layout',
    propKey: 'layout',
    type: 'select',
    label: 'Mise en page',
    tab: 'layout',
    group: 'Mise en page',
    options: SHOWCASE_LAYOUT_OPTIONS,
    defaultValue: 'image_right',
  },
  {
    key: 'vs-visual',
    propKey: 'visualStyle',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: SHOWCASE_VISUAL_OPTIONS,
    defaultValue: 'dark_card',
  },
];

export const stickyLeadCtaInspectorControls: InspectorControl[] = [
  { key: 'sl-label', propKey: 'label', type: 'text', label: 'Libellé', tab: 'content', group: 'Contenu' },
  { key: 'sl-title', propKey: 'title', type: 'text', label: 'Titre', tab: 'content', group: 'Contenu' },
  {
    key: 'sl-primary-label',
    propKey: 'primaryCtaLabel',
    type: 'text',
    label: 'CTA principal',
    tab: 'content',
    group: 'Actions',
  },
  {
    key: 'sl-primary-href',
    propKey: 'primaryCtaHref',
    type: 'text',
    label: 'Lien CTA principal',
    tab: 'content',
    group: 'Actions',
  },
  {
    key: 'sl-secondary-label',
    propKey: 'secondaryCtaLabel',
    type: 'text',
    label: 'CTA secondaire',
    tab: 'content',
    group: 'Actions',
  },
  {
    key: 'sl-secondary-href',
    propKey: 'secondaryCtaHref',
    type: 'text',
    label: 'Lien CTA secondaire',
    tab: 'content',
    group: 'Actions',
  },
  {
    key: 'sl-sticky',
    propKey: 'stickyMode',
    type: 'select',
    label: 'Mode sticky',
    tab: 'layout',
    group: 'Mise en page',
    options: STICKY_MODE_OPTIONS,
    defaultValue: 'bottom',
  },
  {
    key: 'sl-style',
    propKey: 'style',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: STICKY_STYLE_OPTIONS,
    defaultValue: 'brand',
  },
];

export const campaignTimelineInspectorControls: InspectorControl[] = [
  { key: 'ct-title', propKey: 'title', type: 'text', label: 'Titre', tab: 'content', group: 'Contenu' },
  {
    key: 'ct-style',
    propKey: 'style',
    type: 'select',
    label: 'Style visuel',
    tab: 'design',
    group: 'Style visuel',
    options: TIMELINE_STYLE_OPTIONS,
    defaultValue: 'cards',
  },
];

export const PREMIUM_BLOCK_INSPECTOR_CONTROLS: Record<string, InspectorControl[]> = {
  premium_bento_features: premiumBentoInspectorControls,
  animated_stats_strip: animatedStatsInspectorControls,
  premium_testimonials: premiumTestimonialsInspectorControls,
  vehicle_showcase_split: vehicleShowcaseInspectorControls,
  sticky_lead_cta: stickyLeadCtaInspectorControls,
  campaign_timeline_steps: campaignTimelineInspectorControls,
};
