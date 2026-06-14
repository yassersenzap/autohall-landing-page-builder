import type { InspectorControl } from '../../block-registry/inspector-control.types';
import { buildAutoHallLeadFormFields } from '@/features/builder-engine/constants/autohall-lead-form';
import {
  buildCoreFormConfig,
  resolveCoreFieldsPreset,
  type CoreFieldsPreset,
  type CoreFormMode,
} from './core-campaign-form-landing.defaults';
import type { CoreLayoutDirection, CoreLayoutVariant } from './core-campaign-form-landing.types';
import { patchCoreLayoutFields } from './core-campaign-form-landing.layout';

const LAYOUT_DIRECTION_OPTIONS = [
  { value: 'image-left', label: 'Visuel à gauche · formulaire à droite' },
  { value: 'image-right', label: 'Visuel à droite · formulaire à gauche' },
];

const LAYOUT_VARIANT_OPTIONS = [
  { value: 'split', label: 'Split visuel + formulaire' },
  { value: 'background', label: 'Image de fond · carte formulaire' },
  { value: 'banner', label: 'Bannière pleine largeur · formulaire latéral' },
];

const VISUAL_OPTIONS = [
  { value: 'campaign_image', label: 'Campagne / bannière' },
  { value: 'vehicle_image', label: 'Modèle véhicule' },
];

const FORM_MODE_OPTIONS = [
  { value: 'test_drive', label: 'Essai / test-drive' },
  { value: 'contact', label: 'Contact rapide' },
  { value: 'callback', label: 'Rappel conseiller' },
  { value: 'model_interest', label: 'Intérêt modèle' },
];

const PRESET_OPTIONS = [
  { value: 'city_date', label: 'Ville + date' },
  { value: 'model_city', label: 'Modèle + ville' },
  { value: 'name_phone', label: 'Nom + téléphone' },
  { value: 'contact_preference', label: 'Contact + message' },
];

const OVERLAY_OPTIONS = [
  { value: 'light', label: 'Léger' },
  { value: 'medium', label: 'Moyen' },
  { value: 'strong', label: 'Fort' },
];

const STEP_OPTIONS = [
  { value: '2', label: '2 étapes (affichage)' },
  { value: '3', label: '3 étapes (affichage)' },
];

export const CORE_CAMPAIGN_FORM_LANDING_INSPECTOR_CONTROLS: InspectorControl[] = [
  {
    key: 'core-brand',
    propKey: 'brandLogoText',
    type: 'text',
    label: 'Marque / logo texte',
    tab: 'content',
    group: 'Contenu',
    placeholder: 'Auto Hall',
  },
  {
    key: 'core-title',
    propKey: 'title',
    type: 'text',
    label: 'Titre principal',
    tab: 'content',
    group: 'Contenu',
  },
  {
    key: 'core-subtitle',
    propKey: 'subtitle',
    type: 'textarea',
    label: 'Sous-titre',
    tab: 'content',
    group: 'Contenu',
  },
  {
    key: 'core-offer',
    propKey: 'offerLine',
    type: 'text',
    label: 'Ligne offre / prix',
    tab: 'content',
    group: 'Contenu',
    placeholder: 'À partir de — DH',
  },
  {
    key: 'core-primary-cta',
    propKey: 'primaryCtaLabel',
    type: 'text',
    label: 'Libellé CTA secondaire',
    tab: 'content',
    group: 'Contenu',
    placeholder: 'Laisser vide pour masquer',
  },
  {
    key: 'core-visual-type',
    propKey: 'visualType',
    type: 'select',
    label: 'Type de visuel',
    tab: 'media',
    group: 'Visuel',
    options: VISUAL_OPTIONS,
  },
  {
    key: 'core-image',
    propKey: 'imageAssetId',
    type: 'image',
    label: 'Image campagne / véhicule',
    tab: 'media',
    group: 'Visuel',
    assetKey: 'imageAssetId',
    urlKey: 'imageUrl',
    altKey: 'alt',
  },
  {
    key: 'core-overlay',
    propKey: 'overlayStrength',
    type: 'select',
    label: 'Intensité overlay',
    tab: 'media',
    group: 'Visuel',
    options: OVERLAY_OPTIONS,
    defaultValue: 'medium',
  },
  {
    key: 'core-form-title',
    propKey: 'formTitle',
    type: 'text',
    label: 'Titre du formulaire',
    tab: 'design',
    group: 'Formulaire',
  },
  {
    key: 'core-form-subtitle',
    propKey: 'formSubtitle',
    type: 'textarea',
    label: 'Sous-titre formulaire',
    tab: 'design',
    group: 'Formulaire',
  },
  {
    key: 'core-form-mode',
    propKey: 'formMode',
    type: 'select',
    label: 'Objectif formulaire',
    tab: 'design',
    group: 'Formulaire',
    options: FORM_MODE_OPTIONS,
    defaultValue: 'test_drive',
  },
  {
    key: 'core-fields-preset',
    propKey: 'fieldsPreset',
    type: 'select',
    label: 'Champs affichés',
    tab: 'design',
    group: 'Formulaire',
    options: PRESET_OPTIONS,
  },
  {
    key: 'core-step-count',
    propKey: 'stepCount',
    type: 'select',
    label: 'Indicateur d’étapes',
    tab: 'design',
    group: 'Formulaire',
    options: STEP_OPTIONS,
    defaultValue: '2',
  },
  {
    key: 'core-submit',
    propKey: 'submitText',
    type: 'text',
    label: 'Bouton envoi',
    tab: 'design',
    group: 'Formulaire',
  },
  {
    key: 'core-layout-direction',
    propKey: 'layoutDirection',
    type: 'select',
    label: 'Orientation visuel / formulaire',
    tab: 'layout',
    group: 'Mise en page',
    options: LAYOUT_DIRECTION_OPTIONS,
    defaultValue: 'image-left',
  },
  {
    key: 'core-layout-variant',
    propKey: 'layoutVariant',
    type: 'select',
    label: 'Style de mise en page',
    tab: 'layout',
    group: 'Mise en page',
    options: LAYOUT_VARIANT_OPTIONS,
    defaultValue: 'split',
  },
  {
    key: 'core-legal-note',
    propKey: 'legalNote',
    type: 'textarea',
    label: 'Mentions sous le titre',
    tab: 'advanced',
    group: 'Mentions légales',
  },
  {
    key: 'core-consent',
    propKey: 'consentLabel',
    type: 'textarea',
    label: 'Texte consentement RGPD',
    tab: 'advanced',
    group: 'Mentions légales',
  },
  {
    key: 'core-footer',
    propKey: 'footerCopyright',
    type: 'text',
    label: 'Copyright pied de section',
    tab: 'advanced',
    group: 'Mentions légales',
  },
];

export function patchCoreFormModeFields(
  formMode: CoreFormMode,
  fieldsPreset?: CoreFieldsPreset,
): Record<string, unknown> {
  const preset = resolveCoreFieldsPreset(formMode, fieldsPreset);
  const formConfig = buildCoreFormConfig(formMode, preset);
  const fields = buildAutoHallLeadFormFields(formConfig);
  return {
    formMode,
    fieldsPreset: preset,
    formConfig,
    fields,
    form: { formConfig, fields },
  };
}

export function patchCoreLayoutInspectorFields(
  layoutDirection: CoreLayoutDirection,
  layoutVariant?: CoreLayoutVariant,
): Record<string, unknown> {
  return patchCoreLayoutFields(layoutDirection, layoutVariant ?? 'split');
}
